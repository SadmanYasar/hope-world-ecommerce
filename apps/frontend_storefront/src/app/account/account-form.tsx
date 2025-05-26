"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { type User } from "@supabase/supabase-js";
import { useForm } from "@refinedev/react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Dropzone, { type DropzoneState } from "react-dropzone";
import { supabaseBrowserClient } from "supabase-package/client";
import { downloadImage } from "supabase-package/utils/downloadImage";
import { useLogout, useNotification } from "@refinedev/core";
import Link from "next/link";
import { ArrowLeftCircle } from "lucide-react";
import { set } from "date-fns";

const DropzoneContent = ({
  isDragAccept,
  maxFiles,
}: {
  isDragAccept: boolean;
  maxFiles?: number;
}) => {
  if (isDragAccept) {
    return (
      <div className="text-sm font-medium text-center">
        Drop your file{maxFiles === 1 ? "" : "s"} here!
      </div>
    );
  }
  return (
    <div className="text-sm text-center">
      <p>
        Drag & drop {maxFiles === 1 ? "an image" : "some images"} here, or click
        to select.
      </p>
      <p className="text-xs text-muted-foreground">
        (Max {maxFiles || "multiple"} file{maxFiles === 1 ? "" : "s"}, up to 5MB
        each)
      </p>
    </div>
  );
};

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  avatar_url: z.string().optional().nullable(),
});

export default function AccountForm({ user }: { user: User | null }) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { mutate } = useLogout();
  const { open } = useNotification();

  const form = useForm<
    z.infer<typeof profileSchema>,
    any,
    z.infer<typeof profileSchema>
  >({
    resolver: zodResolver(profileSchema),
    refineCoreProps: {
      id: user?.id,
      resource: "profiles",
      meta: {
        select: "first_name, last_name, username, avatar_url",
      },
      action: "edit",
      redirect: false,
    },
  });

  const {
    refineCore: { onFinish, formLoading, query },
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form;

  const watchedAvatarUrl = watch("avatar_url");

  useEffect(() => {
    if (watchedAvatarUrl) {
      downloadImage({
        path: watchedAvatarUrl,
        callBackSuccess: (url) => setAvatarUrl(url),
        callBackError: () => setAvatarUrl(null),
      });
    } else {
      setAvatarUrl(null);
    }
  }, [watchedAvatarUrl]);

  useEffect(() => {
    if (query?.data?.data?.avatar_url) {
      setValue("avatar_url", query?.data?.data?.avatar_url, {
        shouldValidate: false,
      });
    }
  }, [query?.data?.data?.avatar_url, setValue]);

  // async function downloadImage(path: string) {
  //   try {
  //     const { data, error } = await supabaseBrowserClient.storage
  //       .from("avatars")
  //       .download(path);

  //     if (error) {
  //       console.error("Error downloading image:", error);
  //       setAvatarUrl(null);
  //       return;
  //     }

  //     const url = URL.createObjectURL(data);
  //     setAvatarUrl(url);
  //   } catch (error) {
  //     console.error("Error downloading image:", error);
  //     setAvatarUrl(null);
  //   }
  // }

  const handleAvatarUpload = async (acceptedFiles: File[]) => {
    if (!user) return;
    if (acceptedFiles.length === 0) return;

    try {
      setUploading(true);
      const file = acceptedFiles[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}`;
      const filePath = `${fileName}.${fileExt}`;

      const oldAvatarPath = getValues("avatar_url");
      if (oldAvatarPath) {
        await supabaseBrowserClient.storage
          .from("avatars")
          .remove([oldAvatarPath]);
      }

      const { error: uploadError } = await supabaseBrowserClient.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setValue("avatar_url", filePath, { shouldValidate: true });

      // Explicitly update the user profile with the new avatar URL
      await onFinish({ ...getValues(), avatar_url: filePath });
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container flex flex-col max-w-xl gap-4 px-4 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">
        <span>
          <Link href={"/"}>
            <ArrowLeftCircle className="w-5 h-5 text-black" />
          </Link>{" "}
        </span>
        Account Settings
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinish)} className="space-y-8">
          <FormItem>
            <FormLabel>Avatar</FormLabel>
            <FormControl>
              <div className="flex flex-col items-center gap-4">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={150}
                    height={150}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-[150px] h-[150px] bg-muted rounded-full text-muted-foreground">
                    No Avatar
                  </div>
                )}

                <Dropzone
                  onDrop={handleAvatarUpload}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024}
                  accept={{ "image/*": [] }}
                  disabled={uploading}
                >
                  {(dropzone: DropzoneState) => (
                    <div
                      className="w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                      {...dropzone.getRootProps()}
                    >
                      <input {...dropzone.getInputProps()} />
                      <DropzoneContent
                        isDragAccept={dropzone.isDragAccept}
                        maxFiles={1}
                      />
                    </div>
                  )}
                </Dropzone>
                <FormMessage>
                  {errors.avatar_url?.message as React.ReactNode}
                </FormMessage>
              </div>
            </FormControl>
          </FormItem>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your email"
                value={user?.email ?? ""}
                readOnly
                disabled
              />
            </FormControl>
          </FormItem>
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-y-4">
            <Button
              type="submit"
              disabled={uploading || form.formState.isSubmitting}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant={"destructive"}
              onClick={() => mutate()}
            >
              Logout
            </Button>
            <Link href={"/forgot-password"}>
              <Button type="button" variant={"default"}>
                Change Password
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
