"use server";

import { PUBLIC_URL } from "@utils/supabase/constants";
import { redirect } from "next/navigation";
//TODO - MAY NEED TO USE PACKAGE VERSION
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export async function createCheckoutSession(items: CartItem[]) {
  if (!items.length) {
    throw new Error("Cart is empty");
  }

  let url;

  try {
    // Transform cart items to Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${PUBLIC_URL}/checkout/success`,
      cancel_url: `${PUBLIC_URL}/cart?error=transaction_cancelled`,
      metadata: {
        cartItemCount: items.length.toString(),
      },
    });

    url = checkoutSession.url;

    // Simple return with just the URL - no redirection attempt
    // return { url: checkoutSession.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }

  // Redirect to the checkout session URL
  redirect(url ? url : "/cart?error=checkout_session_failed");
}
