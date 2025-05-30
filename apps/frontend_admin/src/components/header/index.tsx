"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Avatar,
  Layout as AntdLayout,
  Space,
  Switch,
  theme,
  Typography,
  Dropdown,
  Menu,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { downloadImage } from "supabase-package/utils/downloadImage";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
  avatar_url?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const { mutate: logout } = useLogout();

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const displayName =
    user?.name ||
    user?.username ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.last_name || "User");

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <UserOutlined />,
          label: <Link href="/profile">Profile</Link>,
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: <a onClick={() => logout()}>Logout</a>,
        },
      ]}
    />
  );

  useEffect(() => {
    // Download avatar image if user data is available
    if (user?.avatar_url) {
      downloadImage({
        path: user.avatar_url,
        callBackSuccess: (url) => setAvatarUrl(url),
        callBackError: () => setAvatarUrl(null),
      });
    } else {
      setAvatarUrl(null);
    }
  }, [user?.avatar_url]);

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        {(displayName || user?.avatar || user?.avatar_url) && (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <Space
              style={{ marginLeft: "8px", cursor: "pointer" }}
              size="middle"
            >
              {displayName && <Text strong>{displayName}</Text>}
              <Avatar
                src={avatarUrl || user?.avatar || user?.avatar_url}
                alt={displayName}
                icon={
                  !user?.avatar && !user?.avatar_url ? (
                    <UserOutlined />
                  ) : (
                    <Avatar src={avatarUrl || user?.avatar_url} />
                  )
                }
              />
            </Space>
          </Dropdown>
        )}
      </Space>
    </AntdLayout.Header>
  );
};
