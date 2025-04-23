"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();

    // You could verify the session with Stripe here
    // const sessionId = searchParams.get('session_id');
  }, [clearCart, searchParams]);

  return (
    <div className="checkout-success">
      <h1>Thank you for your order!</h1>
      <p>Your payment was successful.</p>
      <button
        onClick={() => router.push("/")}
        className="continue-shopping-button"
      >
        Continue Shopping
      </button>
    </div>
  );
}
