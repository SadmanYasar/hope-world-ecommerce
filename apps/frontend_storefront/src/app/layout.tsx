import { DevtoolsProvider } from "@providers/devtools";
import { GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import liveProvider from "live-provider";
import { Metadata } from "next";
import React, { Suspense } from "react";

// import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { authProviderClient } from "auth-provider-client";
import { dataProvider } from "data-provider-package";
import "@styles/global.css";
import { notificationProvider } from "@providers/notification-provider";
import ToastProvider from "@providers/notification-provider/toast.provider";
import { supabaseBrowserClient } from "supabase-package/client";

export const metadata: Metadata = {
  title: "Hope World",
  description: "Hope World Ecommerce Storefront",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <RefineKbarProvider>
            <DevtoolsProvider>
              <Refine
                routerProvider={routerProvider}
                authProvider={authProviderClient}
                dataProvider={dataProvider}
                notificationProvider={notificationProvider}
                liveProvider={liveProvider}
                options={{
                  syncWithLocation: false,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "eG5OPR-xaQxJb-VqAe4M",
                }}
              >
                <ToastProvider>{children}</ToastProvider>
                <RefineKbar />
              </Refine>
            </DevtoolsProvider>
          </RefineKbarProvider>
        </Suspense>
      </body>
    </html>
  );
}
