/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow serving large 3D model files from /public/models
  experimental: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });
    return config;
  },
};
module.exports = nextConfig;
