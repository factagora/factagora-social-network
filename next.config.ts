import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Azure App Service 배포를 위한 standalone 모드
  output: 'standalone',

  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
