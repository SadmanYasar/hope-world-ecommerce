/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@refinedev/antd", "@ant-design/pro-chat",],
  output: "standalone",
};

export default nextConfig;
