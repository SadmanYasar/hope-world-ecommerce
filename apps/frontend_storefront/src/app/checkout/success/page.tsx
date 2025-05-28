"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingBag } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Thank you for your order! Your payment was processed successfully.
          </p>
          <Button onClick={() => router.push("/")} className="w-full" size="lg">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
