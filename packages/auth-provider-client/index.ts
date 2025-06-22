"use client";

import type { AuthProvider } from "@refinedev/core";
import { toast } from "react-toastify";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { supabaseBrowserClient } from "../supabase/client";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    console.log("Im called from packages!");

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
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        //show toast to verify email to login
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );

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
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );
    console.log(result);

    if (!result.error) {
      return {
        success: true,
        successNotification: {
          message: "Password reset instructions sent to " + email,
          description: "Please check your email to reset your password.",
        },
      };
    }

    return {
      success: false,
      error: {
        name: result.error?.message || "Error",
        message: "Failed to send password reset instructions",
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

    const result = await supabaseBrowserClient.auth.updateUser({
      password,
    });

    console.log("update password result", result);

    if (!result.error) {
      // toast.success("Password updated successfully");

      return {
        success: true,
        authenticated: false,
        logout: true,
        redirectTo: "/login",
        successNotification: {
          message: "Password updated successfully",
        },
      };
    }

    return {
      success: false,
      error: {
        name: result.error?.message || "Error",
        message: "Failed to update password",
      },
    };
  },

  getPermissions: async () => {
    const user = await supabaseBrowserClient.auth.getUser();

    const { data, error } = await supabaseBrowserClient.auth.getSession();

    //get access token from user session supabase
    const access_token = data?.session?.access_token;

    //decode access token and get user role
    let userRole = null;
    if (access_token) {
      const jwt: any = jwtDecode(access_token);
      userRole = jwt?.user_role;
    }

    console.log("user permission", userRole);

    if (user) {
      return userRole || user.data.user?.role;
    }

    return null;
  },
  getIdentity: async () => {
    const user = await supabaseBrowserClient.auth.getUser();
    console.log(user);

    const { data: profile } = await supabaseBrowserClient
      .from("profiles")
      .select(`first_name, last_name, username, avatar_url`)
      .eq("id", user?.data?.user?.id)
      .single();

    if (user?.data?.user) {
      return {
        ...user.data.user,
        name: user.data.user.email,
        avatar_url: profile?.avatar_url,
        username: profile?.username,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
      };
    }

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
