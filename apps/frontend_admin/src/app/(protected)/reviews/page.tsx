"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord, useMany } from "@refinedev/core";
import { Space, Table, Rate } from "antd";

export default function ReviewsList() {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      select: "*, product:product_id(*), order:order_id(*)",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column 
          dataIndex={["product", "name"]} 
          title={"Product"} 
          render={(value, record: any) => (
            <span>{value || `Product #${record.product_id}`}</span>
          )}
        />
        <Table.Column 
          dataIndex="rating" 
          title={"Rating"} 
          render={(value: number) => (
            <Rate disabled defaultValue={value} />
          )}
        />
        <Table.Column 
          dataIndex="comment" 
          title={"Comment"}
          render={(value: string) => (
            value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : "-"
          )}
        />
        <Table.Column 
          dataIndex={["order", "tracking_id"]} 
          title={"Order"} 
          render={(value, record: any) => (
            <span>{value || `Order #${record.order_id}`}</span>
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title={"Date"}
          render={(value) => (
            <DateField format="MM/DD/YYYY" value={value} />
          )}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
