import Stripe from "https://esm.sh/stripe@18.0.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0?target=denonext";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2025-05-28.basil"
});
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();
// Create a Supabase client
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
console.log("Hello from Stripe Webhook!");
Deno.serve(async (request)=>{
  const signature = request.headers.get("Stripe-Signature");
  const body = await request.text();
  let receivedEvent;
  try {
    console.log("Stripe signature and body", signature, body);
    receivedEvent = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SIGNIN_SECRET"), undefined, cryptoProvider);
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return new Response(err?.message, {
      status: 400
    });
  }
  console.log(`🔔 Event received: ${receivedEvent.type}`);
  // Handle different event types
  try {
    switch(receivedEvent.type){
      case "checkout.session.completed":
        await handleCheckoutCompleted(receivedEvent.data.object);
        break;
      case "payment_intent.succeeded":
        console.log("✅ Payment succeeded:", receivedEvent.data.object.id);
        await handleCheckoutCompleted(receivedEvent.data.object);
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
      status: 500
    });
  }
  return new Response(JSON.stringify({
    ok: true
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
});
// async function handleCheckoutCompleted(session) {
//   console.log("🛒 Processing checkout completion:", session.id);
//   const { metadata, amount_total } = session;
//   // Validate required metadata
//   if (!metadata?.userId || !metadata?.items) {
//     console.error("❌ Missing required metadata:", {
//       hasUserId: !!metadata?.userId,
//       hasItems: !!metadata?.items,
//     });
//     console.log("Metadata:", metadata);
//     throw new Error("Missing required metadata: userId or items");
//   }
//   const userId = metadata.userId;
//   let items;
//   try {
//     items = JSON.parse(metadata.items);
//   } catch (error) {
//     console.error("❌ Invalid items JSON in metadata:", error);
//     throw new Error("Invalid items JSON in metadata");
//   }
//   // Validate items structure
//   if (!Array.isArray(items) || items.length === 0) {
//     console.error("❌ Invalid items array:", items);
//     throw new Error("Items must be a non-empty array");
//   }
//   // Validate each item has required fields
//   for (const item of items) {
//     if (!item.id || !item.quantity || item.quantity <= 0) {
//       console.error("❌ Invalid item structure:", item);
//       throw new Error(`Invalid item structure: ${JSON.stringify(item)}`);
//     }
//   }
//   console.log("📦 Creating order:", {
//     userId,
//     sessionId: session.id,
//     totalAmount: amount_total,
//     itemsCount: items.length,
//   });
//   // Call the RPC function to create the order
//   const { data: result, error } = await supabase.rpc(
//     "create_order_from_stripe",
//     {
//       p_user_id: userId,
//       p_stripe_session_id: session.id,
//       p_total_amount: amount_total,
//       p_items: items,
//     }
//   );
//   if (error) {
//     console.error("❌ RPC call failed:", error);
//     throw new Error(`RPC call failed: ${error.message}`);
//   }
//   if (!result?.success) {
//     console.error("❌ Order creation failed:", result);
//     throw new Error(
//       `Order creation failed: ${result?.error || "Unknown error"}`
//     );
//   }
//   console.log("✅ Order created successfully:", {
//     orderId: result.order_id,
//     productsCount: result.products_count,
//     totalAmount: result.total_amount,
//   });
//   // Optional: Send confirmation email or other post-processing
//   await postOrderProcessing(result, session);
// }
// async function postOrderProcessing(orderResult, session) {
//   // This is where you could add additional processing like:
//   // - Send order confirmation email
//   // - Update inventory
//   // - Trigger fulfillment process
//   // - Send webhooks to other services
//   console.log("📧 Post-order processing for order:", orderResult.order_id);
//   try {
//     // Example: Log order details for external systems
//     const orderSummary = {
//       orderId: orderResult.order_id,
//       stripeSessionId: session.id,
//       customerEmail: session.customer_email,
//       totalAmount: orderResult.total_amount,
//       currency: session.currency,
//       paymentStatus: session.payment_status,
//       createdAt: new Date().toISOString()
//     };
//     console.log("📋 Order Summary:", JSON.stringify(orderSummary, null, 2));
//   // Here you could call external APIs, send emails, etc.
//   // Example:
//   // await sendOrderConfirmationEmail(orderSummary);
//   // await updateInventorySystem(orderResult.created_products);
//   } catch (error) {
//     console.error("⚠️  Post-processing error (non-critical):", error);
//   // Don't throw here - order was already created successfully
//   }
// }
async function handleCheckoutCompleted(session) {
  console.log("🛒 Processing checkout completion:", session.id);
  const { metadata, amount_total } = session;
  // Validate required metadata
  if (!metadata?.userId || !metadata?.items) {
    console.error("❌ Missing required metadata:", {
      hasUserId: !!metadata?.userId,
      hasItems: !!metadata?.items
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
  // Extract customer information from completed session
  const customerEmail = session.customer_email || session.customer_details?.email || null;
  const customerPhone = session.customer_details?.phone || null;
  // Extract billing address from customer_details
  let billingAddress = null;
  if (session.customer_details?.address) {
    const address = session.customer_details.address;
    billingAddress = {
      name: session.customer_details.name || null,
      line1: address.line1 || null,
      line2: address.line2 || null,
      city: address.city || null,
      state: address.state || null,
      postal_code: address.postal_code || null,
      country: address.country || null
    };
  }
  // Extract shipping address from shipping_details
  let shippingAddress = null;
  if (session.shipping_details?.address) {
    const address = session.shipping_details.address;
    shippingAddress = {
      name: session.shipping_details.name || null,
      line1: address.line1 || null,
      line2: address.line2 || null,
      city: address.city || null,
      state: address.state || null,
      postal_code: address.postal_code || null,
      country: address.country || null,
      phone: session.shipping_details.phone || null
    };
  }
  // Log what we extracted for debugging
  console.log("📋 Extracted customer info:", {
    customerEmail,
    customerPhone,
    billingAddress,
    shippingAddress,
    hasCustomerDetails: !!session.customer_details,
    hasShippingDetails: !!session.shipping_details,
    sessionStatus: session.status,
    paymentStatus: session.payment_status
  });
  // Validate items structure
  if (!Array.isArray(items) || items.length === 0) {
    console.error("❌ Invalid items array:", items);
    throw new Error("Items must be a non-empty array");
  }
  // Validate each item has required fields
  for (const item of items){
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
    customerEmail,
    customerPhone,
    hasBillingAddress: !!billingAddress,
    hasShippingAddress: !!shippingAddress
  });
  // Call the RPC function to create the order
  const { data: result, error } = await supabase.rpc("create_order_from_stripe", {
    p_user_id: userId,
    p_stripe_session_id: session.id,
    p_total_amount: amount_total,
    p_items: items,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone,
    p_billing_address: billingAddress,
    p_shipping_address: shippingAddress
  });
  if (error) {
    console.error("❌ RPC call failed:", error);
    throw new Error(`RPC call failed: ${error.message}`);
  }
  if (!result?.success) {
    console.error("❌ Order creation failed:", result);
    throw new Error(`Order creation failed: ${result?.error || "Unknown error"}`);
  }
  console.log("✅ Order created successfully:", {
    orderId: result.order_id,
    productsCount: result.products_count,
    totalAmount: result.total_amount,
    customerEmail: result.customer_email,
    customerPhone: result.customer_phone,
    hasBillingAddress: !!result.billing_address,
    hasShippingAddress: !!result.shipping_address
  });
  // Optional: Send confirmation email or other post-processing
  await postOrderProcessing(result, session);
}
async function postOrderProcessing(orderResult, session) {
  console.log("📧 Post-order processing for order:", orderResult.order_id);
  try {
    // Get detailed order information including products
    const { data: orderData, error: orderError } = await supabase.from("orders").select(`
        id,
        total_amount,
        customer_email,
        customer_phone,
        shipping_address,
        billing_address,
        tracking_id,
        created_at,
        order_products (
          quantity,
          price_at_time,
          product: product_id (
            name,
            images
          )
        )
      `).eq("id", orderResult.order_id).single();
    if (orderError) {
      console.error("❌ Error fetching order details:", orderError);
      return;
    }
    if (!orderData.customer_email) {
      console.log("📧 No customer email found, skipping email notification");
      return;
    }
    // Create email content
    const emailSubject = `Order Confirmation - #${orderData.tracking_id}`;
    const emailHtml = generateOrderConfirmationEmail(orderData, session, orderData.tracking_id);
    // Send email directly using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY not found in environment variables");
      return;
    }
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [
          orderData.customer_email
        ],
        subject: emailSubject,
        html: emailHtml
      })
    });
    const emailResult = await emailResponse.json();
    if (emailResponse.ok) {
      console.log("✅ Order confirmation email sent successfully:", {
        emailId: emailResult.id,
        to: orderData.customer_email,
        orderId: orderResult.order_id,
        trackingId: orderData.tracking_id
      });
    } else {
      console.error("❌ Failed to send order confirmation email:", emailResult);
    }
    // Log order summary for external systems
    const orderSummary = {
      orderId: orderResult.order_id,
      trackingId: orderData.tracking_id,
      stripeSessionId: session.id,
      customerEmail: orderData.customer_email,
      customerPhone: orderData.customer_phone,
      totalAmount: orderResult.total_amount,
      currency: session.currency,
      paymentStatus: session.payment_status,
      itemsCount: orderData.order_products.length,
      createdAt: new Date().toISOString()
    };
    console.log("📋 Order Summary:", JSON.stringify(orderSummary, null, 2));
  } catch (error) {
    console.error("❌ Error in post-order processing:", error);
  }
}
function generateOrderConfirmationEmail(orderData, session, trackingId) {
  // Dynamic currency formatting function
  const formatCurrency = (amount, currency = "usd")=>{
    const currencyCode = currency.toUpperCase();
    const amountInMajorUnit = amount / 100;
    // Currency symbol mapping
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      SGD: "S$",
      MYR: "RM",
      THB: "฿",
      BDT: "৳",
      INR: "₹",
      CNY: "¥",
      KRW: "₩",
      HKD: "HK$",
      CHF: "CHF",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr",
      PLN: "zł",
      CZK: "Kč",
      HUF: "Ft",
      RUB: "₽",
      BRL: "R$",
      MXN: "MX$"
    };
    const symbol = currencySymbols[currencyCode] || currencyCode + " ";
    // For currencies that don't use decimal places (like JPY, KRW)
    const noDecimalCurrencies = [
      "JPY",
      "KRW",
      "BIF",
      "CLP",
      "DJF",
      "GNF",
      "ISK",
      "KMF",
      "PYG",
      "RWF",
      "UGX",
      "VND",
      "VUV",
      "XAF",
      "XOF",
      "XPF"
    ];
    if (noDecimalCurrencies.includes(currencyCode)) {
      return `${symbol}${Math.round(amountInMajorUnit).toLocaleString()}`;
    }
    return `${symbol}${amountInMajorUnit.toFixed(2)}`;
  };
  const formatDate = (dateString)=>new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  // Get currency from session, fallback to 'usd'
  const currency = session.currency || "usd";
  // Calculate order summary
  const itemsHtml = orderData.order_products.map((item)=>`
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0;">
        <div style="display: flex; align-items: center;">
          ${item.product.images ? `<img src="${JSON.parse(item.product.images)?.[0].url}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;">` : ""}
          <div>
            <div style="font-weight: 600; color: #1f2937;">${item.product.name}</div>
            <div style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">
        ${formatCurrency(item.price_at_time * item.quantity, currency)}
      </td>
    </tr>
  `).join("");
  const shippingAddressHtml = orderData.shipping_address ? `
    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1f2937;">Shipping Address</h3>
      <div style="color: #4b5563; line-height: 1.5;">
        ${orderData.shipping_address.name ? `<div style="font-weight: 600;">${orderData.shipping_address.name}</div>` : ""}
        ${orderData.shipping_address.line1 ? `<div>${orderData.shipping_address.line1}</div>` : ""}
        ${orderData.shipping_address.line2 ? `<div>${orderData.shipping_address.line2}</div>` : ""}
        <div>
          ${orderData.shipping_address.city ? `${orderData.shipping_address.city}, ` : ""}
          ${orderData.shipping_address.state ? `${orderData.shipping_address.state} ` : ""}
          ${orderData.shipping_address.postal_code || ""}
        </div>
        ${orderData.shipping_address.country ? `<div>${orderData.shipping_address.country}</div>` : ""}
      </div>
    </div>
  ` : "";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Hope World</h1>
          <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px;">Order Confirmation</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Thank you message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Thank you for your order!</h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
              We've received your order and will send you a shipping confirmation email as soon as your items ship.
            </p>
          </div>

          <!-- Order details -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <div style="margin-bottom: 16px;">
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">Order #${trackingId}</h3>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Placed on ${formatDate(orderData.created_at)}</p>
              </div>
              <div style="margin-top: 16px;">
                <div style="font-size: 24px; font-weight: 700; color: #1f2937;">${formatCurrency(orderData.total_amount, currency)}</div>
                <div style="color: #059669; font-size: 14px; font-weight: 600;">Paid</div>
              </div>
            </div>
          </div>

          <!-- Order items -->
          <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 16px 0; font-weight: 700; color: #1f2937; font-size: 16px;">Total</td>
                <td style="padding: 16px 0; text-align: right; font-weight: 700; color: #1f2937; font-size: 16px;">
                  ${formatCurrency(orderData.total_amount, currency)}
                </td>
              </tr>
            </table>
          </div>

          <!-- Shipping address -->
          ${shippingAddressHtml}

          <!-- Customer support -->
          <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #92400e;">Need Help?</h3>
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
              If you have any questions about your order, please contact our customer support team. 
              We're here to help!
            </p>
          </div>

          <!-- Tracking info -->
          <div style="text-align: center; padding: 24px; background-color: #f0f9ff; border-radius: 12px; border: 1px solid #0ea5e9;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0c4a6e;">Track Your Order</h3>
            <p style="margin: 0 0 16px 0; color: #075985; font-size: 14px;">
              Your order tracking ID is: <strong>${trackingId}</strong>
            </p>
            <p style="margin: 0; color: #075985; font-size: 14px;">
              You'll receive shipping updates at this email address.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            Thank you for shopping with Hope World!
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Hope World. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
