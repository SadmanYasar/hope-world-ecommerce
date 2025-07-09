import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import Image from "next/image";
import {
  formatCurrency,
  getCurrentStatus,
  getSortedStatuses,
  getStatusColor,
  getStatusIcon,
} from "../utils/orderUtils";

interface Product {
  id: number;
  name: string;
  images?: string;
}

interface OrderProduct {
  id: number;
  product: Product;
  quantity: number;
  price_at_time: number;
}

interface StatusItem {
  status: string;
  date?: string;
}

interface Order {
  id: string | number;
  tracking_id?: string | number;
  created_at: string;
  total_amount: number;
  status: StatusItem[];
  order_products: OrderProduct[];
}

interface Review {
  product_id: number;
}

interface OrderDetailsProps {
  order: Order | null;
  reviews: Review[];
  isLoading: boolean;
  onReviewClick: (
    productId: number,
    productName: string,
    orderId: string
  ) => void;
}

export default function OrderDetails({
  order,
  reviews,
  isLoading,
  onReviewClick,
}: OrderDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-40" />
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Select an order to view details.</p>
        </CardContent>
      </Card>
    );
  }

  const isOrderDelivered = getCurrentStatus(order.status) === "Delivered";
  const hasBeenReviewed = (productId: number) =>
    reviews.some((r) => r.product_id === productId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold">
            Order #{order.tracking_id || order.id}
          </h3>
          <p className="text-sm text-muted-foreground">
            Placed: {new Date(order.created_at).toLocaleDateString()}
          </p>
          <p>Total: {formatCurrency(order.total_amount)}</p>
        </div>

        <Separator />

        {/* Order Timeline */}
        <div>
          <h3 className="font-semibold">Order Status</h3>
          <div className="space-y-2">
            {getSortedStatuses(order.status).map((s, i, arr) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(
                      s.status
                    )}`}
                  />
                  {i < arr.length - 1 && (
                    <div className="w-px h-6 bg-gray-300" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(s.status)}
                    <p className="font-medium">{s.status}</p>
                  </div>
                  {s.date && (
                    <p className="text-sm text-muted-foreground">{s.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-3">
          <h3 className="font-semibold">Items</h3>
          {order.order_products.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-md bg-muted"
            >
              <div className="flex gap-2">
                <Image
                  src={
                    item.product.images
                      ? JSON.parse(item.product.images)[0]?.url
                      : "/logo.png"
                  }
                  alt=""
                  width={40}
                  height={40}
                />
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p>{formatCurrency(item.price_at_time * item.quantity)}</p>
                {isOrderDelivered &&
                  (hasBeenReviewed(item.product.id) ? (
                    <Badge variant="outline">
                      <Star className="w-4 h-4 text-yellow-500" /> Reviewed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        onReviewClick(
                          item.product.id,
                          item.product.name,
                          order.id.toString()
                        )
                      }
                    >
                      Add Review
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { OrderDetails };
