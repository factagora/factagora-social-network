/**
 * 브라우저용 Supabase 클라이언트
 *
 * Client Component에서 사용합니다.
 * NEXT_PUBLIC_ 키만 사용하여 클라이언트에 안전하게 노출됩니다.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return createSupabaseClient(
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

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
