import React from 'react';
import { Card, Table, Typography, Rate, Button } from 'antd';
import { BaseRecord, useList } from '@refinedev/core';
import Link from 'next/link';

const { Text } = Typography;

interface TopProductsTableProps {
  formatCurrencyWithK: (value: number) => string;
  formatPrice: (price: number | undefined) => number;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
  formatCurrencyWithK,
  formatPrice,
}) => {
  // Fetch top-selling products with minimal data
  const { data: topProducts, isLoading: productsLoading } = useList({
    resource: "products",
    pagination: { pageSize: 5, current: 1 },
    sorters: [{ field: "rating", order: "desc" }],
    meta: {
      select: "id, name, price, rating, category(id,text)",
    },
  });

  return (
    <Card
      title="Top Rated Products"
      extra={
        <Link href="/products">
          <Button type="link">View All</Button>
        </Link>
      }
    >
      <Table
        dataSource={topProducts?.data || []}
        rowKey="id"
        pagination={false}
        size="small"
        loading={productsLoading}
      >
        <Table.Column
          title="Name"
          dataIndex="name"
          key="name"
          render={(value) => <Text strong>{value}</Text>}
        />
        <Table.Column
          title="Category"
          dataIndex={["category", "text"]}
          key="category"
          render={(value) => value || "-"}
        />
        <Table.Column
          title="Price"
          dataIndex="price"
          key="price"
          render={(value) => formatCurrencyWithK(formatPrice(value))}
        />
        <Table.Column
          title="Rating"
          dataIndex="rating"
          key="rating"
          render={(value) => (
            <Rate
              disabled
              defaultValue={value}
              allowHalf
              style={{ fontSize: "14px" }}
            />
          )}
        />
      </Table>
    </Card>
  );
};

export default TopProductsTable;
