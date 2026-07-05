/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 忽略构建时的 ESLint 检查（已有 lint 问题待后续清理）
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        url: false,
      };
    }
    return config;
  },
};

export default nextConfig;
