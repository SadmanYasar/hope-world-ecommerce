"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { normalizeFile } from "@utils/supabase/normalize";
import { Form, Input, InputNumber, Upload } from "antd";
import { RcFile } from "antd/lib/upload/interface";

export default function ProductCreate() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Name"}
          name={["name"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Description"}
          name="description"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
        <Form.Item
          label={"Category"}
          name={["category"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Images">
          <Form.Item
            name="images"
            valuePropName="fileList"
            normalize={(event) => {
              const normalized = normalizeFile(event);
              return normalized.length > 0 ? [normalized[0]] : [];
            }}
            noStyle
          >
            <Upload.Dragger
              name="file"
              listType="picture"
              accept="image/png, image/jpeg, image/gif"
              maxCount={2}
              customRequest={async ({ file, onError, onSuccess }) => {
                try {
                  const rcFile = file as RcFile;
                  await supabaseBrowserClient.storage
                    .from("Product")
                    .upload(`public/${rcFile.name}`, file, {
                      cacheControl: "3600",
                      upsert: true,
                    });

                  const { data } = await supabaseBrowserClient.storage
                    .from("Product")
                    .getPublicUrl(`public/${rcFile.name}`);

                  const xhr = new XMLHttpRequest();
                  onSuccess?.({ url: data?.publicUrl }, xhr);
                } catch (error) {
                  onError?.(new Error("Upload Error"));
                }
              }}
            >
              <p className="ant-upload-text">
                Drag and drop an image (png/jpg, 2 Images, Max 5MB)
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={"Price"}
          name={["price"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label={"Stock"}
          name={["stock"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
      </Form>
    </Create>
  );
}
