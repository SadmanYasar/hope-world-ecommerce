import React, { useState, useEffect } from "react";
import {
  useActiveAuthProvider,
  useTranslate,
  useUpdatePassword,
  UpdatePasswordFormTypes,
  UpdatePasswordPageProps,
} from "@refinedev/core";
import Image from "next/image";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import Link from "next/link";

type DivPropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type FormPropsType = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

type UpdatePasswordProps = UpdatePasswordPageProps<
  DivPropsType,
  DivPropsType,
  FormPropsType
>;

export const UpdatePasswordPage: React.FC<UpdatePasswordProps> = ({
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title = undefined,
  mutationVariables,
}) => {
  const translate = useTranslate();

  const authProvider = useActiveAuthProvider();
  const {
    mutate: updatePassword,
    isLoading,
    isSuccess,
  } = useUpdatePassword<UpdatePasswordFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    // Validate passwords whenever either field changes
    if (confirmPassword === "") {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(newPassword === confirmPassword);
    }
  }, [newPassword, confirmPassword]);

  const content = (
    <>
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen font-poppins">
        <h1 className="absolute top-0 left-0 flex justify-center w-full text-3xl md:left-0 md:top-0 md:ml-4 md:mt-4 md:w-auto">
          Hope World
        </h1>
        <div className="flex items-center bg-[url('/images/background_login_section.jpg')] bg-image-common justify-center h-screen">
          <div className="mx-auto grid w-[350px] gap-6 max-w-[350px]">
            <div className="grid gap-2 text-center">
              <h1 className="text-2xl">
                {translate("pages.updatePassword.title", "Update Password")}
              </h1>
            </div>
            {
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (passwordsMatch) {
                      updatePassword({
                        ...mutationVariables,
                        password: newPassword,
                        confirmPassword,
                      });
                    }
                  }}
                  {...formProps}
                >
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password-input">
                        {translate(
                          "pages.updatePassword.fields.password",
                          "New Password"
                        )}
                      </Label>
                      <Input
                        id="password-input"
                        name="password"
                        type="password"
                        required
                        size={20}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="p-2 mb-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password-input">
                        {translate(
                          "pages.updatePassword.fields.confirmPassword",
                          "Confirm New Password"
                        )}
                      </Label>
                      <Input
                        id="confirm-password-input"
                        name="confirmPassword"
                        type="password"
                        required
                        size={20}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="p-2 mb-2 border border-gray-300 rounded-md"
                      />
                      {!passwordsMatch && (
                        <span className="text-sm text-red-500">
                          {translate(
                            "pages.updatePassword.errors.passwordMismatch",
                            "Passwords do not match"
                          )}
                        </span>
                      )}
                    </div>

                    <br />
                    <Button
                      type="submit"
                      variant={"default"}
                      disabled={isLoading || !passwordsMatch}
                      className="px-4 py-2 mt-2 text-white rounded-md bg-blue-950 hover:bg-blue-950"
                    >
                      {translate(
                        "pages.updatePassword.buttons.submit",
                        "Update"
                      )}
                    </Button>
                    {isSuccess ? (
                      <>
                        <span className="text-sm text-black">
                          {translate(
                            "pages.updatePassword.successMessage",
                            "Password updated successfully!"
                          )}
                        </span>
                        <Link
                          href="/login"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {translate("pages.updatePassword.loginLink", "Login")}
                        </Link>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </form>
              </>
            }
          </div>
        </div>
        <div className="hidden h-screen bg-muted lg:block">
          <Image
            src="/landing.gif"
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-l-3xl"
          />
        </div>
      </div>
    </>
  );

  return (
    <div {...wrapperProps}>
      {renderContent ? renderContent(content, title) : content}
    </div>
  );
};
