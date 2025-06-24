import React from 'react';
import { Card, Table, Typography, Tag, Button } from 'antd';
import { BaseRecord, useList } from '@refinedev/core';
import Link from 'next/link';

const { Text } = Typography;

interface RecentOrdersTableProps {
  formatCurrencyWithK: (value: number) => string;
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  formatCurrencyWithK,
}) => {
  // Fetch recent orders with only necessary fields
  const { data: recentOrders, isLoading: ordersLoading } = useList({
    resource: "orders",
    pagination: { pageSize: 5, current: 1 },
    sorters: [{ field: "created_at", order: "desc" }],
    meta: {
      select: "id, created_at, total_amount, status, customer_email",
    },
  });

  return (
    <Card
      title="Recent Orders"
      extra={
        <Link href="/orders">
          <Button type="link">View All</Button>
        </Link>
      }
    >
      <Table
        dataSource={recentOrders?.data || []}
        rowKey="id"
        pagination={false}
        size="small"
        loading={ordersLoading}
      >
        <Table.Column
          title="ID"
          dataIndex="id"
          key="id"
          render={(value) => <Text copyable>{value}</Text>}
        />
        <Table.Column
          title="Date"
          dataIndex="created_at"
          key="created_at"
          render={(value) => new Date(value).toLocaleDateString()}
        />
        <Table.Column
          title="Customer"
          dataIndex="customer_email"
          key="customer_email"
          ellipsis={true}
        />
        <Table.Column
          title="Amount"
          dataIndex="total_amount"
          key="total_amount"
          render={(value) => formatCurrencyWithK(value)}
        />
        <Table.Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(statuses) => {
            if (!statuses || !statuses.length)
              return <Tag color="default">Processing</Tag>;

            // Sort by date to get the latest status
            const sortedStatuses = [...statuses].sort((a, b) => {
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            const latestStatus = sortedStatuses[0];

            let color = "blue";
            if (latestStatus.status === "Delivered") color = "green";
            if (latestStatus.status === "Canceled") color = "red";

            return <Tag color={color}>{latestStatus.status}</Tag>;
          }}
        />
      </Table>
    </Card>
  );
};

export default RecentOrdersTable;
