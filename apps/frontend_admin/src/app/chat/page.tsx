"use client";
import { useState, useEffect } from "react";
import { ProChat } from "@ant-design/pro-chat";
import { useThemedLayoutContext } from "@refinedev/antd";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { useTheme } from "antd-style";

export default function ChatPage() {
  const theme = useTheme();
  const [showComponent, setShowComponent] = useState(false);
  useEffect(() => setShowComponent(true), []);
  return (
    <div
      style={{
        backgroundColor: theme.colorBgLayout,
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
            color: theme.colorPrimaryText, // Added appropriate text color
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
