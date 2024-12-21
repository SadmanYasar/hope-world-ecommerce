"use client";
import { supabaseBrowserClient } from "@utils/supabase/client";
import type { FormProps } from 'antd';
import { Button, Form, Input, InputNumber } from "antd";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import Email from "./_components/email";
import { useState } from "react";

import { useNotification } from "@refinedev/core";
import { render } from "@react-email/components";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

export default function ChatPage() {
    const [html, setHtml] = useState<string>();
    const { open, close } = useNotification();

    const onFinish: FormProps["onFinish"] = async (values) => {
        //return if values has no to, subject, or content
        if (!values.to || !values.subject || !html) {
            return;
        }

        try {
            const response = await supabaseBrowserClient.functions.invoke('email',
                {
                    body: {
                        to: values.to,
                        subject: values.subject,
                        html: await render(<Email content={html} />)
                    },
                    method: 'POST'
                })

            console.log(response);

            if (response.error) {
                open?.({
                    message: "Email failed",
                    description: response.error,
                    type: "error"
                });
                return;
            } else {
                open?.({
                    message: "Email sent",
                    description: "Email sent successfully",
                    type: "success"
                });
            }
        } catch (error) {
            console.error(error);
            open?.({
                message: "Email failed",
                description: "Email failed to send",
                type: "error"
            });
        }
    }

    return (
        <>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label={"Recipient Email"}
                    name={["to"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={"Subject"}
                    name="subject"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={"Content"}
                    name="html"
                    rules={[
                        {
                            required: true,
                            validator: (_, value) => {
                                if (!html) {
                                    return Promise.reject(new Error('Content is required'));
                                }
                                return Promise.resolve();
                            }
                        },
                    ]}
                    onReset={() => setHtml("")}
                >
                    <div>
                        <MDEditor value={html} onChange={setHtml} />
                    </div>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Send
                    </Button>
                </Form.Item>

            </Form>
        </>
    );
}