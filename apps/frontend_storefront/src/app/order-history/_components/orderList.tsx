import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { formatCurrency, getStatusIcon } from "../utils/orderUtils";

interface Order {
  id: string;
  tracking_id?: string;
  created_at: string;
  total_amount: number;
  order_products: Array<any>;
  status: string; // This expects a string, not an array of StatusItem
}

interface OrderListProps {
  orders: Order[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export default function OrderList({
  orders,
  selectedOrderId,
  onOrderSelect,
  isLoading,
  error,
}: OrderListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-6" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">Error loading orders: {error.message}</p>
        ) : orders.length ? (
          <div className="space-y-3">
            {orders.map((order) => {
              const isSelected = order.id === selectedOrderId;

              return (
                <div
                  key={order.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => onOrderSelect(order.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">
                        Order #{order.tracking_id || order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(order.total_amount)} •{" "}
                        {order.order_products.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge
                        variant={
                          order.status === "Delivered" ? "default" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
}
