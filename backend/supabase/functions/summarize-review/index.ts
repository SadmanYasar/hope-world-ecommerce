// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
console.log("GEMINI_API_KEY:", GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
const modelGemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model = new Supabase.ai.Session("gte-small");

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  try {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    //TODO
    //product id is a foreign key in review table
    //get list of reviews for a product id, the recent ten reviews
    //pass the relevant reviews to Gemini or gte-small to summarize
    //return the summary

    const { productId } = await req.json();
    if (!productId) {
      return new Response("Please provide a productId!", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Query reviews for the given product ID. Review table has created_at, product_id, order_id, rating (int4 from 0 to 5), comment (string)
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("created_at, product_id, order_id, rating, comment")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.log("Error querying reviews:", error);
      return new Response("Error querying reviews", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!reviews || reviews.length === 0) {
      return new Response("No reviews found for this product", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Prepare the reviews for summarization
    const reviewsText = reviews
      .map((review) => {
        return `Rating: ${review.rating}\nComment: ${review.comment}`;
      })
      .join("\n\n");

    // Generate a summary using Gemini
    const prompt = `
      You are a product review summarizer. Given the following reviews for a product, please provide a concise summary of the overall sentiment and key points mentioned by customers.
      Here are the reviews:
      ${reviewsText}
      Please summarize the reviews in a few sentences, highlighting the overall sentiment (positive, negative, or neutral) and any common themes or issues mentioned by customers.
    `;
    const { response } = await modelGemini.generateContent(prompt);
    const summary = response.text();

    return Response.json(
      { productId, summary },
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error in catch:", error);
    return Response.json(
      { error },
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/summarize-review' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
