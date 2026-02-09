/**
 * 서버용 Supabase 클라이언트
 *
 * Server Component, API Route, Server Action에서 사용합니다.
 */
import { createClient } from '@supabase/supabase-js'

/**
 * Service Role 클라이언트 (관리자 권한)
 *
 * RLS를 우회해야 하는 서버 사이드 작업에서 사용합니다.
 * 주의: 절대 클라이언트에 노출하지 마세요.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    // Build time fallback
    if (process.env.NODE_ENV === 'production') {
      console.warn('Supabase environment variables not found, using fallback client')
    }
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Anon Key 서버 클라이언트 (RLS 적용)
 *
 * 세션 없이 RLS가 적용된 쿼리가 필요할 때 사용합니다.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * @deprecated 기존 코드 호환용. createServiceClient() 사용 권장.
 */
export const createServerClient = createServiceClient
