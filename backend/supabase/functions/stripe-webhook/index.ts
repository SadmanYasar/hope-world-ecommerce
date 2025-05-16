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
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

console.log("Hello from Stripe Webhook!");

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return new Response((err as Error)?.message, { status: 400 });
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`);
  
  // Handle the event
  if (receivedEvent.type === 'checkout.session.completed') {
    const session = receivedEvent.data.object as Stripe.Checkout.Session;
    
    try {
      // Retrieve the session with line items to get complete order details
      const expandedSession = await stripe.checkout.sessions.retrieve(
        session.id,
        { expand: ['line_items', 'customer'] }
      );
      
      // Extract customer information
      const customer = expandedSession.customer_details;
      const lineItems = expandedSession.line_items?.data || [];
      
      // Create order object
      const orderData = {
        stripe_session_id: session.id,
        user_email: customer?.email || '',
        status: 'paid',
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        shipping_address: {
          name: customer?.name || '',
          address: customer?.address || {}
        },
        items: lineItems.map(item => ({
          name: item.description || '',
          quantity: item.quantity || 0,
          price: item.amount_total ? item.amount_total / 100 : 0,
          product_id: item.price?.product || ''
        })),
        metadata: session.metadata || {},
        created_at: new Date().toISOString()
      };
      
      // Insert the order into the database
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData);
        
      if (error) {
        console.error('Error inserting order:', error);
        return new Response(JSON.stringify({ error: 'Failed to create order' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log('Order created successfully:', session.id);
    } catch (err) {
      console.error('Error processing payment success:', err);
      return new Response(JSON.stringify({ error: 'Error processing payment' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ ok: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});
