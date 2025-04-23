"use client";
import React, { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { loadStripe } from "@stripe/stripe-js";
import { Authenticated } from "@refinedev/core";
import { createCheckoutSession } from "../actions/checkout";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CartPage = () => {
  const {
    items,
    totalItems,
    totalPrice,
    clearCart,
    removeItem,
    updateQuantity,
  } = useCartStore();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleCheckout = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // Use the server action to create a checkout session
    await createCheckoutSession(items);

    // if (!response || !response.url) {
    //   console.error("Invalid checkout session response:", response);
    //   alert("Unable to proceed to checkout. Please try again.");
    //   return;
    // }

    // console.log("Checkout session created:", response.url);

    // // Direct navigation approach
    // window.open(response.url, "_self");

    // // Fallback approach with slight delay
    // setTimeout(() => {
    //   if (location.href !== response.url) {
    //     console.log("Using fallback redirect...");
    //     location.replace(response.url!);
    //   }
    // }, 1000);
    // } catch (err) {
    //   console.error("Error during checkout:", err);
    //   alert("Something went wrong. Please try again later.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Authenticated key={"cart-page"}>
      <div className="container p-6 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="mb-6 text-xl text-muted-foreground">
              Your cart is empty.
            </p>
            <Button asChild>
              <a href="/">Continue Shopping</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Cart Items (Left Side) */}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-xl font-semibold">
                Items ({totalItems})
              </h2>
              <ul className="space-y-6">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex items-start p-4">
                      <div className="flex-shrink-0 mr-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-16 h-16 rounded"
                          width={64}
                          height={64}
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          {item.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} per item
                        </p>
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() =>
                              item.quantity > 1 &&
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-red-500"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <p className="mt-2 font-medium">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </ul>
            </div>

            {/* Order Summary (Right Side) */}
            <div>
              <Card className="sticky shadow-md top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Items ({totalItems}):
                    </span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Authenticated>
  );
};

export default CartPage;
