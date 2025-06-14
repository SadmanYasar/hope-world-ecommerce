"use server";

import { PUBLIC_URL } from "supabase-package/utils/constants";
import { createSupabaseServerClient } from "supabase-package/server";
// import { redirect } from "next/navigation";

type Role = "admin" | "moderator" | "customer";

export async function updateUserRole(userId: string, role: Role) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("user_roles")
    .update({ role })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }

  // Remove redirect to keep users on the same page after role update
  // redirect(`/users`);
}
