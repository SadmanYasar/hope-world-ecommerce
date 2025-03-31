"use server";

import { supabaseBrowserClient } from "@utils/supabase/client";

export async function getProducts(page: number = 1, pageSize: number = 20) {
  const { data, error } = await supabaseBrowserClient
    .from("products")
    .select("id, name, price, stock, images")
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data,
    nextPage: data.length === pageSize ? page + 1 : null,
  };
}
