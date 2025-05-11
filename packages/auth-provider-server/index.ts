import type { AuthProvider } from "@refinedev/core";
import { createSupabaseServerClient } from "../supabase/server";
import { jwtDecode } from "jwt-decode";

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    const supabaseClient = createSupabaseServerClient();

    const { data, error } = await supabaseClient.auth.getUser();
    const { user } = data;

    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();
    const access_token = session?.access_token;

    //decode access token and get user role
    let userRole: string | null = null;
    if (access_token) {
      const jwt: any = jwtDecode(access_token);
      userRole = jwt?.user_role;
    }

    console.log("user permission", userRole);

    if (
      error ||
      sessionError ||
      !userRole ||
      !["admin", "moderator"].includes(userRole)
    ) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
};
