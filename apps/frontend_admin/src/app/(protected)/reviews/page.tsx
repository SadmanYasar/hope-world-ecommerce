"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord, useMany, CrudFilters, HttpError } from "@refinedev/core";
import {
  Space,
  Table,
  Rate,
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FormProps } from "antd/lib";

const { RangePicker } = DatePicker;

interface IReview {
  id: string;
  product: {
    id: string;
    name: string;
  };
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface IReviewFilterVariables {
  product_name?: string;
  rating?: number;
  createdAt?: [Date, Date];
}

export default function ReviewsList() {
  const { tableProps, searchFormProps, setFilters, filters } = useTable<
    IReview,
    HttpError,
    IReviewFilterVariables
  >({
    syncWithLocation: true,
    filters: {
      defaultBehavior: "replace",
      initial: [],
    },
    meta: {
      select: "*, product:product_id(*), order:order_id(*)",
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { product_name, rating, createdAt } = params;

      filters.push(
        {
          field: "product.name",
          operator: "containss",
          value: product_name,
        },
        {
          field: "rating",
          operator: "eq",
          value: rating,
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

      console.log("Filters applied:", filters);

      return filters;
    },
  });

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col lg={6} xs={24}>
          <Card title="Filters">
            <Filter formProps={searchFormProps} setFilters={setFilters} />
          </Card>
        </Col>
        <Col lg={18} xs={24}>
          <List headerButtons={<></>}>
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
                render={(value: string) =>
                  value
                    ? value.length > 50
                      ? `${value.substring(0, 50)}...`
                      : value
                    : "-"
                }
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
                    <ShowButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                    />
                    <EditButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                    />
                    <DeleteButton
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
  formProps: FormProps<IReviewFilterVariables>;
  setFilters?: (filters: CrudFilters) => void;
}

const Filter: React.FC<FilterProps> = ({ formProps, setFilters }) => {
  const handleReset = () => {
    formProps.form?.resetFields();
    setFilters?.([]);
  };

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Product Name" name="product_name">
        <Input placeholder="Search by product" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item label="Rating" name="rating">
        <Select
          allowClear
          placeholder="Filter by rating"
          options={[
            { label: "★", value: 1 },
            { label: "★★", value: 2 },
            { label: "★★★", value: 3 },
            { label: "★★★★", value: 4 },
            { label: "★★★★★", value: 5 },
          ]}
        />
      </Form.Item>
      <Form.Item label="Date Range" name="createdAt">
        <RangePicker />
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
