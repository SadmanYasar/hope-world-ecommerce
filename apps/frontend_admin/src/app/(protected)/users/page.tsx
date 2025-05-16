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

export default function UserList() {
  const { tableProps, sorters, filters } = useTable({
    syncWithLocation: false,
    resource: "user_roles",
    meta: {
      // select: "id, name, description, price, images, category_id(id,text)",
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="name" title={"Name"} />
        <Table.Column
          dataIndex="category"
          title={"Category"}
          render={(value: any) => {
            if (!value) return "-";
            return value.text;
          }}
        />
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
                    style={{
                      borderRadius: "5px",
                      padding: "1px",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </Image.PreviewGroup>
            );
          }}
        />
        <Table.Column dataIndex="price" title={"Price"} />
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
