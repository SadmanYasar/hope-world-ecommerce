"use client";

import { useList, useOne, useCustom, BaseRecord } from "@refinedev/core";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  List,
  Typography,
  Space,
  Spin,
  Divider,
  Tag,
  Badge,
  DatePicker,
  Select,
  Button,
} from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  AppstoreOutlined,
  StarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  TeamOutlined,
  InboxOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Rate } from "antd/lib";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("week");
  const [orderData, setOrderData] = useState<BaseRecord[]>([]);
  const [categoryData, setCategoryData] = useState<BaseRecord[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<BaseRecord[]>([]);
  const [productRatings, setProductRatings] = useState<BaseRecord[]>([]);

  // Fetch summary stats
  const { data: productCount, isLoading: productListLoading } = useList({
    resource: "products",
    pagination: { pageSize: 1, current: 1 },
    meta: { count: true },
  });

  const { data: orderCount } = useList({
    resource: "orders",
    pagination: { pageSize: 1, current: 1 },
    meta: { count: true },
  });

  const { data: userCount } = useList({
    resource: "profiles",
    pagination: { pageSize: 1, current: 1 },
    meta: { count: true },
  });

  const { data: categoryCount } = useList({
    resource: "categories",
    pagination: { pageSize: 1, current: 1 },
    meta: { count: true },
  });

  const { data: arCollectibleCount } = useList({
    resource: "ARCollectible",
    pagination: { pageSize: 1, current: 1 },
    meta: { count: true },
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useList({
    resource: "orders",
    pagination: { pageSize: 5, current: 1 },
    sorters: [{ field: "created_at", order: "desc" }],
    meta: {
      select: "id, created_at, total_amount, status, customer_email",
    },
  });

  // Fetch top-selling products
  const { data: topProducts, isLoading: productsLoading } = useList({
    resource: "products",
    pagination: { pageSize: 5, current: 1 },
    sorters: [{ field: "rating", order: "desc" }],
    meta: {
      select: "id, name, price, rating, category(id, text)",
    },
  });

  // Fetch categories with product counts
  const { data: categories, isLoading: categoriesLoading } = useList({
    resource: "categories",
    pagination: { pageSize: 10, current: 1 },
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

  // Fetch revenue data (total from orders)
  const { data: revenueData, isLoading: revenueLoading } = useCustom({
    url: "orders",
    method: "get",
    meta: {
      select: "total_amount",
    },
  });

  // Process revenue data
  const totalRevenue =
    revenueData?.data?.reduce(
      (sum: number, order: BaseRecord) => sum + (order.total_amount || 0),
      0
    ) || 0;

  // Generate order data by time periods
  useEffect(() => {
    if (recentOrders?.data) {
      // Create mock data for demonstration purposes
      // In a real app, you would aggregate this from your actual order data
      const mockOrderData = [
        { name: "Mon", orders: 4, revenue: 4200 },
        { name: "Tue", orders: 3, revenue: 3800 },
        { name: "Wed", orders: 5, revenue: 6500 },
        { name: "Thu", orders: 7, revenue: 9200 },
        { name: "Fri", orders: 6, revenue: 8400 },
        { name: "Sat", orders: 9, revenue: 12000 },
        { name: "Sun", orders: 11, revenue: 15000 },
      ];
      setOrderData(mockOrderData);
    }
  }, [recentOrders]);

  // Process category data
  useEffect(() => {
    if (categories?.data && topProducts?.data) {
      const catMap = new Map();
      categories.data.forEach((cat: BaseRecord) => {
        catMap.set(cat.id, { name: cat.text, count: 0 });
      });

      // Count products per category - this is simplified; in a real app you'd query this from backend
      topProducts.data.forEach((product: BaseRecord) => {
        if (product.category && catMap.has(product.category.id)) {
          const cat = catMap.get(product.category.id);
          catMap.set(product.category.id, { ...cat, count: cat.count + 1 });
        }
      });

      const categoryChartData = Array.from(catMap.values())
        .filter((cat) => cat.count > 0)
        .map((cat) => ({
          name: cat.name,
          value: cat.count,
        }));

      setCategoryData(categoryChartData);
    }
  }, [categories, topProducts]);

  // Process role distribution
  useEffect(() => {
    if (profilesWithRoles?.data) {
      const roles: Record<string, number> = {
        admin: 0,
        moderator: 0,
        customer: 0,
      };

      profilesWithRoles.data.forEach((profile: BaseRecord) => {
        const role = profile.role || "customer";
        roles[role] = (roles[role] || 0) + 1;
      });

      const roleData = Object.entries(roles).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      setRoleDistribution(roleData);
    }
  }, [profilesWithRoles]);

  // Process product ratings
  useEffect(() => {
    if (topProducts?.data) {
      const ratings: Record<string, number> = {};

      topProducts.data.forEach((product: BaseRecord) => {
        const rating = Math.floor(product.rating || 0);
        ratings[rating] = (ratings[rating] || 0) + 1;
      });

      const ratingData = Object.entries(ratings)
        .map(([rating, count]) => ({
          name: `${rating} Star${count !== 1 ? "s" : ""}`,
          count,
        }))
        .sort((a, b) => parseInt(b.name) - parseInt(a.name));

      setProductRatings(ratingData);
    }
  }, [topProducts]);

  // Loading state
  const isLoading =
    ordersLoading ||
    productsLoading ||
    categoriesLoading ||
    rolesLoading ||
    revenueLoading;

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
          <Card>
            <Statistic
              title="Total Products"
              value={productCount?.total || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={orderCount?.total || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={userCount?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={(totalRevenue / 100).toFixed(2)}
              prefix={<DollarOutlined />}
              suffix="USD"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={categoryCount?.total || 0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="AR Collectibles"
              value={arCollectibleCount?.total || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Product Rating"
              value={
                topProducts?.data
                  ? topProducts.data.reduce(
                      (sum: number, product: BaseRecord) =>
                        sum + (product.rating || 0),
                      0
                    ) / topProducts.data.length
                  : 0
              }
              precision={1}
              prefix={<StarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={totalRevenue / (orderCount?.total || 1) / 100}
              precision={2}
              prefix={<ShoppingCartOutlined />}
              suffix="USD"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Orders Over Time Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="Orders & Revenue"
            extra={
              <Select
                defaultValue="week"
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
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
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
                    name="Revenue (USD)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* User Roles Distribution */}
        <Col xs={24} md={12} lg={6}>
          <Card title="User Roles Distribution">
            <div
              style={{ height: 300, display: "flex", justifyContent: "center" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Space>
                {roleDistribution.map((role, index) => (
                  <Tag color={COLORS[index % COLORS.length]} key={role.name}>
                    {role.name}: {role.value}
                  </Tag>
                ))}
              </Space>
            </div>
          </Card>
        </Col>

        {/* Products by Category */}
        <Col xs={24} md={12} lg={6}>
          <Card title="Products by Category">
            <div
              style={{ height: 300, display: "flex", justifyContent: "center" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Orders"
            extra={<Button type="link">View All</Button>}
          >
            <Table
              dataSource={recentOrders?.data || []}
              rowKey="id"
              pagination={false}
              size="small"
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
                render={(value) => `$${(value / 100).toFixed(2)}`}
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
                    return (
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
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
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Top Rated Products"
            extra={<Button type="link">View All</Button>}
          >
            <Table
              dataSource={topProducts?.data || []}
              rowKey="id"
              pagination={false}
              size="small"
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
                render={(value) => `$${(value / 100).toFixed(2)}`}
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
        </Col>
      </Row>

      {/* Product Ratings */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
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
                  <Bar
                    dataKey="count"
                    name="Number of Products"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
