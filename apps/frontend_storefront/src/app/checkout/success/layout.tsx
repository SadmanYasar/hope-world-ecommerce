import { Breadcrumb } from "@components/breadcrumb";
// import { authProviderServer } from "@providers/auth-provider/auth-provider.server";
import { authProviderServer } from "auth-provider-server";

import { redirect } from "next/navigation";
import React from "react";
import { Authenticated } from "@refinedev/core";
import Navbar from "@app/(home)/Navbar";
import ChatBot from "@components/chat/chat";

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  return (
    <>
      <Navbar />
      {children}
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
