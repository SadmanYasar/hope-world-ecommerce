"use client";

import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export default function CategoryShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  console.log("CategoryShow record:", data);

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Text"}</Title>
      <TextField value={record?.text} />
    </Show>
  );
}
