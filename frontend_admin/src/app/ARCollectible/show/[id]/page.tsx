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
import { Button, Typography } from "antd";
import Script from "next/script";
import { useState } from "react";

const { Title } = Typography;

export default function ProductShow() {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;
  const [preview, setPreview] = useState(false);

  const record = data?.data;

  return (
    <>
      <Button onClick={() => setPreview(!preview)}>Preview</Button>
      <Show isLoading={isLoading}>
        <Title level={5}>{"ID"}</Title>
        <TextField value={record?.id} />
        <Title level={5}>{"Name"}</Title>
        <TextField value={record?.name} />
        <Title level={5}>{"Image"}</Title>
        <ImageField value={record?.image} />
      </Show>
      <ARViewComponent />
    </>
  );
}

export function ARViewComponent({
  preview = false,
  asset,
}: {
  preview?: boolean;
  asset?: string;
}) {
  if (!preview) {
    return null;
  }

  return (
    <>
      <Script src="https://raw.githack.com/AR-js-org/studio-backend/master/src/modules/marker/tools/gesture-detector.js" />
      <Script src="https://raw.githack.com/AR-js-org/studio-backend/master/src/modules/marker/tools/gesture-handler.js" />
      <Script src="https://aframe.io/releases/0.9.2/aframe.min.js" />
      <Script src="https://raw.githack.com/jeromeetienne/AR.js/master/aframe/build/aframe-ar.min.js" />
      <Script src="https://raw.githack.com/donmccurdy/aframe-extras/master/dist/aframe-extras.loaders.min.js" />

      <div style={{ margin: 0, overflow: "hidden" }}>
        <a-scene
          vr-mode-ui="enabled: false;"
          loading-screen="enabled: false;"
          arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          id="scene"
          embedded
          gesture-detector
        >
          <a-marker id="animated-marker" type="barcode" value="10">
            <a-image
              src={asset}
              scale="10 10 10"
              class="clickable"
              rotation="-90 0 0"
              gesture-handler
            ></a-image>
          </a-marker>
          <a-entity camera></a-entity>
        </a-scene>
      </div>
    </>
  );
}
