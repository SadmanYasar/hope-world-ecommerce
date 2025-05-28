"use server";

import { PUBLIC_URL } from "supabase-package/utils/constants";
// import { createSupabaseServerClient } from "supabase-package/server";
import { redirect } from "next/navigation";
// import stripe from "stripe-package";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2025-03-31.basil",
});

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CustomerInfo = {
  email?: string;
  name?: string;
  userId?: string;
};

export async function createCheckoutSession(
  items: CartItem[],
  customerInfo?: CustomerInfo
) {
  if (!items.length) {
    throw new Error("Cart is empty");
  }

  // Validate required userId
  if (!customerInfo?.userId) {
    throw new Error("User ID is required for checkout");
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
        userId: customerInfo.userId,
        items: JSON.stringify(
          items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          }))
        ),
      },
      customer_email: customerInfo?.email,
      // billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      // automatic_tax: {
      //   enabled: true,
      // },
      shipping_address_collection: {
        allowed_countries: ["BD", "MY", "SK", "TH", "JP"],
      },
      // customer_update: {
      //   address: "auto",
      //   name: "auto",
      // },
    });

    url = checkoutSession.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }

  // Redirect to the checkout session URL
  redirect(url ? url : "/cart?error=checkout_session_failed");
}
