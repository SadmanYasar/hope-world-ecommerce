import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Received payload:", payload);
    // Extract product_id from webhook payload
    const product_id =
      payload.record?.product_id || payload.old_record?.product_id;
    if (!product_id) {
      console.log("No product_id found in payload");
      return new Response("ok - no product_id");
    }
    console.log("Processing product_id:", product_id);
    // Get all reviews for this product
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", product_id);
    if (reviewsError) {
      console.warn("Error fetching reviews:", reviewsError.message);
      return new Response("error fetching reviews");
    }
    console.log("Found reviews:", reviews);
    // Calculate average rating
    let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce(
        (total, review) => total + (review.rating || 0),
        0
      );
      averageRating = sum / reviews.length;
      // Round to 2 decimal places
      averageRating = Math.round(averageRating * 100) / 100;
    }
    console.log("Calculated average rating:", averageRating);
    // Update the products table
    const { error: updateError } = await supabase
      .from("products")
      .update({
        rating: averageRating,
      })
      .eq("id", product_id);
    if (updateError) {
      console.warn("Error updating product rating:", updateError.message);
      return new Response("error updating product");
    }
    console.log(
      `Successfully updated product ${product_id} rating to ${averageRating}`
    );
    // Verify the update worked
    const { data: updatedProduct, error: fetchError } = await supabase
      .from("products")
      .select("id, rating")
      .eq("id", product_id)
      .single();
    if (fetchError) {
      console.warn("Error fetching updated product:", fetchError.message);
    } else {
      console.log("Product after update:", updatedProduct);
    }
    return new Response("ok");
  } catch (error) {
    console.warn("Function error:", error.message);
    return new Response("error");
  }
});
