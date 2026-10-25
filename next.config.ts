import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/guias/carencias-y-preexistencias", destination: "/como-comparamos", permanent: true },
      { source: "/guias/obra-social-vs-seguro", destination: "/", permanent: true },
      { source: "/guias/perros-mayores", destination: "/seguro-para-perros", permanent: true },
      { source: "/guias/seguro-perros-peligrosos", destination: "/seguro-para-perros", permanent: true },
      { source: "/guias", destination: "/comparar", permanent: true },
      { source: "/guias/:path*", destination: "/comparar", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
