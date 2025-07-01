import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, StarIcon } from "lucide-react";
import { useCreate } from "@refinedev/core";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  orderId: string;
  productName: string;
}

export function ReviewForm({
  isOpen,
  onClose,
  productId,
  orderId,
  productName,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { mutate } = useCreate();

  const handleSubmit = async () => {
    if (rating === 0) {
      // Validate rating is selected
      return;
    }

    setIsSubmitting(true);

    mutate(
      {
        resource: "reviews",
        values: {
          product_id: productId,
          order_id: orderId,
          rating: Number(rating), // Ensure rating is a number
          comment: comment.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          // Reset form
          setRating(0);
          setComment("");
          onClose();
        },
        onError: (error) => {
          console.error("Review submission failed:", error);
          setIsSubmitting(false);
          // Add user feedback here if needed
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Product: {productName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Rating</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  {star <= rating ? (
                    <StarIcon className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Star className="w-6 h-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Your Review (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Write your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
