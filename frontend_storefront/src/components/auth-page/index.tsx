"use client";
import type { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase } from "@components/pages/auth";

export const AuthPage = (props: AuthPageProps) => {
  return (
    <AuthPageBase
      {...props}
      renderContent={(content) => <div>{content}</div>}
    />
  );
};
