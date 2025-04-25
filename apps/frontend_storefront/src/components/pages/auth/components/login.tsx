import React, { useState } from "react";
import {
  useActiveAuthProvider,
  useLink,
  useLogin,
  useRouterContext,
  useRouterType,
  useTranslate,
  LoginFormTypes,
  LoginPageProps,
} from "@refinedev/core";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";

type DivPropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type FormPropsType = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

type LoginProps = LoginPageProps<DivPropsType, DivPropsType, FormPropsType>;

export const LoginPage: React.FC<LoginProps> = ({
  providers,
  registerLink,
  forgotPasswordLink,
  rememberMe,
  contentProps,
  wrapperProps,
  renderContent,
  formProps,
  title = undefined,
  hideForm,
  mutationVariables,
}) => {
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const translate = useTranslate();

  const authProvider = useActiveAuthProvider();
  const { mutate: login } = useLogin<LoginFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const renderLink = (link: string, text?: string) => {
    return <ActiveLink to={link}>{text}</ActiveLink>;
  };

  const renderProviders = () => {
    if (providers) {
      return providers.map((provider) => (
        <div
          key={provider.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() =>
              login({
                ...mutationVariables,
                providerName: provider.name,
              })
            }
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {provider?.icon}
            {provider.label ?? <label>{provider.label}</label>}
          </button>
        </div>
      ));
    }
    return null;
  };

  // const content = (
  //   <div {...contentProps}>
  //     <h1 style={{ textAlign: "center" }}>
  //       {translate("pages.login.title", "Sign in to your account")}
  //     </h1>
  //     {renderProviders()}
  //     {!hideForm && (
  //       <>
  //         <hr />
  //         <form
  //           onSubmit={(e) => {
  //             e.preventDefault();
  //             login({ ...mutationVariables, email, password, remember });
  //           }}
  //           {...formProps}
  //         >
  //           <div
  //             style={{
  //               display: "flex",
  //               flexDirection: "column",
  //               padding: 25,
  //             }}
  //           >
  //             <label htmlFor="email-input">
  //               {translate("pages.login.fields.email", "Email")}
  //             </label>
  //             <input
  //               id="email-input"
  //               name="email"
  //               type="text"
  //               size={20}
  //               autoCorrect="off"
  //               spellCheck={false}
  //               autoCapitalize="off"
  //               required
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //             />
  //             <label htmlFor="password-input">
  //               {translate("pages.login.fields.password", "Password")}
  //             </label>
  //             <input
  //               id="password-input"
  //               type="password"
  //               name="password"
  //               required
  //               size={20}
  //               value={password}
  //               onChange={(e) => setPassword(e.target.value)}
  //             />
  //             {rememberMe ?? (
  //               <>
  //                 <label htmlFor="remember-me-input">
  //                   {translate("pages.login.buttons.rememberMe", "Remember me")}
  //                   <input
  //                     id="remember-me-input"
  //                     name="remember"
  //                     type="checkbox"
  //                     size={20}
  //                     checked={remember}
  //                     value={remember.toString()}
  //                     onChange={() => {
  //                       setRemember(!remember);
  //                     }}
  //                   />
  //                 </label>
  //               </>
  //             )}
  //             <br />
  //             {forgotPasswordLink ??
  //               renderLink(
  //                 "/forgot-password",
  //                 translate(
  //                   "pages.login.buttons.forgotPassword",
  //                   "Forgot password?"
  //                 )
  //               )}
  //             <input
  //               type="submit"
  //               value={translate("pages.login.signin", "Sign in")}
  //             />
  //             {registerLink ?? (
  //               <span>
  //                 {translate(
  //                   "pages.login.buttons.noAccount",
  //                   "Don’t have an account?"
  //                 )}{" "}
  //                 {renderLink(
  //                   "/register",
  //                   translate("pages.login.register", "Sign up")
  //                 )}
  //               </span>
  //             )}
  //           </div>
  //         </form>
  //       </>
  //     )}
  //     {registerLink !== false && hideForm && (
  //       <div style={{ textAlign: "center" }}>
  //         {translate("pages.login.buttons.noAccount", "Don’t have an account?")}{" "}
  //         {renderLink(
  //           "/register",
  //           translate("pages.login.register", "Sign up")
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );

  const content = (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen font-poppins">
      <h1 className="absolute top-0 left-0 flex justify-center w-full text-3xl md:left-0 md:top-0 md:ml-4 md:mt-4 md:w-auto">
        Hope World
      </h1>
      <div className="flex items-center bg-[url('/images/background_login_section.jpg')] bg-image-common justify-center h-screen">
        <div className="mx-auto grid w-[350px] gap-6 max-w-[350px]">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl">Sign in to continue</h1>
          </div>
          {renderProviders()}
          {!hideForm && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  login({ email, password, remember });
                }}
                {...formProps}
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-input">
                      {translate("pages.login.fields.email", "Email")}
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
                      className="p-2 mb-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password-input">
                      {translate("pages.login.fields.password", "Password")}
                    </Label>
                    <Input
                      id="password-input"
                      type="password"
                      name="password"
                      required
                      size={20}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="p-2 mb-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  {rememberMe ?? (
                    <>
                      <Label htmlFor="remember-me-input">
                        {translate(
                          "pages.login.buttons.rememberMe",
                          "Remember me"
                        )}
                        <Checkbox
                          id="remember-me-input"
                          name="remember"
                          // size={20}
                          checked={remember}
                          value={remember.toString()}
                          onCheckedChange={() => {
                            setRemember(!remember);
                          }}
                          className="ml-2"
                        />
                      </Label>
                    </>
                  )}
                  <br />
                  {forgotPasswordLink ?? (
                    <span className="text-sm">
                      {renderLink(
                        "/forgot-password",
                        translate(
                          "pages.login.buttons.forgotPassword",
                          "Forgot password?"
                        )
                      )}
                    </span>
                  )}
                  <Button
                    type="submit"
                    // value={translate("pages.login.signin", "Sign in")}
                    className="px-4 py-2 mt-2 text-white rounded-md bg-blue-950 hover:bg-blue-950"
                  >
                    {translate("pages.login.signin", "Sign in")}
                  </Button>
                  {/* <Input
                    type="submit"
                    value={translate("pages.login.signin", "Sign in")}
                    className="px-4 py-2 mt-2 text-white bg-orange-500 rounded-md hover:bg-orange-800"
                  /> */}
                  {registerLink ?? (
                    <span className="text-sm">
                      {translate(
                        "pages.login.buttons.noAccount",
                        "Don’t have an account?"
                      )}{" "}
                      {renderLink(
                        "/register",
                        translate("pages.login.register", "Sign up")
                      )}
                    </span>
                  )}
                </div>
              </form>
            </>
          )}
          {registerLink !== false && hideForm && (
            <div className="text-center">
              {translate(
                "pages.login.buttons.noAccount",
                "Don’t have an account?"
              )}{" "}
              {renderLink(
                "/register",
                translate("pages.login.register", "Sign up")
              )}
            </div>
          )}
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
        {/* <video
          preload="auto"
          playsInline
          autoPlay
          muted
          loop
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-l-3xl"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video> */}
      </div>
    </div>
  );

  return (
    <div {...wrapperProps}>
      {renderContent ? renderContent(content, title) : content}
    </div>
  );
};
