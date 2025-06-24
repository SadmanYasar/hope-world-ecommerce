"use client";

import { useList } from "@refinedev/core";
import { Col, Row, Spin, Divider, Typography } from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  AppstoreOutlined,
  StarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";

import {
  StatisticsCard,
  OrderRevenueChart,
  DistributionChart,
  RecentOrdersTable,
  TopProductsTable,
  ProductRatingsChart,
  formatCurrencyWithK,
  formatPrice,
} from "@/components/dashboard";

const { Title } = Typography;

export default function DashboardPage() {
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Fetch summary stats with estimated counts for better performance
  const { data: productCountData, isLoading: productListLoading } = useList({
    resource: "products",
    meta: {
      select: "id",
      count: "estimated",
    },
  });

  const { data: orderCountData, isLoading: orderCountLoading } = useList({
    resource: "orders",
    meta: {
      select: "id",
      count: "estimated",
    },
  });

  const { data: userCountData, isLoading: userCountLoading } = useList({
    resource: "profiles_with_roles",
    meta: {
      select: "id",
      count: "estimated",
    },
  });

  const { data: categoryCountData, isLoading: categoryCountLoading } = useList({
    resource: "categories",
    meta: {
      select: "id",
      count: "estimated",
    },
  });

  const { data: arCollectibleCountData, isLoading: arCountLoading } = useList({
    resource: "ARCollectible",
    meta: {
      select: "id",
      count: "estimated",
    },
  });

  // Fetch all orders for revenue calculation
  const { data: allOrders, isLoading: allOrdersLoading } = useList({
    resource: "orders",
    pagination: { pageSize: 100, current: 1 },
    meta: {
      select: "id, created_at, total_amount",
    },
  });

  // Fetch top-selling products with minimal data
  const { data: topProducts, isLoading: productsLoading } = useList({
    resource: "products",
    pagination: { pageSize: 5, current: 1 },
    sorters: [{ field: "rating", order: "desc" }],
    meta: {
      select: "id, name, price, rating, category(id,text)",
    },
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useList({
    resource: "categories",
    meta: {
      select: "id, text",
    },
  });

  // Fetch user roles distribution
  const { data: profilesWithRoles, isLoading: rolesLoading } = useList({
    resource: "profiles_with_roles",
    pagination: { pageSize: 100, current: 1 },
    meta: {
      select: "id, role",
    },
  });

  // Fetch ALL products for category chart (not just top 5)
  const { data: allProductsForCategories, isLoading: allProductsLoading } = useList({
    resource: "products",
    pagination: { pageSize: 100, current: 1 },
    meta: {
      select: "id, category(id,text)",
    },
  });

  // Calculate total revenue from orders
  const totalRevenue = allOrders?.data?.reduce(
    (sum: number, order: any) => sum + (order.total_amount || 0),
    0
  ) || 0;

  // Process category data from products - using ALL products, not just top rated
  useEffect(() => {
    if (categories?.data && allProductsForCategories?.data) {
      // Count products per category
      const productCountsByCategory: Record<string, { name: string; count: number }> = {};

      // Initialize with all categories
      if (Array.isArray(categories.data)) {
        categories.data.forEach((cat: any) => {
          if (cat && cat.id !== undefined && cat.text) {
            productCountsByCategory[cat.id] = {
              name: cat.text,
              count: 0,
            };
          }
        });
      }

      // Count products by category using ALL products data
      if (Array.isArray(allProductsForCategories.data)) {
        allProductsForCategories.data.forEach((product: any) => {
          if (product.category && product.category.id) {
            const catId = product.category.id;
            if (productCountsByCategory[catId]) {
              productCountsByCategory[catId].count += 1;
            } else {
              // Handle case where category exists in product but not in categories list
              productCountsByCategory[catId] = {
                name: product.category.text || `Category ${catId}`,
                count: 1,
              };
            }
          }
        });
      }

      // Format for chart - don't filter out categories with zero count
      const chartData = Object.values(productCountsByCategory)
        .filter((cat) => cat.count > 0) // Only include categories with products
        .map((cat) => ({
          name: cat.name.length > 10 ? cat.name.substring(0, 10) + "..." : cat.name,
          value: cat.count,
          fullName: cat.name, // Keep full name for tooltip
        }));

      setCategoryData(chartData);
    }
  }, [categories, allProductsForCategories]);

  // Process role distribution
  useEffect(() => {
    if (profilesWithRoles?.data) {
      const roles: Record<string, number> = {
        admin: 0,
        moderator: 0,
        customer: 0,
      };

      if (Array.isArray(profilesWithRoles.data)) {
        profilesWithRoles.data.forEach((profile: any) => {
          const role = profile.role || "customer";
          roles[role] = (roles[role] || 0) + 1;
        });
      }

      const roleData = Object.entries(roles)
        .filter(([_, count]) => count > 0) // Only include roles with users
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

      setRoleDistribution(roleData);
    }
  }, [profilesWithRoles]);

  // Check if anything is still loading
  const isLoading =
    productListLoading ||
    orderCountLoading ||
    userCountLoading ||
    categoryCountLoading ||
    arCountLoading ||
    productsLoading ||
    categoriesLoading ||
    rolesLoading ||
    allOrdersLoading ||
    allProductsLoading;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  // Safety checks for the counts - use array length instead of total property
  const productTotal = productCountData?.total || 0;
  const orderTotal = orderCountData?.total || 0;
  const userTotal = userCountData?.total || 0;
  const categoryTotal = categoryCountData?.total || 0;
  const arTotal = arCollectibleCountData?.total || 0;

  // Calculate average rating
  const avgProductRating =
    topProducts?.data && topProducts.total > 0
      ? topProducts.data.reduce(
          (sum: number, product: any) => sum + (product.rating || 0),
          0
        ) / topProducts.total
      : 0;

  // Calculate average order value - ensure we don't divide by zero
  const avgOrderValue = orderTotal > 0 ? totalRevenue / orderTotal : 0;

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>Dashboard</Title>
          <Divider />
        </Col>
      </Row>

      {/* Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Total Products"
            value={productTotal}
            prefix={<InboxOutlined />}
            color="#3f8600"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Total Orders"
            value={orderTotal}
            prefix={<ShoppingOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Total Users"
            value={userTotal}
            prefix={<UserOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Total Revenue"
            value={formatCurrencyWithK(totalRevenue)}
            prefix={<DollarOutlined />}
            color="#cf1322"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Categories"
            value={categoryTotal}
            prefix={<AppstoreOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="AR Collectibles"
            value={arTotal}
            prefix={<BookOutlined />}
            color="#eb2f96"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Avg Product Rating"
            value={avgProductRating.toFixed(1)}
            prefix={<StarOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticsCard
            title="Avg Order Value"
            value={formatCurrencyWithK(avgOrderValue)}
            prefix={<ShoppingCartOutlined />}
            color="#52c41a"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Orders Over Time Chart */}
        <Col xs={24} lg={12}>
          <OrderRevenueChart formatCurrencyWithK={formatCurrencyWithK} />
        </Col>

        {/* User Roles Distribution */}
        <Col xs={24} md={12} lg={6}>
          <DistributionChart 
            title="User Roles Distribution" 
            data={roleDistribution} 
            showTags={true} 
          />
        </Col>

        {/* Products by Category */}
        <Col xs={24} md={12} lg={6}>
          <DistributionChart 
            title="Products by Category" 
            data={categoryData} 
          />
        </Col>
      </Row>

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <RecentOrdersTable formatCurrencyWithK={formatCurrencyWithK} />
        </Col>

        <Col xs={24} lg={12}>
          <TopProductsTable 
            formatCurrencyWithK={formatCurrencyWithK} 
            formatPrice={formatPrice} 
          />
        </Col>
      </Row>

      {/* Product Ratings */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <ProductRatingsChart />
        </Col>
      </Row>
    </div>
  );
}
