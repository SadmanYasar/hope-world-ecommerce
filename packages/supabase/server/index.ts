import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SUPABASE_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
} from "../utils/constants";

interface SupabaseClientOptions {
  admin?: boolean | undefined;
}

export const createSupabaseServerClient = ({
  admin = false,
}: SupabaseClientOptions = {}) => {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL,
    admin ? SUPABASE_SERVICE_KEY : SUPABASE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
