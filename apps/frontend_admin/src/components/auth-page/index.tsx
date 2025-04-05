"use client";
import { AuthPage as AuthPageBase } from "@components/pages/auth";
import type { AuthPageProps } from "@refinedev/core";

export const AuthPage = (props: AuthPageProps) => {
  return (
    <AuthPageBase
      {...props}
      formProps={{
        initialValues: {
          email: "",
          password: "",
        },
      }}
    />
  );
};
