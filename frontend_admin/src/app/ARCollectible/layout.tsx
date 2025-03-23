import { Header } from "@components/header";
import { authProviderServer } from "@providers/auth-provider/auth-provider.server";
import { ThemedLayoutV2 } from "@refinedev/antd";
import Head from "next/head";
import { redirect } from "next/navigation";
import Script from "next/script";
import React from "react";
import "@app/ui/global.css";

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  if (!data.authenticated) {
    return redirect(data?.redirectTo || "/login");
  }

  return (
    <>
      <ThemedLayoutV2 Header={Header}>{children}</ThemedLayoutV2>
    </>
  );
}

async function getData() {
  const { authenticated, redirectTo } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
  };
}
