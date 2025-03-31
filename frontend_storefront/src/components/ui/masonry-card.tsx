import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { DialogOverlay } from "./dialog";
import { BaseRecord, CanAccess, usePermissions } from "@refinedev/core";
import { cn } from "@components/lib/utils";

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
  imageWidth = 500,
  imageHeight = 700,
  linkHref,
  className,
  children,
}: MasonryCardProps) => {
  return (
    <motion.div
      initial="hidden"
      whileHover="visible"
      className={cn("overflow-hidden relative rounded-lg", className)}
    >
      {linkHref ? (
        <Link href={linkHref} className="flex flex-col h-full">
          <div className="relative w-full h-full">
            <Image
              width={imageWidth}
              height={imageHeight}
              className="object-cover rounded-t-lg"
              src={imageUrl}
              alt={imageAlt}
            />
          </div>
          {children}
        </Link>
      ) : (
        <button type="button" className="flex flex-col w-full">
          <div className="relative w-full h-full min-h-[200px]">
            <Image
              width={imageWidth}
              height={imageHeight}
              className="object-cover rounded-t-lg"
              src={imageUrl}
              alt={imageAlt}
            />
          </div>
          {children}
        </button>
      )}
    </motion.div>
  );
};

export const ProductCardDetails = ({
  name,
  price,
  rating,
}: {
  name: string;
  rating: number;
  price: number;
}) => {
  return (
    <>
      <motion.div
        variants={variantsMasonryCard}
        className="hidden absolute right-0 bottom-0 left-0 flex-col justify-center items-center p-4 h-full text-white bg-black bg-opacity-40 md:flex"
      >
        <p className="self-center text-base font-medium max-sm:pb-2">{name}</p>
        <p className="absolute bottom-4 text-sm font-medium max-sm:pb-2">
          Rating {rating}
        </p>
        <p className="absolute bottom-0 text-sm font-medium max-sm:pb-2">
          ${price}
        </p>
      </motion.div>
      <div className="flex absolute right-0 bottom-0 left-0 flex-col justify-between items-center p-4 text-white bg-black bg-opacity-40 md:hidden">
        <p className="text-sm max-sm:pb-2">{name}</p>
        <p className="text-sm max-sm:pb-2">Rating {rating}</p>
        <p className="text-sm max-sm:pb-2">${price}</p>
      </div>
    </>
  );
};
