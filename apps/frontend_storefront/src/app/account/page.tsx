"use client";
import { useGetIdentity, usePermissions } from "@refinedev/core";
import AccountForm from "./account-form";
import { type User } from "@supabase/supabase-js";
import Loading from "@components/ui/loading";

export default function Account() {
  const { data, error, isLoading } = useGetIdentity();

  if (isLoading) return <Loading />;
  if (error) return <div>Error getting user</div>;

  return <AccountForm user={data as User} />;
}
