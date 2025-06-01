"use client";

import * as React from "react";
import { Star, StarHalf } from "lucide-react";

interface RatingProps {
  rating: number;
  max?: number;
  className?: string;
}

export function Rating({ rating, max = 5, className }: RatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {/* Render full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-primary"
          aria-hidden="true"
        />
      ))}

      {/* Render half star if needed */}
      {hasHalfStar && (
        <StarHalf
          className="w-4 h-4 fill-primary text-primary"
          aria-hidden="true"
        />
      )}

      {/* Render empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-muted-foreground"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
