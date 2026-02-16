/**
 * Auth.js 메인 설정
 *
 * providers와 Node.js 전용 로직(Supabase 연동)을 포함합니다.
 * live-article과 동일한 Supabase users 테이블을 사용합니다.
 */
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { authConfig } from './auth.config'
import { createAdminClient } from '@/lib/supabase/server'

/** Edge 호환: Node 'crypto' 대신 Web Crypto API 사용 */
function randomUUID(): string {
  return globalThis.crypto.randomUUID()
}

/**
 * 이름 또는 이메일에서 기본 username을 생성합니다.
 */
function generateUsername(nameOrEmail: string): string {
  return nameOrEmail
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20)
}

/**
 * 고유한 username을 생성합니다.
 * 중복 시 숫자 접미사를 추가합니다.
 */
function generateUniqueUsername(
  nameOrEmail: string,
  existingUsernames: Set<string>
): string {
  const base = generateUsername(nameOrEmail) || 'user'
  let candidate = base
  let counter = 1

  while (existingUsernames.has(candidate)) {
    candidate = `${base}${counter}`
    counter++
  }

  return candidate
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    /**
     * JWT 콜백 - Supabase 연동 로직 포함
     * Edge Runtime에서 실행되지 않음 (Node.js 전용)
     */
    async jwt({ token, user, account }) {
      // When user signs in for the first time, sync to Supabase
      if (user && account) {
        try {
          const supabase = createAdminClient()

          // First check if user already exists in Supabase by provider and provider_id
          let { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('provider', account.provider)
            .eq('provider_id', user.id)
            .single()

          // If not found by provider info, check by email
          if (!existingUser && user.email) {
            const { data: existingUserByEmail } = await supabase
              .from('users')
              .select('*')
              .eq('email', user.email)
              .single()

            // If found by email but missing provider data, update it
            if (
              existingUserByEmail &&
              (!existingUserByEmail.provider || !existingUserByEmail.provider_id)
            ) {
              const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                  provider: account.provider,
                  provider_id: user.id,
                })
                .eq('id', existingUserByEmail.id)
                .select()
                .single()

              if (!updateError && updatedUser) {
                existingUser = updatedUser
              } else {
                existingUser = existingUserByEmail
              }
            } else if (existingUserByEmail) {
              existingUser = existingUserByEmail
            }
          }

          if (!existingUser) {
            // Get existing usernames to ensure uniqueness
            const { data: existingUsernames } = await supabase
              .from('users')
              .select('username')
              .not('username', 'is', null)

            const existingUsernameSet = new Set(
              existingUsernames?.map((u) => u.username).filter(Boolean) || []
            )

            // Generate unique username
            const username = generateUniqueUsername(
              user.name || user.email || 'user',
              existingUsernameSet
            )

            // Generate explicit UUID for new user
            const userId = randomUUID()

            // Create new user in Supabase with username and provider info
            const { data: newUser, error } = await supabase
              .from('users')
              .insert({
                id: userId,
                email: user.email,
                name: user.name,
                avatar_url: user.image,
                username: username,
                role: 'user',
                provider: account.provider,
                provider_id: user.id,
              })
              .select()
              .single()

            if (error) {
              console.error('Error creating user in Supabase:', error)
              token.username = username
              token.id = userId
              token.role = 'user'
            } else {
              token.id = userId
              token.username = username
              token.role = newUser.role || 'user'
            }
          } else {
            // If user doesn't have username, generate one
            if (!existingUser.username) {
              const { data: existingUsernames } = await supabase
                .from('users')
                .select('username')
                .not('username', 'is', null)

              const existingUsernameSet = new Set(
                existingUsernames?.map((u) => u.username).filter(Boolean) || []
              )

              const username = generateUniqueUsername(
                existingUser.name || existingUser.email || 'user',
                existingUsernameSet
              )

              // Update user with username
              await supabase
                .from('users')
                .update({ username: username })
                .eq('id', existingUser.id)

              token.username = username
            } else {
              token.username = existingUser.username
            }

            // Store Supabase user ID and role in token
            token.id = existingUser.id
            token.role = existingUser.role || 'user'
          }
        } catch (error) {
          console.error('Error syncing user to Supabase:', error)
        }
      }

      // Store user data in token
      if (user) {
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }

      // For existing sessions, make sure we have username and role in token
      if (token.id && (!token.username || !token.role)) {
        try {
          const supabase = createAdminClient()
          const { data: existingUser } = await supabase
            .from('users')
            .select('username, role')
            .eq('id', token.id)
            .single()

          if (existingUser?.username) {
            token.username = existingUser.username
          }
          if (existingUser?.role) {
            token.role = existingUser.role
          }
        } catch {
          // Silent fail
        }
      }

      return token
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
})
