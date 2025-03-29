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
import Modal from "antd/lib/modal";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const { Title } = Typography;

// Generate the HTML content for the iframe with a robust stop mechanism
const generateARHtml = (imageSrc: string) => `
<!doctype html>
<html>
<head>
  <script src="https://raw.githack.com/AR-js-org/studio-backend/master/src/modules/marker/tools/gesture-detector.js"></script>
  <script src="https://raw.githack.com/AR-js-org/studio-backend/master/src/modules/marker/tools/gesture-handler.js"></script>
  <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
  <script src="https://raw.githack.com/jeromeetienne/AR.js/master/aframe/build/aframe-ar.min.js"></script>
  <script src="https://raw.githack.com/donmccurdy/aframe-extras/master/dist/aframe-extras.loaders.min.js"></script>
  <script>
    // Listen for a message to stop the camera stream
    window.addEventListener('message', function(event) {
      if (event.data === 'stopCamera') {
        const scene = document.querySelector('a-scene');
        const video = document.querySelector('video');
        if (video && video.srcObject) {
          const stream = video.srcObject;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
        if (scene && scene.camera) {
          scene.camera.stop(); // Attempt to stop A-Frame/AR.js camera
        }
      }
    });
  </script>
</head>
<body style="margin: 0; overflow: hidden;">
  <a-scene vr-mode-ui="enabled: false;" loading-screen="enabled: false;"
    arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
    id="scene" embedded gesture-detector>
    <a-marker id="animated-marker" type="barcode" value="10">
      <a-image src="${imageSrc}" scale="10 10 10" class="clickable" rotation="-90 0 0" gesture-handler></a-image>
    </a-marker>
    <a-entity camera></a-entity>
  </a-scene>
</body>
</html>
`;

export default function ProductShow() {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const iframeRef = useRef<any>(null);

  const record = data?.data;

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    // Send the stop message to the iframe before closing
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage("stopCamera", "*");
    }
    // Delay closing the modal slightly to ensure the message is processed
    setTimeout(() => {
      setIsModalVisible(false);
      setIframeSrc(""); // Clear the iframe source
    }, 100); // 100ms delay
  };

  useEffect(() => {
    let url: any;
    if (isModalVisible) {
      const imageSrc = record?.image && JSON.parse(record?.image)?.[0]?.url;
      const html = generateARHtml(imageSrc);
      const blob = new Blob([html], { type: "text/html" });
      url = URL.createObjectURL(blob);
      setIframeSrc(url);
    }
    // Cleanup function to revoke the blob URL when the modal closes or component unmounts
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [isModalVisible, record]);

  return (
    <>
      <Button onClick={handleOpenModal}>Preview</Button>
      <Show isLoading={isLoading}>
        <Title level={5}>{"ID"}</Title>
        <TextField value={record?.id} />
        <Title level={5}>{"Name"}</Title>
        <TextField value={record?.name} />
        <Title level={5}>{"Image"}</Title>
        <ImageField
          width={500}
          height={500}
          value={record?.image && JSON.parse(record?.image)?.[0]?.url}
        />
      </Show>
      <Modal
        title="AR View"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        style={{ top: 0 }}
        bodyStyle={{ height: "100vh", padding: 0 }}
      >
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="AR View"
            allow="camera"
          />
        )}
      </Modal>
    </>
  );
}