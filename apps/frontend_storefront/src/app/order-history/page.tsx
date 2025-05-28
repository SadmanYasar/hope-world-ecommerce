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
} from "lucide-react";
import { CrudFilter, useList } from "@refinedev/core";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@components/ui/multiple-selector";
import { Search } from "./search";

interface OrderProduct {
  id: number;
  quantity: number;
  price_at_time: number;
  product: {
    id: number;
    name: string;
  };
}

interface StatusItem {
  status: string;
  date?: string;
}

interface Order {
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

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, error, isLoading, refetch } = useList<Order>({
    resource: "orders",
    liveMode: "manual",
    onLiveEvent: async (event) => {
      console.log("Live event received:", event);
      await refetch();
    },
    filters: [
      ...((debouncedSearch
        ? [
            {
              field: "tracking_id",
              operator: "eq",
              value: debouncedSearch,
            },
          ]
        : []) as CrudFilter[]),
    ],
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    meta: {
      select:
        "id, created_at, total_amount, status, customer_email, customer_phone, billing_address, shipping_address, tracking_id, order_products (id, quantity, price_at_time, product: product_id (id, name))",
    },
  });

  const orders = data?.data || [];

  // Filter orders by tracking ID or order ID
  const filteredOrders = orders.filter(
    (order) =>
      order.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm.toLowerCase())
  );

  // Derive the selected order from the current orders data and selectedOrderId
  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.id === selectedOrderId) || null
    : filteredOrders.length > 0
    ? filteredOrders[0]
    : null;

  // Find the current status of an order (the last status with a date)
  const getCurrentStatus = (statusArray: StatusItem[]) => {
    if (!statusArray || statusArray.length === 0) return "Unknown";

    const statusWithDates = statusArray
      .filter((status) => status.date)
      .sort(
        (a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()
      );

    return statusWithDates.length > 0
      ? statusWithDates[0].status
      : statusArray[0]?.status || "Ordered";
  };

  // Sort statuses for timeline display
  const getSortedStatuses = (statusArray: StatusItem[]) => {
    if (!statusArray) return [];

    // Define the order of statuses
    const statusOrder = ["Ordered", "Dispatched", "In Transit", "Delivered"];

    return statusArray.sort((a, b) => {
      const aIndex = statusOrder.indexOf(a.status);
      const bIndex = statusOrder.indexOf(b.status);

      // If both have the same status order, sort by date
      if (aIndex === bIndex) {
        if (a.date && b.date) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return a.date ? -1 : 1;
      }

      return aIndex - bIndex;
    });
  };

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`;

  // Handle search submission
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Handle order click
  const handleOrderClick = (order: Order) => {
    setSelectedOrderId(order.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-md bg-card">
        <div className="container flex items-center justify-between px-4 py-6 mx-auto">
          <div className="flex items-center space-x-2">
            <Package2 className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold text-primary">Hope World</span>
          </div>
          <nav>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/shop")}
            >
              Shop
            </Button>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/account")}
            >
              Account
            </Button>
          </nav>
        </div>
      </header>

      <main className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Order History</h1>

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="order-search">
            Search by tracking ID or order number
          </Label>
          <div className="relative mt-1">
            <Search onSearch={handleSearch} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-md">
                      <Skeleton className="w-1/3 h-6 mb-2" />
                      <Skeleton className="w-1/4 h-4 mb-2" />
                      <Skeleton className="w-1/2 h-4" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center text-red-500">
                  <p>Error loading orders: {error.message}</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const currentStatus = getCurrentStatus(order.status);
                    const isSelected = selectedOrder?.id === order.id;

                    return (
                      <div
                        key={order.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary/50 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => handleOrderClick(order)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">
                                Order #{order.tracking_id || order.id}
                              </p>
                              <Badge
                                variant={
                                  currentStatus === "Delivered"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {currentStatus}
                              </Badge>
                            </div>
                            <p className="mb-1 text-sm text-muted-foreground">
                              {format(
                                new Date(order.created_at),
                                "MMM dd, yyyy"
                              )}
                            </p>
                            <p className="text-sm font-medium">
                              {formatCurrency(order.total_amount)} •{" "}
                              {order.order_products.length} items
                            </p>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(currentStatus)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Package2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found</p>
                  {searchTerm && (
                    <p className="text-sm">Try a different search term</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>
                  <Skeleton className="w-1/3 h-6 mb-4" />
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-3/4 h-4 mb-2" />
                  <Skeleton className="w-1/2 h-4 mb-4" />
                  <Skeleton className="w-full h-32" />
                </div>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h3 className="mb-2 font-semibold">
                      Order #{selectedOrder.tracking_id || selectedOrder.id}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Placed:{" "}
                        {format(
                          new Date(selectedOrder.created_at),
                          "MMMM dd, yyyy"
                        )}
                      </p>
                      <p>Total: {formatCurrency(selectedOrder.total_amount)}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Status Timeline */}
                  <div>
                    <h3 className="mb-4 font-semibold">Order Status</h3>
                    <div className="space-y-4">
                      {getSortedStatuses(selectedOrder.status).map(
                        (statusItem, index) => {
                          const isCompleted = !!statusItem.date;
                          const isLast =
                            index ===
                            getSortedStatuses(selectedOrder.status).length - 1;

                          return (
                            <div key={index} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    isCompleted
                                      ? getStatusColor(statusItem.status)
                                      : "bg-gray-300"
                                  }`}
                                />
                                {!isLast && (
                                  <div
                                    className={`w-0.5 h-8 ${
                                      isCompleted
                                        ? "bg-gray-300"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(statusItem.status)}
                                  <span
                                    className={`font-medium ${
                                      isCompleted
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {statusItem.status}
                                  </span>
                                </div>
                                {statusItem.date && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {statusItem.date}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div>
                    <h3 className="mb-3 font-semibold">
                      Items ({selectedOrder.order_products.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.order_products.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatCurrency(item.price_at_time * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  {(selectedOrder.customer_email ||
                    selectedOrder.customer_phone) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-3 font-semibold">
                          Contact Information
                        </h3>
                        <div className="space-y-2">
                          {selectedOrder.customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {selectedOrder.customer_email}
                              </span>
                            </div>
                          )}
                          {selectedOrder.customer_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {selectedOrder.customer_phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-3 font-semibold">Shipping Address</h3>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="space-y-1 text-sm">
                            {selectedOrder.shipping_address.name && (
                              <p className="font-medium">
                                {selectedOrder.shipping_address.name}
                              </p>
                            )}
                            {selectedOrder.shipping_address.line1 && (
                              <p>{selectedOrder.shipping_address.line1}</p>
                            )}
                            {selectedOrder.shipping_address.line2 && (
                              <p>{selectedOrder.shipping_address.line2}</p>
                            )}
                            <p>
                              {[
                                selectedOrder.shipping_address.city,
                                selectedOrder.shipping_address.state,
                                selectedOrder.shipping_address.postal_code,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            {selectedOrder.shipping_address.country && (
                              <p>{selectedOrder.shipping_address.country}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Package2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an order to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
