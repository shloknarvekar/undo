import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the workspace root to this repo (a stray lockfile higher up the tree confuses root detection).
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The API docs portal is a static build in public/docs (APIMatic, see portal/). Its pages are folders with an
  // index.html; real files (scripts, styles, llms.txt, page .md copies) match first, so this only maps page paths.
  async rewrites() {
    return [
      { source: "/docs", destination: "/docs/index.html" },
      { source: "/docs/:path*", destination: "/docs/:path*/index.html" },
    ];
  },
};

export default nextConfig;
