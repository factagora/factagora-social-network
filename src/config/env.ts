/**
 * 환경 변수 검증 (Zod)
 *
 * 서버/클라이언트 환경 변수를 타입 안전하게 검증합니다.
 * NEXT_PUBLIC_ prefix가 있는 변수만 클라이언트에서 접근 가능합니다.
 */

import { z } from 'zod'

// 서버 환경 변수 스키마
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // External APIs
  FACTBLOCK_API_URL: z.string().url().optional(),
  FACTBLOCK_API_KEY: z.string().optional(),
  FACTBLOCK_AZURE_API_URL: z.string().url().optional(),
  FACTBLOCK_BUILD_BASE: z.string().url().optional(),
  DOCPROC_API_URL: z.string().url().optional(),
  BACKEND_API_URL: z.string().url().optional(),

  // Azure OpenAI
  AZURE_OPENAI_API_VERSION: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_ENDPOINT_URL: z.string().url().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
})

// 클라이언트 환경 변수 스키마 (NEXT_PUBLIC_ only)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_USERTOUR_TOKEN: z.string().optional(),
})

// 서버 환경 변수 검증 (서버에서만 실행)
function validateServerEnv() {
  // 클라이언트에서는 실행하지 않음
  if (typeof window !== 'undefined') {
    return null
  }

  const parsed = serverEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(parsed.error.flatten().fieldErrors)

    // 개발 환경에서는 경고만, 프로덕션에서는 에러
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid server environment variables')
    }

    return null
  }

  return parsed.data
}

// 클라이언트 환경 변수 검증
function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    NEXT_PUBLIC_USERTOUR_TOKEN: process.env.NEXT_PUBLIC_USERTOUR_TOKEN,
  }

  const parsed = clientEnvSchema.safeParse(clientEnv)

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:')
    console.error(parsed.error.flatten().fieldErrors)

    // 개발 환경에서는 경고만
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid client environment variables')
    }

    return null
  }

  return parsed.data
}

// 서버 환경 변수 (서버에서만 접근)
export const serverEnv = validateServerEnv()

// 클라이언트 환경 변수 (클라이언트/서버 모두 접근 가능)
export const clientEnv = validateClientEnv()

// 타입 export
export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
