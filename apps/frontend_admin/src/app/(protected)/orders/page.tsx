"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  getDefaultSortOrder,
  List,
  NumberField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import {
  useMany,
  type BaseRecord,
  CrudFilters,
  HttpError,
} from "@refinedev/core";
import {
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Tooltip,
} from "antd";
import { SearchOutlined, CopyOutlined } from "@ant-design/icons";
import { FormProps } from "antd/lib";

const { RangePicker } = DatePicker;

interface IOrder {
  id: string;
  created_at: string;
  total_amount: number;
  customer_email: string;
  customer_phone: string;
  status: any[];
  tracking_id: string;
  order_products: any[];
}

interface IOrderFilterVariables {
  customer_email?: string;
  status?: string;
  createdAt?: [Date, Date];
  total_amount?: [string | number | undefined, string | number | undefined];
}

export default function OrderList() {
  const { tableProps, searchFormProps, setFilters } = useTable<
    IOrder,
    HttpError,
    IOrderFilterVariables
  >({
    liveMode: "auto",
    syncWithLocation: true,
    meta: {
      select:
        "id, created_at, total_amount, status, customer_email, customer_phone, billing_address, shipping_address, tracking_id, order_products (id, quantity, price_at_time, product: product_id (id, name))",
    },
    filters: {
      defaultBehavior: "replace",
      initial: [],
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { customer_email, status, createdAt, total_amount } = params;

      filters.push({
        field: "customer_email",
        operator: "containss",
        value: customer_email,
      });

      // Add filter for status - using JSON containment operator
      // if (status) {
      //   filters.push({
      //     field: "status -> status",
      //     operator: "eq",
      //     value: status,
      //   });
      // }

      // Add date range filters
      if (createdAt && createdAt[0]) {
        filters.push({
          field: "created_at",
          operator: "gte",
          value: createdAt[0].toISOString(),
        });
      }

      if (createdAt && createdAt[1]) {
        filters.push({
          field: "created_at",
          operator: "lte",
          value: createdAt[1].toISOString(),
        });
      }

      // Add minimum amount filter if provided and is a valid number
      if (total_amount && total_amount[0] && !isNaN(Number(total_amount[0]))) {
        filters.push({
          field: "total_amount",
          operator: "gte",
          value: Number(total_amount[0]) * 100, // Convert to cents
        });
      }

      // Add maximum amount filter if provided and is a valid number
      if (total_amount && total_amount[1] && !isNaN(Number(total_amount[1]))) {
        filters.push({
          field: "total_amount",
          operator: "lte",
          value: Number(total_amount[1]) * 100, // Convert to cents
        });
      }

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
          <List>
            <Table {...tableProps} rowKey="id">
              <Table.Column
                dataIndex="id"
                title={"ID"}
                sorter
                defaultSortOrder={getDefaultSortOrder("id")}
              />
              <Table.Column
                dataIndex="created_at"
                title={"Created At"}
                render={(value: string) => <DateField value={value} />}
                sorter
                defaultSortOrder={getDefaultSortOrder("created_at")}
              />
              <Table.Column
                dataIndex="total_amount"
                title={"Total Amount"}
                render={(value: number) => (
                  <Tag color="green">
                    <NumberField
                      value={value / 100}
                      options={{ style: "currency", currency: "USD" }}
                    />
                  </Tag>
                )}
                sorter
                defaultSortOrder={getDefaultSortOrder("total_amount")}
              />
              <Table.Column
                dataIndex="customer_email"
                title={"Customer Email"}
                sorter
                defaultSortOrder={getDefaultSortOrder("customer_email")}
              />
              <Table.Column
                dataIndex="customer_phone"
                title={"Customer Phone"}
                sorter
                defaultSortOrder={getDefaultSortOrder("customer_phone")}
              />
              <Table.Column
                dataIndex="status"
                title={"Current Status"}
                render={(value: any[]) => {
                  // Sort by date, with entries without dates coming last
                  const sortedStatuses = [...value].sort((a, b) => {
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return (
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                  });

                  const latestStatus = sortedStatuses[0];
                  return <Tag color="blue">{latestStatus.status}</Tag>;
                }}
              />
              <Table.Column
                dataIndex="tracking_id"
                title={"Tracking ID"}
                sorter
                defaultSortOrder={getDefaultSortOrder("tracking_id")}
                render={(value: string) => {
                  const handleCopy = () => {
                    if (value) {
                      navigator.clipboard
                        .writeText(value)
                        .then(() => {
                          message.success("Tracking ID copied to clipboard");
                        })
                        .catch(() => {
                          message.error("Failed to copy tracking ID");
                        });
                    }
                  };

                  return (
                    <Space>
                      <span
                        style={{
                          display: "inline-block",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {value || "-"}
                      </span>
                      {value && (
                        <Tooltip title="Copy tracking ID">
                          <CopyOutlined
                            onClick={handleCopy}
                            style={{ cursor: "pointer", color: "#1890ff" }}
                          />
                        </Tooltip>
                      )}
                    </Space>
                  );
                }}
              />
              <Table.Column
                dataIndex="order_products"
                title={"Products Count"}
                render={(value: any[]) => value?.length || 0}
                sorter
                defaultSortOrder={getDefaultSortOrder("order_products")}
              />
              <Table.Column
                title={"Actions"}
                dataIndex="actions"
                render={(_, record: BaseRecord) => (
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
  formProps: FormProps<IOrderFilterVariables>;
  setFilters?: (filters: CrudFilters) => void;
}

const Filter: React.FC<FilterProps> = ({ formProps, setFilters }) => {
  const handleReset = () => {
    formProps.form?.resetFields();
    setFilters?.([]);
  };

  // Updated with the actual statuses that appear in the JSON data
  // const statusOptions = [
  //   { label: "Ordered", value: "Ordered" },
  //   { label: "Dispatched", value: "Dispatched" },
  //   { label: "In Transit", value: "In Transit" },
  //   { label: "Delivered", value: "Delivered" },
  // ];

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Customer Email" name="customer_email">
        <Input placeholder="Search by email" prefix={<SearchOutlined />} />
      </Form.Item>
      {/* <Form.Item label="Status" name="status">
        <Select
          allowClear
          placeholder="Select status"
          options={statusOptions}
        />
      </Form.Item> */}
      <Form.Item label="Amount Range" name="total_amount">
        <Input.Group compact>
          <Form.Item name={["total_amount", 0]} noStyle>
            <Input style={{ width: 100 }} placeholder="Min Amount" min={0} />
          </Form.Item>
          <Input
            style={{
              width: 30,
              borderLeft: 0,
              borderRight: 0,
              pointerEvents: "none",
              backgroundColor: "#fff",
            }}
            placeholder="~"
            disabled
          />
          <Form.Item name={["total_amount", 1]} noStyle>
            <Input style={{ width: 100 }} placeholder="Max Amount" min={0} />
          </Form.Item>
        </Input.Group>
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
