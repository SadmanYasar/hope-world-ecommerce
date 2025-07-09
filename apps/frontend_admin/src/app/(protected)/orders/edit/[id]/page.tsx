"use client";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Edit, useForm } from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AddressFields from "./addressFields";

// Enable custom parse format for dayjs
dayjs.extend(customParseFormat);

export default function OrderEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm();

  // Format dates when the form is submitted
  const onFinish = (values: BaseRecord) => {
    // Make a deep copy of the values to avoid modifying the original
    const processedValues = { ...values };

    // Format the status dates if they exist
    if (processedValues.status && Array.isArray(processedValues.status)) {
      processedValues.status = processedValues.status.map((statusItem: BaseRecord) => {
        if (statusItem.date && typeof statusItem.date === "object") {
          // Convert dayjs object to string format
          return {
            ...statusItem,
            date: statusItem.date.format("MM/DD/YYYY"),
          };
        }
        return statusItem;
      });
    }

    // Call the original onFinish with processed values
    return formProps.onFinish && formProps.onFinish(processedValues);
  };

  const statusOptions = [
    { label: "Ordered", value: "Ordered" },
    { label: "Dispatched", value: "Dispatched" },
    { label: "In Transit", value: "In Transit" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  // Get the record data
  const record = queryResult?.data?.data;

  // Convert status date strings to dayjs objects before form rendering
  const initialValues = { ...record };
  if (initialValues?.status && Array.isArray(initialValues.status)) {
    initialValues.status = initialValues.status.map((item: BaseRecord) => {
      if (item.date) {
        // Handle dates with single-digit days
        try {
          // Parse the date parts
          const parts = item.date.split('/');
          if (parts.length === 3) {
            const month = parseInt(parts[0], 10);
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            
            // Create a valid date string
            return {
              ...item,
              date: dayjs(new Date(year, month - 1, day))
            };
          }
          return { ...item, date: dayjs(item.date, "MM/DD/YYYY") };
        } catch (error) {
          console.error("Error parsing date:", error);
          return item;
        }
      }
      return item;
    });
  }



  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
      >
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

        <AddressFields prefix="billing_address" label="Billing Address" />
        <AddressFields prefix="shipping_address" label="Shipping Address" />

        <Form.Item label={"Tracking ID"} name={["tracking_id"]}>
          <Input />
        </Form.Item>

        <Form.Item label={"Status Timeline"}>
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
                    >
                      <Select
                        placeholder="Select status"
                        options={statusOptions}
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
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
    </Edit>
  );
}
