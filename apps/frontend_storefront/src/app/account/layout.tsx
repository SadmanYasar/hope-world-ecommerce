import { Breadcrumb } from "@components/breadcrumb";
// import { authProviderServer } from "@providers/auth-provider/auth-provider.server";
import { authProviderServer } from "auth-provider-server";

import { redirect } from "next/navigation";
import React from "react";
import { Authenticated } from "@refinedev/core";

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  if (!data.authenticated) {
    return redirect(data?.redirectTo || "/login");
  }

  return <>{children}</>;
}

async function getData() {
  const { authenticated, redirectTo } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
  };
}
