"use client";
import { useState, useEffect } from "react";
import {
  useTable,
  useSelect,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  MarkdownField,
  List,
} from "@refinedev/antd";
import { SearchOutlined } from "@ant-design/icons";
import { CrudFilters, HttpError } from "@refinedev/core";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Image,
} from "antd";

const { RangePicker } = DatePicker;

interface ICategory {
  id: string;
  text: string;
}

interface IProduct {
  id: string;
  name: string;
  category: ICategory | null; // Allow category to be null
  description: string;
  images: string[];
  createdAt: string;
}

interface IProductFilterVariables {
  name?: string;
  category?: string;
  createdAt?: [Date, Date];
}

export default function ProductsPage() {
  const { tableProps, searchFormProps } = useTable<
    IProduct,
    HttpError,
    IProductFilterVariables
  >({
    syncWithLocation: true,
    meta: {
      select:
        "id, name, description, price, images, category(id,text), created_at",
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { name, category, createdAt } = params;

      filters.push(
        {
          field: "name",
          operator: "containss",
          value: name,
        },
        {
          field: "category!inner(id)",
          operator: "eq",
          value: category,
        },
        {
          field: "created_at",
          operator: "gte",
          value: createdAt ? createdAt[0].toISOString() : undefined,
        },
        {
          field: "created_at",
          operator: "lte",
          value: createdAt ? createdAt[1].toISOString() : undefined,
        }
      );

      return filters;
    },
  });

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col lg={6} xs={24}>
          <Card title="Filters">
            <Filter formProps={searchFormProps} />
          </Card>
        </Col>
        <Col lg={18} xs={24}>
          <List>
            <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
              <Table.Column dataIndex="id" title="ID" />
              <Table.Column dataIndex="name" title="Name" />
              <Table.Column
                dataIndex="category"
                title="Category"
                render={(value: ICategory | null) => {
                  if (!value) return "-";
                  return value.text;
                }}
              />
              <Table.Column
                dataIndex="description"
                title="Description"
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
              <Table.Column
                dataIndex="created_at"
                title="Created At"
                render={(value) => <DateField format="LLL" value={value} />}
              />
              <Table.Column<IProduct>
                title="Actions"
                dataIndex="actions"
                render={(_, record) => (
                  <Space>
                    <EditButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                    />
                    <ShowButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                    />
                  </Space>
                )}
              />
            </Table>
          </List>
        </Col>
      </Row>
    </>
  );
}

interface FilterProps {
  formProps: any;
}

const Filter: React.FC<FilterProps> = ({ formProps }) => {
  const { selectProps: categorySelectProps } = useSelect<ICategory>({
    resource: "categories",
    optionLabel: "text",
    optionValue: "id",
  });

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Search" name="name">
        <Input placeholder="Name" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item label="Category" name="category">
        <Select
          {...categorySelectProps}
          allowClear
          placeholder="Search Categories"
        />
      </Form.Item>
      <Form.Item label="Created At" name="createdAt">
        <RangePicker />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Filter
        </Button>
      </Form.Item>
    </Form>
  );
};
