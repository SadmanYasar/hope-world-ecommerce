"use client";
import {
  useTable,
  useSelect,
  DateField,
  EditButton,
  ShowButton,
  MarkdownField,
  List,
  getDefaultSortOrder,
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
import { FormProps } from "antd/lib";

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
  price: number; // Added price property
}

interface IProductFilterVariables {
  name?: string;
  category?: string;
  createdAt?: [Date, Date];
  price?: [string | number | undefined, string | number | undefined]; // Updated price range type
}

export default function ProductsPage() {
  const {
    tableProps,
    searchFormProps,
    setSorters,
    sorters,
    setFilters,
    filters,
  } = useTable<IProduct, HttpError, IProductFilterVariables>({
    // syncWithLocation: true,
    meta: {
      select:
        "id, name, description, price, images, category(id,text), created_at, visible, rating",
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    filters: {
      defaultBehavior: "replace",
      initial: [],
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { name, category, createdAt, price } = params;

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

      // Add minimum price filter if provided and is a valid number
      if (price && price[0] && !isNaN(Number(price[0]))) {
        filters.push({
          field: "price",
          operator: "gte",
          value: Number(price[0]),
        });
      }

      // Add maximum price filter if provided and is a valid number
      if (price && price[1] && !isNaN(Number(price[1]))) {
        filters.push({
          field: "price",
          operator: "lte",
          value: Number(price[1]),
        });
      }

      console.log("Filters applied:", filters);
      return filters;
    },
  });

  console.log(filters);

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
            <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
              <Table.Column
                dataIndex="id"
                title="ID"
                sorter
                defaultSortOrder={getDefaultSortOrder("id")}
              />
              <Table.Column
                dataIndex="name"
                title="Name"
                sorter
                defaultSortOrder={getDefaultSortOrder("name")}
              />
              <Table.Column
                dataIndex="price"
                title="Price"
                render={(value) => `$${value?.toFixed(2) || 0}`}
                sorter
                defaultSortOrder={getDefaultSortOrder("price")}
              />
              <Table.Column
                dataIndex="rating"
                title="Rating"
                render={(value) => `${value || 0}`}
                sorter
                defaultSortOrder={getDefaultSortOrder("rating")}
              />
              <Table.Column
                dataIndex="category"
                title="Category"
                render={(value: ICategory | null) => {
                  if (!value) return "-";
                  return value.text;
                }}
                sorter
                defaultSortOrder={getDefaultSortOrder("category")}
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
                sorter
                defaultSortOrder={getDefaultSortOrder("created_at")}
              />
              <Table.Column
                dataIndex="visible"
                title="Visible"
                render={(value) => (value ? "Yes" : "No")}
                sorter
                defaultSortOrder={getDefaultSortOrder("visible")}
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
  formProps: FormProps<IProductFilterVariables>;
  setFilters?: (filters: CrudFilters) => void;
}

const Filter: React.FC<FilterProps> = ({ formProps, setFilters }) => {
  const { selectProps: categorySelectProps } = useSelect<ICategory>({
    resource: "categories",
    optionLabel: "text",
    optionValue: "id",
  });

  const handleReset = () => {
    formProps.form?.resetFields();
    setFilters?.([]);
  };

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
      <Form.Item label="Price Range" name="price">
        <Input.Group compact>
          <Form.Item name={["price", 0]} noStyle>
            <Input style={{ width: 100 }} placeholder="Min Price" min={0} />
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
          <Form.Item name={["price", 1]} noStyle>
            <Input style={{ width: 100 }} placeholder="Max Price" min={0} />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item label="Created At" name="createdAt">
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
