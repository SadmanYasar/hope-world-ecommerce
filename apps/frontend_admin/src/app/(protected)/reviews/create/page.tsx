"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Rate } from "antd";

export default function ReviewCreate() {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: orderSelectProps } = useSelect({
    resource: "orders",
    optionLabel: "tracking_id",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Product"
          name="product_id"
          rules={[
            {
              required: true,
              message: "Please select a product",
            },
          ]}
        >
          <Select
            {...productSelectProps}
            placeholder="Select product"
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Order"
          name="order_id"
          rules={[
            {
              required: true,
              message: "Please select an order",
            },
          ]}
        >
          <Select
            {...orderSelectProps}
            placeholder="Select order"
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Rating"
          name="rating"
          rules={[
            {
              required: true,
              message: "Please rate the product",
            },
          ]}
        >
          <Rate />
        </Form.Item>

        <Form.Item label="Comment" name="comment">
          <Input.TextArea rows={5} />
        </Form.Item>
      </Form>
    </Create>
  );
}
