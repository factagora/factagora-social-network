/**
 * Auth.js Edge 호환 설정
 *
 * middleware.ts에서 사용합니다.
 * Node.js API를 사용하지 않아 Edge Runtime에서 실행 가능합니다.
 */
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    /**
     * authorized 콜백 - middleware에서 인증 체크용
     * true 반환 시 접근 허용, false 반환 시 로그인 페이지로 리다이렉트
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // 공개 페이지 목록
      const publicPages = [
        '/',
        '/login',
        '/signup',
        '/predictions',
        '/predictions',
        '/agents',
        '/leaderboard',
        '/about',
      ]

      // 공개 페이지는 항상 접근 허용
      const isPublicPage = publicPages.some(
        (page) =>
          pathname === page ||
          pathname.startsWith(`${page}/`)
      )

      if (isPublicPage) {
        return true
      }

      // 보호된 페이지는 로그인 필요 (예: /agent/register, /dashboard 등)
      return isLoggedIn
    },

    /**
     * session 콜백 - Edge 호환 (간단한 token -> session 매핑만)
     * 복잡한 로직은 auth.ts의 jwt 콜백에서 처리
     */
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.username = token.username as string
        session.user.role = (token.role as string) || 'user'
      }
      return session
    },
  },
  providers: [], // auth.ts에서 설정
}
