"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { supabaseBrowserClient } from "supabase-package/client";
import { normalizeFile } from "@utils/supabase/normalize";
import { Form, Input, InputNumber, Upload, Select } from "antd";
import { RcFile } from "antd/lib/upload/interface";

export default function ProductCreate() {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    optionLabel: "text",
    optionValue: "id",
  });

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
          name={"category"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...categorySelectProps} />
        </Form.Item>
        <Form.Item label="Images">
          <Form.Item
            name="images"
            valuePropName="fileList"
            normalize={normalizeFile}
            noStyle
          >
            <Upload.Dragger
              name="file"
              listType="picture"
              accept="image/png, image/jpeg, image/webp, image/gif"
              multiple
              maxCount={2}
              customRequest={async ({ file, onError, onSuccess }) => {
                try {
                  const rcFile = file as RcFile;
                  await supabaseBrowserClient.storage
                    .from("products")
                    .upload(`public/${rcFile.name}`, file, {
                      cacheControl: "3600",
                      upsert: true,
                    });

                  const { data } = await supabaseBrowserClient.storage
                    .from("products")
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
        {/* Input to set visibility field which will be a dropdown of value true or false */}
        <Form.Item
          label={"Visible"}
          name={["visible"]}
          valuePropName="checked"
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Select
            options={[
              { label: "True", value: true },
              { label: "False", value: false },
            ]}
            defaultValue={true}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
