"use client";

import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { normalizeFile } from "@utils/supabase/normalize";
import { Form, Input, InputNumber, Select, Upload } from "antd";
import { RcFile } from "antd/lib/upload/interface";

export default function ProductEdit() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
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
        <Form.Item label="Image">
          <Form.Item
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(event) => {
              const normalized = normalizeFile(event);
              return normalized.length > 0 ? [normalized[0]] : [];
            }}
            getValueProps={(value) => {
              if (typeof value === "string") {
                try {
                  const parsedValue = JSON.parse(value);
                  return { fileList: parsedValue };
                } catch {
                  return { fileList: [] };
                }
              }
              return { fileList: value || [] };
            }}
            noStyle
          >
            <Upload.Dragger
              name="file"
              listType="picture"
              accept="image/png, image/jpeg"
              maxCount={1}
              customRequest={async ({ file, onError, onSuccess }) => {
                try {
                  const rcFile = file as RcFile;
                  await supabaseBrowserClient.storage
                    .from("ar")
                    .upload(`public/${rcFile.name}`, file, {
                      cacheControl: "3600",
                      upsert: true,
                    });

                  const { data } = await supabaseBrowserClient.storage
                    .from("ar")
                    .getPublicUrl(`public/${rcFile.name}`);

                  const xhr = new XMLHttpRequest();
                  onSuccess?.({ url: data?.publicUrl }, xhr);
                } catch (error) {
                  onError?.(new Error("Upload Error"));
                }
              }}
            >
              <p className="ant-upload-text">
                Drag and drop an image (png/jpg)
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
      </Form>
    </Edit>
  );
}
