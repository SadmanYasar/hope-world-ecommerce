"use client";

import {
  DateField,
  ImageField,
  MarkdownField,
  NumberField,
  Show,
  TextField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Image, Typography } from "antd";
import { Carousel } from "antd/lib";

const { Title } = Typography;

export default function ProductShow() {
  const { query } = useShow({
    // MIGHT USE THIS FOR REVIEWS
    meta: {
      select: "*, category(id,text)",
    },
  });
  const { data, isLoading } = query;

  const record = data?.data;

  const { data: categoryData, isLoading: categoryIsLoading } = useOne({
    resource: "categories",
    id: record?.category?.id || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  console.log("record", record);

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Name"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Description"}</Title>
      <Title level={5}>{"Images"}</Title>
      <Image.PreviewGroup>
        {record?.images &&
          JSON.parse(record?.images).map((image: any, index: number) => (
            <Image
              width={500}
              height={500}
              src={image.url}
              key={index}
              alt=""
            />
          ))}
      </Image.PreviewGroup>
      <Title level={5}>{"Description"}</Title>
      <MarkdownField value={record?.description} />
      <Title level={5}>{"Category"}</Title>
      <TextField
        value={
          categoryIsLoading ? <>Loading...</> : <>{categoryData?.data?.text}</>
        }
      />
      <Title level={5}>{"Stock"}</Title>
      <NumberField value={record?.stock} />
      <Title level={5}>{"Price"}</Title>
      <NumberField value={record?.price} />
    </Show>
  );
}
