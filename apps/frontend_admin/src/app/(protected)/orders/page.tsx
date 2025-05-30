"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  NumberField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useMany, type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export default function OrderList() {
  const { tableProps } = useTable({
    liveMode: "auto",
    syncWithLocation: true,
    meta: {
      select:
        "id, created_at, total_amount, status, customer_email, customer_phone, billing_address, shipping_address, tracking_id, order_products (id, quantity, price_at_time, product: product_id (id, name))",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="created_at"
          title={"Created At"}
          render={(value: string) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex="total_amount"
          title={"Total Amount"}
          render={(value: number) => (
            <NumberField
              value={value}
              options={{ style: "currency", currency: "USD" }}
            />
          )}
        />
        <Table.Column dataIndex="customer_email" title={"Customer Email"} />
        <Table.Column dataIndex="customer_phone" title={"Customer Phone"} />
        <Table.Column
          dataIndex="status"
          title={"Current Status"}
          render={(value: any[]) => {
            if (!value || value.length === 0) return "-";
            const latestStatus = value[value.length - 1];
            return <Tag color="blue">{latestStatus.status}</Tag>;
          }}
        />
        <Table.Column dataIndex="tracking_id" title={"Tracking ID"} />
        <Table.Column
          dataIndex="order_products"
          title={"Products Count"}
          render={(value: any[]) => value?.length || 0}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
