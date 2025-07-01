import { Breadcrumb } from "@components/breadcrumb";
// import { authProviderServer } from "@providers/auth-provider/auth-provider.server";
import { authProviderServer } from "auth-provider-server";

import { redirect } from "next/navigation";
import React from "react";
import Navbar from "./Navbar";
import ChatBot from "@components/chat/chat";

export default async function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar filter />
      {children}
      <ChatBot />
    </>
  );
}
