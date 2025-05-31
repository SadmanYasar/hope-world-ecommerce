import React, { useState } from "react";
import {
  useForgotPassword,
  useLink,
  useRouterContext,
  useRouterType,
  useTranslate,
  ForgotPasswordFormTypes,
  ForgotPasswordPageProps,
} from "@refinedev/core";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";

type DivPropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type FormPropsType = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

type ForgotPasswordProps = ForgotPasswordPageProps<
  DivPropsType,
  DivPropsType,
  FormPropsType
>;

export const ForgotPasswordPage: React.FC<ForgotPasswordProps> = ({
  loginLink,
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title = undefined,
  mutationVariables,
}) => {
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const [email, setEmail] = useState("");

  const { mutate: forgotPassword, isLoading } =
    useForgotPassword<ForgotPasswordFormTypes>();

  const renderLink = (link: string, text?: string) => {
    return <ActiveLink to={link}>{text}</ActiveLink>;
  };

  const content = (
    <>
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen font-poppins">
        <h1 className="absolute top-0 left-0 flex justify-center w-full text-3xl md:left-0 md:top-0 md:ml-4 md:mt-4 md:w-auto">
          Hope World
        </h1>
        <div className="flex items-center bg-[url('/images/background_login_section.jpg')] bg-image-common justify-center h-screen">
          <div className="mx-auto grid w-[350px] gap-6 max-w-[350px]">
            <div className="grid gap-2 text-center">
              <h1 className="text-2xl">Forgot Password</h1>
            </div>
            {
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    forgotPassword({ ...mutationVariables, email });
                  }}
                  {...formProps}
                >
                  <div className="grid gap-1">
                    <div className="grid gap-2">
                      <Label htmlFor="email-input">
                        {translate(
                          "pages.forgotPassword.fields.email",
                          "Email"
                        )}
                      </Label>
                      <Input
                        id="email-input"
                        name="email"
                        type="text"
                        size={20}
                        autoCorrect="off"
                        spellCheck={false}
                        autoCapitalize="off"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <br />
                    <Button
                      type="submit"
                      variant={"default"}
                      disabled={isLoading}
                      className="px-4 text-white rounded-md bg-blue-950 hover:bg-blue-950"
                    >
                      {translate(
                        "pages.forgotPassword.buttons.submit",
                        "Send reset instructions"
                      )}
                    </Button>
                    {loginLink ?? (
                      <span className="text-sm">
                        {translate(
                          "pages.register.buttons.haveAccount",
                          "Have an account? "
                        )}{" "}
                        {renderLink(
                          "/login",
                          translate("pages.login.signin", "Sign in")
                        )}
                      </span>
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
