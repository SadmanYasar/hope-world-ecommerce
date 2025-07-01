"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { supabaseBrowserClient } from "supabase-package/client";
import { normalizeFile } from "@utils/supabase/normalize";
import { Form, Input, InputNumber, Select, Upload } from "antd";
import { RcFile } from "antd/lib/upload/interface";

export default function ProductEdit() {
  const { formProps, saveButtonProps, query } = useForm({
    meta: {
      select: "id, name, description, price, images, category, visible",
    },
  });

  const productsData = query?.data?.data;

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    defaultValue: productsData?.category || "",
    optionLabel: "text",
    optionValue: "id",
    queryOptions: {
      enabled: !!productsData,
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={query?.isLoading}>
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
          initialValue={formProps?.initialValues?.category}
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
            getValueFromEvent={(event) => {
              return normalizeFile(event);
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
                Drag and drop an image (png/jpg)
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
          label={"Visible"}
          name={["visible"]}
          valuePropName="checked"
        >
          <Select
            options={[
              { label: "True", value: true },
              { label: "False", value: false },
            ]}
            style={{ width: "100%" }}
            defaultValue={productsData?.visible ? true : false}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
}
