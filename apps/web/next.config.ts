import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],
};

// Lets us import .mdx files (case-study content) as React components.
const withMDX = createMDX({});

export default withMDX(nextConfig);
