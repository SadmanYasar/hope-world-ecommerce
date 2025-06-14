"use client";

import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord, CrudFilters, HttpError } from "@refinedev/core";
import { Space, Table, Card, Row, Col, Form, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FormProps } from "antd/lib";

interface ICategory {
  id: string;
  text: string;
}

interface ICategoryFilterVariables {
  text?: string;
}

export default function CategoryList() {
  const { tableProps, searchFormProps, setFilters } = useTable<
    ICategory,
    HttpError,
    ICategoryFilterVariables
  >({
    syncWithLocation: true,
    filters: {
      defaultBehavior: "replace",
      initial: [],
    },
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { text } = params;

      filters.push({
        field: "text",
        operator: "containss",
        value: text,
      });

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
              <Table.Column dataIndex="id" title={"ID"} />
              <Table.Column dataIndex="text" title={"Text"} />
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
        </Col>
      </Row>
    </>
  );
}

interface FilterProps {
  formProps: FormProps<ICategoryFilterVariables>;
  setFilters?: (filters: CrudFilters) => void;
}

const Filter: React.FC<FilterProps> = ({ formProps, setFilters }) => {
  const handleReset = () => {
    formProps.form?.resetFields();
    setFilters?.([]);
  };

  return (
    <Form layout="vertical" {...formProps}>
      <Form.Item label="Category Name" name="text">
        <Input placeholder="Search category" prefix={<SearchOutlined />} />
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
