const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/sketchview",
  trailingSlash: true, // recommended for GitHub Pages
  images: { unoptimized: true },
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  webpack: (config: {
    module: { rules: { test: RegExp; include: RegExp; type: string }[] };
  }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });
    return config;
  },
};

export default nextConfig;
