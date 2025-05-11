"use client";
import { useGetIdentity, usePermissions } from "@refinedev/core";
import AccountForm from "./account-form";
import { type User } from "@supabase/supabase-js";

export default function Account() {
  const { data, error, isLoading } = useGetIdentity();
  const role = usePermissions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error getting user</div>;

  return <AccountForm user={data as User} />;
}
