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
import {
  useMany,
  type BaseRecord,
  CrudFilters,
  HttpError,
} from "@refinedev/core";
import {
  Space,
  Table,
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Image,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FormProps } from "antd/lib";
// import Image from "next/image";

const { RangePicker } = DatePicker;

interface IARCollectible {
  id: string;
  name: string;
  image: string;
  created_at: string;
}

interface IARCollectibleFilterVariables {
  name?: string;
  created_at?: [Date, Date];
}

export default function ARCollectibleList() {
  const { tableProps, tableQuery, searchFormProps, setFilters } = useTable<
    IARCollectible,
    HttpError,
    IARCollectibleFilterVariables
  >({
    // syncWithLocation: true,
    meta: {
      select: "*",
    },
    filters: {
      defaultBehavior: "replace",
      initial: [],
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { name, created_at: createdAt } = params;

      filters.push(
        {
          field: "name",
          operator: "containss",
          value: name,
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
            <Filter formProps={searchFormProps} setFilters={setFilters} />
          </Card>
        </Col>
        <Col lg={18} xs={24}>
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

                  return imageUrl ? (
                    <Image.PreviewGroup>
                      <Image
                        src={imageUrl}
                        alt={record.name}
                        width={50}
                        height={50}
                      />
                    </Image.PreviewGroup>
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
                dataIndex="created_at"
                title={"Created At"}
                render={(value) => <DateField format="LLL" value={value} />}
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
  formProps: FormProps<IARCollectibleFilterVariables>;
  setFilters?: (filters: CrudFilters) => void;
}

const Filter: React.FC<FilterProps> = ({ formProps, setFilters }) => {
  const handleReset = () => {
    formProps.form?.resetFields();
    setFilters?.([]);
  };

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Name" name="name">
        <Input placeholder="Search by name" prefix={<SearchOutlined />} />
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
