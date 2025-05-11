"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { toast } from "react-toastify";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (error) {
      return {
        success: false,
        error,
      };
    }

    if (data?.session) {
      await supabaseBrowserClient.auth.setSession(data.session);

      return {
        success: true,
        redirectTo: "/",
      };
    }

    // for third-party login
    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseBrowserClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Register failed",
        name: "Invalid email or password",
      },
    };
  },
  check: async () => {
    const { data, error } = await supabaseBrowserClient.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }

    console.log(user);

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  forgotPassword: async ({ email }) => {
    const result = await supabaseBrowserClient.auth.resetPasswordForEmail(
      email
    );
    console.log(result);

    if (!result.error) {
      toast.success("Password reset instructions sent to " + email);

      return {
        success: true,
      };
    }

    return {
      success: false,
      error: {
        name: "Error",
        message: "Invalid email",
      },
    };
  },

  updatePassword: async ({ password }) => {
    if (!password) {
      return {
        success: false,
        error: {
          name: "Error",
          message: "Invalid Request",
        },
      };
    }

    const result: any = await supabaseBrowserClient.auth.updateUser({
      password,
    });

    if (result.ok) {
      toast.success("Password updated successfully");

      return {
        success: true,
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    return {
      success: false,
      error: {
        name: "Error",
        message: "Failed to update password",
      },
    };
  },

  getPermissions: async () => {
    const user = await supabaseBrowserClient.auth.getUser();

    if (user) {
      return user.data.user?.role;
    }

    return null;
  },
  getIdentity: async () => {
    const user = await supabaseBrowserClient.auth.getUser();

    const { data: profile } = await supabaseBrowserClient
      .from("profiles")
      .select(`full_name, username, avatar_url`)
      .eq("id", user?.data?.user?.id)
      .single();

    if (user?.data?.user) {
      return {
        ...user.data.user,
        name: user.data.user.email,
        avatar: profile?.avatar_url,
        username: profile?.username,
        full_name: profile?.full_name,
      };
    }

    // if (data?.user) {
    //   return {
    //     ...data.user,
    //     name: data.user.email,
    //   };
    // }

    return null;
  },
  onError: async (error) => {
    if (error?.code === "PGRST301" || error?.code === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
