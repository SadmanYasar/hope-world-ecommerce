"use client";

import {
  DateField,
  MarkdownField,
  Show,
  TextField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography, Rate, Card, Descriptions } from "antd";

const { Title } = Typography;

export default function ReviewShow() {
  const { query } = useShow({
    meta: {
      select: "*, product:product_id(*), order:order_id(*)",
    },
  });
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Descriptions title="Review Details" bordered column={1}>
        <Descriptions.Item label="ID">
          <TextField value={record?.id} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Product">
          <TextField value={record?.product?.name || `Product #${record?.product_id}`} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Order">
          <TextField value={record?.order?.tracking_id || `Order #${record?.order_id}`} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Rating">
          {record?.rating && <Rate disabled defaultValue={record?.rating} />}
        </Descriptions.Item>
        
        <Descriptions.Item label="Comment">
          {record?.comment ? (
            <MarkdownField value={record?.comment} />
          ) : (
            <span>No comment provided</span>
          )}
        </Descriptions.Item>
        
        <Descriptions.Item label="Date">
          <DateField value={record?.created_at} format="MMMM DD, YYYY" />
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
}
