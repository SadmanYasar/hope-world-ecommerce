import { Header } from "@components/header";
// import { authProviderServer } from "@providers/auth-provider/auth-provider.server";
import { ThemedLayoutV2 } from "@refinedev/antd";
import Head from "next/head";
import { redirect } from "next/navigation";
import Script from "next/script";
import React from "react";
import "@app/ui/global.css";
import { authProviderServer } from "auth-provider-server";

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  if (
    !data.authenticated ||
    !["admin", "moderator"].includes(data.role || "")
  ) {
    return redirect(data?.redirectTo || "/login");
  }

  return (
    <>
      <ThemedLayoutV2 Header={Header}>{children}</ThemedLayoutV2>
    </>
  );
}

async function getData() {
  const { authenticated, redirectTo, role } =
    (await authProviderServer.check()) as {
      authenticated: boolean;
      redirectTo?: string;
      role: string | null;
    };

  return {
    authenticated,
    redirectTo,
    role,
  };
}
