"use client";
import { Markdown, Html } from "@react-email/components";

interface EmailProps {
  content: string;
}

export default function Email({ content }: EmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Markdown>{content}</Markdown>
    </Html>
  );
}
