import React, { useState, useEffect } from 'react';
import { Card, Select } from 'antd';
import { BaseRecord, useList } from '@refinedev/core';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface OrderRevenueChartProps {
  formatCurrencyWithK: (value: number) => string;
}

const OrderRevenueChart: React.FC<OrderRevenueChartProps> = ({
  formatCurrencyWithK,
}) => {
  const [timeRange, setTimeRange] = useState("week");
  const [orderData, setOrderData] = useState<BaseRecord[]>([]);

  // Fetch all orders for revenue calculation
  const { data: allOrders, isLoading: allOrdersLoading } = useList({
    resource: "orders",
    pagination: { pageSize: 100, current: 1 },
    meta: {
      select: "id, created_at, total_amount",
    },
  });

  // Generate order data based on actual orders and selected time range
  useEffect(() => {
    if (allOrders?.data && allOrders.data.length > 0) {
      const currentDate = new Date();
      let startDate = new Date();

      // Set date range based on selected filter
      if (timeRange === "week") {
        startDate.setDate(currentDate.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setMonth(currentDate.getMonth() - 1);
      } else if (timeRange === "year") {
        startDate.setFullYear(currentDate.getFullYear() - 1);
      }

      // Filter orders by date range
      const filteredOrders = allOrders.data.filter((order: BaseRecord) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= currentDate;
      });

      let chartData: BaseRecord[] = [];

      // Format data differently based on time range
      if (timeRange === "week") {
        // Group by day for the last 7 days
        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayData: Record<number, { orders: number; revenue: number }> = {
          0: { orders: 0, revenue: 0 },
          1: { orders: 0, revenue: 0 },
          2: { orders: 0, revenue: 0 },
          3: { orders: 0, revenue: 0 },
          4: { orders: 0, revenue: 0 },
          5: { orders: 0, revenue: 0 },
          6: { orders: 0, revenue: 0 },
        };

        // Populate with actual data
        filteredOrders.forEach((order: BaseRecord) => {
          const orderDate = new Date(order.created_at);
          const dayOfWeek = orderDate.getDay();
          dayData[dayOfWeek].orders += 1;
          dayData[dayOfWeek].revenue += order.total_amount || 0;
        });

        // Format for chart display
        chartData = Object.entries(dayData).map(([day, data]) => ({
          name: dayLabels[parseInt(day)],
          orders: data.orders,
          revenue: data.revenue, // Keep as cents
          formattedRevenue: formatCurrencyWithK(data.revenue), // Add formatted version for tooltip
        }));
      } else if (timeRange === "month") {
        // Group by week for the last month
        const weeks: Record<number, { orders: number; revenue: number }> = {
          1: { orders: 0, revenue: 0 },
          2: { orders: 0, revenue: 0 },
          3: { orders: 0, revenue: 0 },
          4: { orders: 0, revenue: 0 },
        };

        // Populate with actual data
        filteredOrders.forEach((order: BaseRecord) => {
          const orderDate = new Date(order.created_at);
          // Determine which week of the month (roughly)
          const dayOfMonth = orderDate.getDate();
          const weekOfMonth = Math.ceil(dayOfMonth / 7);
          const weekIndex = Math.min(weekOfMonth, 4); // Cap at 4 weeks

          weeks[weekIndex].orders += 1;
          weeks[weekIndex].revenue += order.total_amount || 0;
        });

        // Format for chart display
        chartData = Object.entries(weeks).map(([week, data]) => ({
          name: `Week ${week}`,
          orders: data.orders,
          revenue: data.revenue, // Keep as cents
          formattedRevenue: formatCurrencyWithK(data.revenue), // Add formatted version for tooltip
        }));
      } else if (timeRange === "year") {
        // Group by month for the last year
        const monthLabels = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const monthData: Record<number, { orders: number; revenue: number }> = {};

        // Initialize all months
        for (let i = 0; i < 12; i++) {
          monthData[i] = { orders: 0, revenue: 0 };
        }

        // Populate with actual data
        filteredOrders.forEach((order: BaseRecord) => {
          const orderDate = new Date(order.created_at);
          const monthIndex = orderDate.getMonth();

          monthData[monthIndex].orders += 1;
          monthData[monthIndex].revenue += order.total_amount || 0;
        });

        // Format for chart display
        chartData = Object.entries(monthData).map(([month, data]) => ({
          name: monthLabels[parseInt(month)],
          orders: data.orders,
          revenue: data.revenue, // Keep as cents
          formattedRevenue: formatCurrencyWithK(data.revenue), // Add formatted version for tooltip
        }));
      }

      setOrderData(chartData);
    }
  }, [allOrders, timeRange, formatCurrencyWithK]);

  return (
    <Card
      title="Orders & Revenue"
      extra={
        <Select
          value={timeRange}
          style={{ width: 120 }}
          onChange={setTimeRange}
          options={[
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "year", label: "This Year" },
          ]}
        />
      }
    >
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={orderData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value
              }
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "revenue") {
                  return [formatCurrencyWithK(value as number), "Revenue"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#8884d8"
              fill="#8884d8"
              name="Orders"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default OrderRevenueChart;
