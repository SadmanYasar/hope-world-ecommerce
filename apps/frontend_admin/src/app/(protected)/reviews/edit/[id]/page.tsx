"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Rate } from "antd";

export default function ReviewEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm({
    meta: {
      select: "*, product:product_id(*), order:order_id(*)",
    },
  });
  
  const reviewData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Product"
          name={["product", "name"]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Order"
          name={["order", "tracking_id"]}
        >
          <Input disabled />
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

        <Form.Item
          label="Comment"
          name="comment"
        >
          <Input.TextArea rows={5} />
        </Form.Item>
      </Form>
    </Edit>
  );
}
