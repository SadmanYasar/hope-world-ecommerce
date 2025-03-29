"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useMany, type BaseRecord } from "@refinedev/core";
import { Space, Table, Image } from "antd";

export default function ProductList() {
  const { tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      select: "*",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="name" title={"Name"} />
        <Table.Column dataIndex="name" title={"Category"} />
        <Table.Column
          dataIndex="description"
          title={"Description"}
          render={(value: any) => {
            if (!value) return "-";
            return <MarkdownField value={value.slice(0, 80) + "..."} />;
          }}
        />
        <Table.Column
          dataIndex="images"
          title={"Images"}
          render={(value: any) => {
            if (!value) return "-";
            return (
              <Image.PreviewGroup>
                {JSON.parse(value).map((image: any, index: number) => (
                  <Image
                    width={50}
                    height={50}
                    src={image.url}
                    key={index}
                    alt=""
                  />
                ))}
              </Image.PreviewGroup>
            );
          }}
        />
        <Table.Column dataIndex="price" title={"Price"} />
        <Table.Column dataIndex="stock" title={"Stock"} />
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
