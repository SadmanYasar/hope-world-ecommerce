import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { DialogOverlay } from "./dialog";
import {
  BaseRecord,
  CanAccess,
  useNotification,
  usePermissions,
} from "@refinedev/core";
import { cn } from "@components/lib/utils";
import { Rating } from "./rating";
import { Button } from "./button";
import { useCartStore, CartItem } from "@/store/cart-store";
import { ShoppingCart } from "lucide-react";

export const variantsMasonryCard: Variants = {
  hidden: {
    y: "0%",
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

type MasonryCardProps = {
  imageUrl: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  linkHref?: string;
  className?: string;
  children?: React.ReactNode;
};

export const MasonryCard = ({
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  linkHref,
  className,
  children,
}: MasonryCardProps) => {
  return (
    <motion.div
      initial="hidden"
      whileHover="visible"
      className={cn("overflow-hidden relative bg-none", className)}
    >
      {linkHref ? (
        <Link href={linkHref} className="flex flex-col">
          <div className="relative">
            <Image
              width={imageWidth}
              height={imageHeight}
              // style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
              className="object-cover rounded"
              src={imageUrl}
              alt={imageAlt}
            />
          </div>
          {children}
        </Link>
      ) : (
        <div className="flex flex-col cursor-pointer">
          <Image
            width={imageWidth}
            height={imageHeight}
            style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
            className="object-cover rounded"
            src={imageUrl}
            alt={imageAlt}
          />
          {children}
        </div>
      )}
    </motion.div>
  );
};

export const AddToCartButton = ({
  product,
  className,
  showLabel = true,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
  };
  className?: string;
  showLabel?: boolean;
}) => {
  const addItem = useCartStore((state) => state.addItem);
  const { open } = useNotification();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent elements' click events
    e.preventDefault();

    const images = JSON.parse(product.images || "[]");
    const imageUrl = images[0]?.url || "";

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: imageUrl,
    };

    addItem(cartItem);
    open?.({
      message: `$${product.name} added to cart`,
      type: "success",
    });
  };

  return (
    <Button
      onClick={handleAddToCart}
      size="sm"
      variant="secondary"
      className={cn("bg-white text-black hover:bg-gray-200", className)}
    >
      <ShoppingCart className="w-4 h-4 mr-1" />
      {showLabel && "Add to Cart"}
    </Button>
  );
};

export const ProductCardDetails = ({
  name,
  price,
  rating,
  product,
}: {
  name: string;
  rating: number;
  price: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string;
  };
}) => {
  return (
    <>
      <motion.div
        variants={variantsMasonryCard}
        className="absolute bottom-0 left-0 right-0 flex-col items-center justify-center hidden h-full p-4 text-white bg-black bg-opacity-40 md:flex"
      >
        <p className="self-center text-base font-medium max-sm:pb-2">{name}</p>
        <Rating rating={rating} />
        <p className="mb-2 text-sm font-medium max-sm:pb-2">${price}</p>
        {product && <AddToCartButton product={product} className="mt-2" />}
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-between p-4 text-white bg-black bg-opacity-40 md:hidden">
        <p className="text-sm max-sm:pb-2">{name}</p>
        <Rating rating={rating} />
        <p className="mb-2 text-sm max-sm:pb-2">${price}</p>
        {product && <AddToCartButton product={product} className="mt-2" />}
      </div>
    </>
  );
};
