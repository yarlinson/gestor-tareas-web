import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Fija la raíz del proyecto: sin esto Next puede confundirse si hay otro package-lock.json
    // en una carpeta superior (por ejemplo, la de usuario).
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
