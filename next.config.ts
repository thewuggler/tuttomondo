import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/tuttomondo";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? repoBasePath : "",
  images: { unoptimized: true },
};

export default nextConfig;
