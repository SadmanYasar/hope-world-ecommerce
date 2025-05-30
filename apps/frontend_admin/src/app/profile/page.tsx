"use client";
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Card,
  Typography,
  Avatar,
  Divider,
  message,
  Row,
  Col,
  Space,
} from "antd";
import { useGetIdentity, useLogout, useUpdate } from "@refinedev/core";
import {
  LoadingOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { supabaseBrowserClient } from "supabase-package/client";
import { downloadImage } from "supabase-package/utils/downloadImage";
import Link from "next/link";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: user, isLoading: userLoading } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const { mutate: updateProfile } = useUpdate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });

      if (user.avatar_url) {
        downloadImage({
          path: user.avatar_url,
          callBackSuccess: (url) => setAvatarUrl(url),
          callBackError: () => setAvatarUrl(null),
        });
      }
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    setProfileLoading(true);
    try {
      await updateProfile({
        resource: "profiles",
        id: user?.id,
        values: {
          ...values,
          avatar_url: form.getFieldValue("avatar_url") || user?.avatar_url,
        },
      });
      message.success("Profile updated successfully");
    } catch (error) {
      message.error("Failed to update profile");
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
    }
    return isImage && isLt5M;
  };

  const handleChange: UploadProps["onChange"] = async (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setUploading(true);
      return;
    }

    if (info.file.originFileObj && user) {
      try {
        setUploading(true);
        const file = info.file.originFileObj;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()
          .toString(36)
          .substring(2)}`;
        const filePath = `${fileName}.${fileExt}`;

        // Remove old avatar if exists
        const oldAvatarPath = user.avatar_url;
        if (oldAvatarPath) {
          await supabaseBrowserClient.storage
            .from("avatars")
            .remove([oldAvatarPath]);
        }

        // Upload new avatar
        const { error: uploadError } = await supabaseBrowserClient.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Update form field
        form.setFieldValue("avatar_url", filePath);

        // Update preview
        downloadImage({
          path: filePath,
          callBackSuccess: (url) => setAvatarUrl(url),
          callBackError: () => setAvatarUrl(null),
        });

        // Update profile in database
        await updateProfile({
          resource: "profiles",
          id: user.id,
          values: {
            ...form.getFieldsValue(),
            avatar_url: filePath,
          },
        });

        message.success("Avatar updated successfully");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        message.error("Failed to upload avatar");
      } finally {
        setUploading(false);
      }
    }
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  if (userLoading) {
    return (
      <Card
        loading
        style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}
      />
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <Link href="/">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          Back to Dashboard
        </Button>
      </Link>

      <Card>
        <Title level={2}>Profile Settings</Title>
        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}>
              <Avatar
                src={avatarUrl}
                size={120}
                style={{ backgroundColor: "#1890ff" }}
              >
                {user?.first_name?.charAt(0)?.toUpperCase() ||
                  user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
            </div>

            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={({ onSuccess }) => {
                if (onSuccess) onSuccess("ok");
              }}
            >
              {uploading ? <LoadingOutlined /> : <div>Change Avatar</div>}
            </Upload>

            <Text type="secondary">Click to upload a new avatar</Text>
          </Col>

          <Col xs={24} sm={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                username: user?.username || "",
                first_name: user?.first_name || "",
                last_name: user?.last_name || "",
              }}
            >
              <Form.Item name="avatar_url" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input placeholder="Enter your username" />
              </Form.Item>

              <Form.Item label="Email">
                <Input value={user?.email || ""} disabled />
              </Form.Item>

              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input placeholder="Enter your first name" />
              </Form.Item>

              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input placeholder="Enter your last name" />
              </Form.Item>

              <Space size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={profileLoading}
                >
                  Save Changes
                </Button>

                <Button danger onClick={() => logout()}>
                  Logout
                </Button>

                <Link href="/forgot-password">
                  <Button>Change Password</Button>
                </Link>
              </Space>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProfilePage;
