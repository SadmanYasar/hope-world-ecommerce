"use client";
import { useState, useEffect, useContext } from "react";
import { ProChat } from "@ant-design/pro-chat";
import { useThemedLayoutContext } from "@refinedev/antd";
import { supabaseBrowserClient } from "supabase-package/client";
import { useTheme } from "antd-style";
import { ColorModeContext } from "@contexts/color-mode";

export default function ChatPage() {
  const theme = useTheme();
  const { mode } = useContext(ColorModeContext);
  const [showComponent, setShowComponent] = useState(false);
  useEffect(() => setShowComponent(true), []);
  return (
    <div
      style={{
        background: theme.colorBgLayout,
        color: theme.colorPrimaryText,
        width: "100%",
        height: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showComponent && (
        <ProChat
          placeholder="Type a message..."
          helloMessage={"Hello! I am a chatbot. How can I help you today?"}
          style={{
            width: "100%",
            marginTop: "auto",
            color: mode === "dark" ? "black" : "white",
          }}
          locale="en-US"
          request={async (messages) => {
            const mockedData: string = `This is a simulated conversation data. ${
              messages.length
            } messages were passed in this session ${messages
              .map((m) => m.name)
              .join(", ")}`;

            console.log(messages);
            // return new Response(mockedData);

            const latestMessage = (messages[messages.length - 1] as any)
              .message;

            const response = await supabaseBrowserClient.functions.invoke(
              "search",
              {
                body: {
                  search: latestMessage,
                },
                method: "POST",
              }
            );

            return new Response(
              response.data?.response ??
                "Sorry, I am not sure how to help with that."
            );
          }}
        />
      )}
    </div>
  );
}
