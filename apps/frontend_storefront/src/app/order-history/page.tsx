"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package2,
  Search as SearchIcon,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import { CrudFilter, HttpError, useList } from "@refinedev/core";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@components/ui/multiple-selector";
import { Search } from "./search";
import { ReviewForm } from "./ReviewForm";
import Image from "next/image";
import OrderList from "./_components/orderList";
import OrderDetails from "./_components/orderDetails";
import { getCurrentStatus } from "./utils/orderUtils";

interface OrderProduct {
  id: number;
  quantity: number;
  price_at_time: number;
  product: {
    id: number;
    name: string;
    images?: string;
  };
}

interface StatusItem {
  status: string;
  date?: string;
}

interface OrderPage {
  id: string;
  created_at: string;
  total_amount: number;
  status: StatusItem[];
  tracking_id: string;
  customer_email?: string;
  customer_phone?: string;
  billing_address?: any;
  shipping_address?: any;
  order_products: OrderProduct[];
}

interface Review {
  id: string;
  product_id: number;
  order_id: string;
  rating: number;
  comment?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Delivered":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "In Transit":
      return <Truck className="w-5 h-5 text-blue-500" />;
    case "Dispatched":
      return <Truck className="w-5 h-5 text-indigo-500" />;
    case "Ordered":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-red-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-500";
    case "In Transit":
      return "bg-blue-500";
    case "Dispatched":
      return "bg-indigo-500";
    case "Ordered":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [productToReview, setProductToReview] = useState<any>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, error, isLoading, refetch } = useList<OrderPage>({
    resource: "orders",
    liveMode: "manual",
    onLiveEvent: async () => await refetch(),
    filters: debouncedSearch
      ? ([
          { field: "tracking_id", operator: "eq", value: debouncedSearch },
        ] as CrudFilter[])
      : [],
    sorters: [{ field: "created_at", order: "desc" }],
    meta: { select: "..." },
  });

  const { data: reviewsData, refetch: refetchReviews } = useList<Review>({
    resource: "reviews",
    filters: [
      { field: "order_id", operator: "eq", value: selectedOrderId || "" },
    ],
    queryOptions: { enabled: !!selectedOrderId },
  });

  const orders = data?.data || [];
  const reviews = reviewsData?.data || [];

  const filteredOrders = orders.filter(
    (order) =>
      order.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (filteredOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : filteredOrders[0];

  const orderListItems = filteredOrders.map((order) => ({
    id: order.id,
    tracking_id: order.tracking_id,
    created_at: order.created_at,
    total_amount: order.total_amount,
    order_products: order.order_products,
    status: getCurrentStatus(order.status),
  }));

  const errorForOrderList = error ? new Error(error.message) : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Order History</h1>

        <div className="mb-6">
          <Label htmlFor="order-search">
            Search by tracking ID or order number
          </Label>
          <div className="relative mt-1">
            <Search onSearch={setSearchTerm} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <OrderList
            orders={orderListItems}
            selectedOrderId={selectedOrderId}
            onOrderSelect={setSelectedOrderId}
            isLoading={isLoading}
            error={errorForOrderList}
          />

          <OrderDetails
            order={selectedOrder || null}
            reviews={reviews}
            isLoading={isLoading}
            onReviewClick={(
              productId: number,
              productName: string,
              orderId: string
            ) => {
              setProductToReview({ id: productId, name: productName, orderId });
              setReviewModalOpen(true);
            }}
          />
        </div>
      </main>

      {productToReview && (
        <ReviewForm
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setProductToReview(null);
            refetchReviews();
          }}
          productId={productToReview.id}
          orderId={productToReview.orderId}
          productName={productToReview.name}
        />
      )}
    </div>
  );
}
