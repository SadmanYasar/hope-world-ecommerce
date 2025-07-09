import { Card, Col, Form, Input, Row } from "antd";

// Reusable AddressFields component
const AddressFields = ({
  prefix,
  label,
}: {
  prefix: string;
  label: string;
}) => (
  <Card title={label} size="small" style={{ marginBottom: "1rem" }}>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name={[prefix, "name"]} label="Name">
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={[prefix, "line1"]}
          label="Address Line 1"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name={[prefix, "line2"]} label="Address Line 2">
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={[prefix, "city"]}
          label="City"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item
          name={[prefix, "state"]}
          label="State"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          name={[prefix, "postal_code"]}
          label="Postal Code"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          name={[prefix, "country"]}
          label="Country"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
    </Row>
  </Card>
);

export default AddressFields;
