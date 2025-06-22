"use client";

import {
  DateField,
  ImageField,
  MarkdownField,
  NumberField,
  Show,
  TextField,
} from "@refinedev/antd";
import { BaseRecord, useOne, useShow } from "@refinedev/core";
import { Image, Typography, Table, Tag, Card } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

export default function OrderShow() {
  const { query } = useShow({
    meta: {
      select:
        "id, created_at, total_amount, status, customer_email, customer_phone, billing_address, shipping_address, tracking_id, order_products (id, quantity, price_at_time, product: product_id (id, name, images))",
    },
  });
  const { data, isLoading } = query;

  const record = data?.data;

  console.log("record", record);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }
    return `$${(amount / 100).toFixed(2)}`;
  };

  const statusColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => {
        if (!date) return "-";
        // Handle dates with single-digit days by normalizing the format
        try {
          // Parse the date parts
          const parts = date.split("/");
          if (parts.length === 3) {
            const month = parts[0].padStart(2, "0");
            const day = parts[1].padStart(2, "0");
            const year = parts[2];
            return `${month}/${day}/${year}`;
          }
          return date;
        } catch (error) {
          console.error("Error parsing date:", error);
          return date;
        }
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
  ];

  const orderProductsColumns = [
    {
      title: "Product Name",
      dataIndex: ["product", "name"],
      key: "product_name",
      render: (name: string) => name || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => quantity || 0,
    },
    {
      title: "Price at Time",
      dataIndex: "price_at_time",
      key: "price_at_time",
      render: (value: number) =>
        value ? `$${(value / 100).toFixed(2)}` : "$0.00",
    },
    {
      title: "Product Image",
      dataIndex: ["product", "images"],
      key: "product_image",
      render: (imagesStr: string) => {
        try {
          if (!imagesStr) return "-";
          const images = JSON.parse(imagesStr);

          if (!Array.isArray(images) || images.length === 0) return "-";

          return (
            <Image.PreviewGroup>
              {images.map((image: BaseRecord, index: number) => (
                <Image
                  width={50}
                  height={50}
                  src={image.url}
                  key={index}
                  alt="Product Image"
                  style={{
                    borderRadius: "5px",
                    padding: "1px",
                    objectFit: "cover",
                  }}
                />
              ))}
            </Image.PreviewGroup>
          );
        } catch (error) {
          console.error("Error parsing image data:", error);
          return "-";
        }
      },
    },
    {
      title: "View",
      key: "view",
      render: (_: BaseRecord, record: BaseRecord) =>
        record?.product?.id ? (
          <Link
            href={`/products/show/${record.product.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Product
          </Link>
        ) : (
          "-"
        ),
    },
  ];

  const formatAddress = (addressObj: BaseRecord) => {
    if (!addressObj) return "-";

    // Convert address object to string if it's an object
    if (typeof addressObj === "object") {
      const { name, line1, line2, city, state, postal_code, country } =
        addressObj;
      return (
        <div>
          {name && (
            <div>
              <strong>{name}</strong>
            </div>
          )}
          <div>
            {line1}
            {line2 ? `, ${line2}` : ""}
          </div>
          <div>
            {city}, {state} {postal_code}
          </div>
          <div>{country}</div>
        </div>
      );
    }

    return addressObj;
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{"Created At"}</Title>
      <DateField value={record?.created_at} />

      <Title level={5}>{"Total Amount"}</Title>
      <Text>{formatCurrency(record?.total_amount)}</Text>

      <Title level={5}>{"Customer Email"}</Title>
      <TextField value={record?.customer_email} />

      <Title level={5}>{"Customer Phone"}</Title>
      <TextField value={record?.customer_phone} />

      <Title level={5}>{"Billing Address"}</Title>
      <Card size="small" style={{ marginBottom: "1rem" }}>
        {formatAddress(record?.billing_address)}
      </Card>

      <Title level={5}>{"Shipping Address"}</Title>
      <Card size="small" style={{ marginBottom: "1rem" }}>
        {formatAddress(record?.shipping_address)}
      </Card>

      <Title level={5}>{"Tracking ID"}</Title>
      <TextField value={record?.tracking_id} />

      <Title level={5}>{"Status Timeline"}</Title>
      <Table
        dataSource={record?.status || []}
        columns={statusColumns}
        pagination={false}
        size="small"
      />

      <Title level={5}>{"Order Products"}</Title>
      <Table
        dataSource={record?.order_products || []}
        columns={orderProductsColumns}
        pagination={false}
        rowKey="id"
      />
    </Show>
  );
}
