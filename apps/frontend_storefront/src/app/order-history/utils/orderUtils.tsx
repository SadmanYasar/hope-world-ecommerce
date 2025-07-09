import { AlertCircle, CheckCircle, Clock, Truck } from "lucide-react";

/**
 * Formats a number as currency (USD).
 * @param amount Amount in cents
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `$${(amount / 100).toFixed(2)}`;
};

/**
 * Returns the most recent status of an order.
 * @param statusArray List of status history
 */
export const getCurrentStatus = (
  statusArray: { status: string; date?: string }[]
): string => {
  if (!statusArray || statusArray.length === 0) return "Unknown";

  const statusWithDates = statusArray
    .filter((status) => status.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  return statusWithDates.length > 0
    ? statusWithDates[0].status
    : statusArray[0]?.status || "Ordered";
};

/**
 * Sorts statuses based on predefined order and date.
 */
export const getSortedStatuses = (
  statusArray: { status: string; date?: string }[]
): { status: string; date?: string }[] => {
  if (!statusArray) return [];

  const statusOrder = ["Ordered", "Dispatched", "In Transit", "Delivered"];

  return [...statusArray].sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.status);
    const bIndex = statusOrder.indexOf(b.status);

    if (aIndex === bIndex) {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return a.date ? -1 : 1;
    }

    return aIndex - bIndex;
  });
};

/**
 * Returns appropriate icon for a given status.
 */
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Delivered":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "In Transit":
    case "Dispatched":
      return <Truck className="w-5 h-5 text-blue-500" />;
    case "Ordered":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-red-500" />;
  }
};

/**
 * Returns background color class for a given status.
 */
export const getStatusColor = (status: string): string => {
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
