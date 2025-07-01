"use client";
import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { loadStripe } from "@stripe/stripe-js";
import { Authenticated, useGetIdentity, useMany } from "@refinedev/core";
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
import Link from "next/link";
import { ArrowLeftCircle } from "lucide-react";
import { UserData } from "@types";

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
    setItems,
  } = useCartStore();
  const [loading, setLoading] = useState(false);
  const { data: user } = useGetIdentity<UserData>();

  const router = useRouter();

  const handleCheckout = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // Use the server action to create a checkout session
    await createCheckoutSession(items, {
      userId: user?.id,
      email: user?.email,
    });
  };

  //validate whether the products exist in supabase
  const { error, refetch } = useMany({
    resource: "products",
    liveParams: {
      ids: items.map((item) => item.id),
    },
    ids: items.map((item) => item.id),
    liveMode: "manual",
    onLiveEvent: async (event) => {
      console.log("Live event received:", event);
      await refetch();
    },
    queryOptions: {
      enabled: items.length > 0,
      onSuccess: (data) => {
        console.log("Fetched products:", data.data);
        console.log("Current cart items:", items);

        // Enhanced debugging
        console.log(
          "Product IDs from database:",
          data.data.map((p) => String(p.id))
        );
        console.log(
          "Cart item IDs:",
          items.map((item) => item.id)
        );

        // More robust comparison
        const validItems = items.filter((item) => {
          const matches = data.data.some((product) => {
            const productIdStr = String(product.id);
            const itemIdStr = String(item.id);
            const matches = productIdStr === itemIdStr;
            console.log(
              `Comparing: product ID ${productIdStr} with cart item ID ${itemIdStr}: ${matches}`
            );
            return matches;
          });
          return matches;
        });

        console.log("Valid items after filtering:", validItems);

        if (validItems.length === 0 && items.length > 0) {
          console.warn("No valid items found despite having cart items!");
          // If no valid items found but we have items in cart, use cart items as fallback
          setItems(items);
          return;
        }

        // Update the cart state with valid items
        const updatedItems = validItems.map((item) => {
          const product = data.data.find(
            (p) => String(p.id) === String(item.id)
          );

          // Parse the images JSON string if it exists
          let imageUrl = item.image || ""; // Keep existing image as fallback
          if (product?.images) {
            try {
              const imagesData = JSON.parse(product.images);
              // Extract the first image URL if available
              if (Array.isArray(imagesData) && imagesData.length > 0) {
                // Try various possible properties where the image URL might be stored
                imageUrl =
                  imagesData[0].url ||
                  imagesData[0].name ||
                  imagesData[0].thumbUrl ||
                  "";
                console.log("Found image URL:", imageUrl);
              } else if (
                typeof imagesData === "object" &&
                imagesData !== null
              ) {
                imageUrl = imagesData.url || "";
              }
            } catch (e) {
              console.error(
                "Error parsing images JSON:",
                e,
                "Raw images data:",
                product.images
              );
            }
          }

          return {
            id: item.id,
            name: product?.name || item.name,
            price: product?.price || item.price,
            quantity: item.quantity,
            image: imageUrl || "/placeholder-image.jpg", // Fallback to placeholder
          };
        });

        console.log("Updated cart items:", updatedItems);
        setItems(updatedItems);
      },
    },
    meta: {
      select: "id, name, price, images",
    },
  });

  if (error) {
    console.error("Error fetching products:", error);
    return <p>Error loading cart items.</p>;
  }

  return (
    <Authenticated key={"cart-page"}>
      <div className="container p-6 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">
          <span>
            <Link href={"/"}>
              <ArrowLeftCircle className="w-5 h-5 text-black" />
            </Link>{" "}
          </span>
          Your Cart
        </h1>
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
                          src={item.image || "/placeholder-image.jpg"}
                          alt={item.name}
                          className="object-cover w-16 h-16 rounded"
                          width={64}
                          height={64}
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            (e.target as HTMLImageElement).src =
                              "/placeholder-image.jpg";
                          }}
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
