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
import { Button, Col, Flex, Row, Typography } from "antd";
import Modal from "antd/lib/modal";
import Image from "next/image";
import Script from "next/script";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { QRCode, IProps } from "react-qrcode-logo";
import C from "../../c.png";
import { generateARHtml } from "ar_viewer";
import { STORE_URL } from "app-constants";

const { Title } = Typography;

interface IARCollectible {
  ecLevel: IProps["ecLevel"];
  logoImage: IProps["logoImage"];
  logoPadding: IProps["logoPadding"];
  size: IProps["size"];
}

export default function ARCollectibleShow() {
  const { query } = useShow({});
  const { data, isLoading } = query;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ref = useRef<QRCode>();
  const [state, setState] = useState<IARCollectible>({
    ecLevel: "H",
    logoImage: C.src,
    logoPadding: 4,
    size: 400,
  });
  const record = data?.data;

  useEffect(() => {
    if (record?.id) {
      setState((prev) => ({
        ...prev,
        value: `${STORE_URL}/AR/${record.id}`,
      }));
    }
  }, [record?.id]);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleDownload = () => {
    ref.current?.download();
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
    let url: string | null = null;
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
        <Row>
          <ImageField
            width={500}
            height={500}
            value={record?.image && JSON.parse(record?.image)?.[0]?.url}
          />
          <Flex vertical>
            <QRCode ref={ref as MutableRefObject<QRCode>} {...state} />
            <Button
              type="primary"
              onClick={handleDownload}
              style={{ marginTop: "20px" }}
            >
              Download QR Code
            </Button>
          </Flex>
        </Row>
      </Show>

      <Modal
        title="AR View"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        style={{ top: 0 }}
        styles={{ body: { height: "100vh", padding: 0 } }}
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
