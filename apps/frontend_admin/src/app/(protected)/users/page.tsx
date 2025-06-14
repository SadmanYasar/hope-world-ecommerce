"use client";

import { useTable } from "@refinedev/antd";
import { bucket_url } from "@utils/supabase/config";
import {
  Space,
  Table,
  Image,
  Tag,
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { CrudFilters, HttpError, useNotification } from "@refinedev/core";
import { FormProps } from "antd/lib";
import { updateUserRole } from "@/app/actions/updateUserRole";

interface IUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url: string;
}

interface IUserFilterVariables {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export default function UserList() {
  const {
    tableProps,
    searchFormProps,
    filters,
    setFilters,
    tableQuery: { refetch },
  } = useTable<IUser, HttpError, IUserFilterVariables>({
    syncWithLocation: false,
    resource: "profiles_with_roles",
    meta: {
      select: `
        *
      `,
    },
    filters: {
      defaultBehavior: "replace",
      initial: [],
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { username, first_name, last_name, email } = params;

      filters.push(
        {
          field: "username",
          operator: "containss",
          value: username,
        },
        {
          field: "first_name",
          operator: "containss",
          value: first_name,
        },
        {
          field: "last_name",
          operator: "containss",
          value: last_name,
        },
        {
          field: "email",
          operator: "containss",
          value: email,
        }
      );

      return filters;
    },
  });

  const { open } = useNotification();

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "moderator" | "customer"
  ) => {
    try {
      await updateUserRole(userId, newRole);
      open?.({
        type: "success",
        message: "User role updated successfully",
      });

      await refetch();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col lg={6} xs={24}>
          <Card title="Filters">
            <Filter formProps={searchFormProps} setFilters={setFilters} />
          </Card>
        </Col>
        <Col lg={18} xs={24}>
          <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
            <Table.Column dataIndex="username" title="Username" />
            <Table.Column dataIndex="first_name" title="First Name" />
            <Table.Column dataIndex="last_name" title="Last Name" />
            <Table.Column dataIndex="email" title="Email" />
            <Table.Column
              title="Role"
              render={(record) => {
                const role = record.role || "customer";
                return (
                  <Select
                    style={{ width: 120 }}
                    value={role}
                    onChange={(newRole) => handleRoleChange(record.id, newRole)}
                    options={[
                      { value: "admin", label: "ADMIN" },
                      { value: "moderator", label: "MODERATOR" },
                      { value: "customer", label: "CUSTOMER" },
                    ]}
                  />
                );
              }}
            />
            <Table.Column
              dataIndex="avatar_url"
              title="Avatar"
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
        </Col>
      </Row>
    </>
  );
}

interface FilterProps {
  formProps: FormProps<IUserFilterVariables>;
  setFilters?: (filters: CrudFilters) => void;
}

const Filter: React.FC<FilterProps> = ({ formProps, setFilters }) => {
  const handleReset = () => {
    formProps.form?.resetFields();
    setFilters?.([]);
  };

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Username" name="username">
        <Input placeholder="Search username" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item label="First Name" name="first_name">
        <Input placeholder="Search first name" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item label="Last Name" name="last_name">
        <Input placeholder="Search last name" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input placeholder="Search email" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Filter
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={handleReset} type="default">
          Reset
        </Button>
      </Form.Item>
    </Form>
  );
};
