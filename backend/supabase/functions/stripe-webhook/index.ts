// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Import via bare specifier thanks to the import_map.json file.
import Stripe from "https://esm.sh/stripe@18.0.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0?target=denonext";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2025-03-31.basil",
});
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Create a Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string,
);

console.log("Hello from Stripe Webhook!");

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");
  const body = await request.text();
  let receivedEvent;

  try {
    console.log("Stripe signature and body", signature, body);
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNIN_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return new Response((err as Error)?.message, { status: 400 });
  }

  console.log(`🔔 Event received: ${receivedEvent.type}`);

  // Handle different event types
  try {
    switch (receivedEvent.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          receivedEvent.data.object as Stripe.Checkout.Session,
        );
        break;

      case "payment_intent.succeeded":
        console.log("✅ Payment succeeded:", receivedEvent.data.object.id);
        await handleCheckoutCompleted(
          receivedEvent.data.object as Stripe.Checkout.Session,
        );
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Payment failed:", receivedEvent.data.object.id);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${receivedEvent.type}`);
    }
  } catch (error) {
    console.error(`❌ Error handling event ${receivedEvent.type}:`, error);
    return new Response(`Error processing ${receivedEvent.type}`, {
      status: 500,
    });
  }

  // return new Response(
  //   JSON.stringify({
  //     received: true,
  //     event_id: receivedEvent.id,
  //     event_type: receivedEvent.type,
  //   }),
  //   {
  //     status: 200,
  //     headers: { "Content-Type": "application/json" },
  //   }
  // );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🛒 Processing checkout completion:", session.id);

  const { metadata, amount_total } = session;

  // Validate required metadata
  if (!metadata?.userId || !metadata?.items) {
    console.error("❌ Missing required metadata:", {
      hasUserId: !!metadata?.userId,
      hasItems: !!metadata?.items,
    });
    console.log("Metadata:", metadata);
    throw new Error("Missing required metadata: userId or items");
  }

  const userId = metadata.userId;
  let items;

  try {
    items = JSON.parse(metadata.items);
  } catch (error) {
    console.error("❌ Invalid items JSON in metadata:", error);
    throw new Error("Invalid items JSON in metadata");
  }

  // Validate items structure
  if (!Array.isArray(items) || items.length === 0) {
    console.error("❌ Invalid items array:", items);
    throw new Error("Items must be a non-empty array");
  }

  // Validate each item has required fields
  for (const item of items) {
    if (!item.id || !item.quantity || item.quantity <= 0) {
      console.error("❌ Invalid item structure:", item);
      throw new Error(`Invalid item structure: ${JSON.stringify(item)}`);
    }
  }

  console.log("📦 Creating order:", {
    userId,
    sessionId: session.id,
    totalAmount: amount_total,
    itemsCount: items.length,
  });

  // Call the RPC function to create the order
  const { data: result, error } = await supabase.rpc(
    "create_order_from_stripe",
    {
      p_user_id: userId,
      p_stripe_session_id: session.id,
      p_total_amount: amount_total,
      p_items: items,
    },
  );

  if (error) {
    console.error("❌ RPC call failed:", error);
    throw new Error(`RPC call failed: ${error.message}`);
  }

  if (!result?.success) {
    console.error("❌ Order creation failed:", result);
    throw new Error(
      `Order creation failed: ${result?.error || "Unknown error"}`,
    );
  }

  console.log("✅ Order created successfully:", {
    orderId: result.order_id,
    productsCount: result.products_count,
    totalAmount: result.total_amount,
  });

  // Optional: Send confirmation email or other post-processing
  await postOrderProcessing(result, session);
}

async function postOrderProcessing(
  orderResult: any,
  session: Stripe.Checkout.Session,
) {
  // This is where you could add additional processing like:
  // - Send order confirmation email
  // - Update inventory
  // - Trigger fulfillment process
  // - Send webhooks to other services

  console.log("📧 Post-order processing for order:", orderResult.order_id);

  try {
    // Example: Log order details for external systems
    const orderSummary = {
      orderId: orderResult.order_id,
      stripeSessionId: session.id,
      customerEmail: session.customer_email,
      totalAmount: orderResult.total_amount,
      currency: session.currency,
      paymentStatus: session.payment_status,
      createdAt: new Date().toISOString(),
    };

    console.log("📋 Order Summary:", JSON.stringify(orderSummary, null, 2));

    // Here you could call external APIs, send emails, etc.
    // Example:
    // await sendOrderConfirmationEmail(orderSummary);
    // await updateInventorySystem(orderResult.created_products);
  } catch (error) {
    console.error("⚠️  Post-processing error (non-critical):", error);
    // Don't throw here - order was already created successfully
  }
}
