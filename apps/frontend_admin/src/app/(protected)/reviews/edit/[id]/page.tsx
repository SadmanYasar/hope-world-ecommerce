"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Rate } from "antd";

export default function ReviewEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm({
    meta: {
      select: "*",
    },
  });

  const reviewData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
    </Edit>
  );
}
