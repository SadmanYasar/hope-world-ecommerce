"use client";

import { useTable } from "@refinedev/antd";
import { bucket_url } from "@utils/supabase/config";
import { Space, Table, Image, Tag } from "antd";

export default function UserList() {
  const { tableProps, sorters, filters } = useTable({
    syncWithLocation: false,
    resource: "profiles_with_roles",
    meta: {
      select: `
        *
      `,
    },
  });

  console.log("tableProps", tableProps);

  return (
    <>
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column dataIndex="username" title="Username" />
        <Table.Column dataIndex="first_name" title="First Name" />
        <Table.Column dataIndex="last_name" title="Last Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          title="Role"
          render={(record) => {
            const role = record.role || "";
            return (
              <Space>
                {role ? (
                  <Tag color="blue" key={role}>
                    {String(role).toUpperCase()}
                  </Tag>
                ) : (
                  <Tag color="default">No Role</Tag>
                )}
              </Space>
            );
          }}
        />
        <Table.Column
          dataIndex="avatar_url"
          title="Avatar"
          // render={(value) =>
          //   value ? (
          //     <Image
          //       src={value}
          //       width={50}
          //       height={50}
          //       style={{ objectFit: "cover", borderRadius: "50%" }}
          //       alt=""
          //     />
          //   ) : (
          //     "No Avatar"
          //   )
          // }
          render={(value: any) => {
            if (!value) return "-";
            return (
              <Image.PreviewGroup>
                <Image
                  width={50}
                  height={50}
                  src={bucket_url + value}
                  alt=""
                  style={{
                    borderRadius: "5px",
                    padding: "1px",
                    objectFit: "cover",
                  }}
                />
              </Image.PreviewGroup>
            );
          }}
        />
      </Table>
    </>
  );
}
