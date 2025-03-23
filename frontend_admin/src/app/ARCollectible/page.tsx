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
import { Space, Table } from "antd";
import Image from "next/image";

export default function ARCollectibleList() {
  const { tableProps, tableQuery } = useTable({
    syncWithLocation: true,
    meta: {
      select: "*",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id" loading={tableQuery.isLoading}>
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="name" title={"Name"} />
        <Table.Column
          title={"Image"}
          dataIndex="image"
          render={(_, record) => {
            const imageUrl = record.image
              ? JSON.parse(record.image)?.[0]?.url
              : null;

            console.log("imageUrl", imageUrl);

            return imageUrl ? (
              <Image src={imageUrl} alt={record.name} width={50} height={50} />
            ) : (
              <Image
                src="/no-image.png"
                alt="No Image"
                width={50}
                height={50}
              />
            );
          }}
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
