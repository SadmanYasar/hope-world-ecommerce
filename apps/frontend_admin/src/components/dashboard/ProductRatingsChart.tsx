import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { BaseRecord, useList } from '@refinedev/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ProductRatingsChart: React.FC = () => {
  const [productRatings, setProductRatings] = useState<BaseRecord[]>([]);

  // Fetch top-selling products with minimal data
  const { data: topProducts } = useList({
    resource: "products",
    pagination: { pageSize: 100, current: 1 },
    meta: {
      select: "id, rating",
    },
  });

  // Process product ratings
  useEffect(() => {
    if (topProducts?.data) {
      const ratings: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (Array.isArray(topProducts.data)) {
        topProducts.data.forEach((product: BaseRecord) => {
          if (product.rating !== undefined && product.rating !== null) {
            const rating = Math.min(5, Math.max(1, Math.round(product.rating)));
            ratings[rating] = (ratings[rating] || 0) + 1;
          }
        });
      }

      const ratingData = Object.entries(ratings)
        .map(([rating, count]) => ({
          name: `${rating} Star${count !== 1 ? "s" : ""}`,
          count,
        }))
        .sort((a, b) => parseInt(b.name) - parseInt(a.name));

      setProductRatings(ratingData);
    }
  }, [topProducts]);

  return (
    <Card title="Product Ratings Distribution">
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={productRatings}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Number of Products" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProductRatingsChart;
