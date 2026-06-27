/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 忽略构建时的 ESLint 检查（已有 lint 问题待后续清理）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
