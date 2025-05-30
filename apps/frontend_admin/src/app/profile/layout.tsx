import React from "react";
import { Authenticated } from "@refinedev/core";
import { redirect } from "next/navigation";
import { authProviderServer } from "auth-provider-server";

export default async function ProfileLayout({ children }: React.PropsWithChildren) {
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
