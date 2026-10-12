import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  // Docker: build a self-contained server (.next/standalone) with only the files it needs.
  output: "standalone",
  // npm workspaces hoist packages to the repo root, so trace dependencies from there.
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

// Lets us import .mdx files (case-study content) as React components.
const withMDX = createMDX({});

export default withMDX(nextConfig);
