"use server";

import { createSupabaseServerClient } from "supabase-package/server";

//a function to get the list of users based on search input from auth.users
export async function getUserList(
  page: number,
  perPage: number
) {
  const {
    data: { users },
    error,
  } = await createSupabaseServerClient({ admin: true }).auth.admin.listUsers({
    page,
    perPage,
  });

  return users.map((user) => user.email);
}
