"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Button, DatePicker, Select } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

export default function OrderCreate() {
  const { formProps, saveButtonProps } = useForm({});

  const statusOptions = [
    { label: "Ordered", value: "Ordered" },
    { label: "Dispatched", value: "Dispatched" },
    { label: "In Transit", value: "In Transit" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Total Amount (Cents)"}
          name={["total_amount"]}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label={"Customer Email"}
          name={["customer_email"]}
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={"Customer Phone"} name={["customer_phone"]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={"Billing Address"}
          name={["billing_address"]}
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label={"Shipping Address"}
          name={["shipping_address"]}
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label={"Status Timeline"}
          initialValue={[{ status: "Ordered" }]}
        >
          <Form.List name={["status"]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "date"]}
                      style={{ marginRight: 8, flex: 1 }}
                    >
                      <DatePicker
                        placeholder="Select date"
                        style={{ width: "100%" }}
                        format="MM/DD/YYYY"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "status"]}
                      style={{ marginRight: 8, flex: 1 }}
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Select status"
                        options={statusOptions}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    )}
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Status
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Create>
  );
}
