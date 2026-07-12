/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 忽略构建时的 ESLint 检查（已有 lint 问题待后续清理）
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
  async headers() {
    return [
      {
        // GeoGebra iframe 需要被嵌入，禁用默认的 X-Frame-Options
        source: '/geogebra/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
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
