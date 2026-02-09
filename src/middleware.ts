/**
 * Next.js Middleware
 *
 * 인증 체크를 수행합니다.
 * auth.config.ts의 authorized 콜백에서 인증 체크를 수행합니다.
 */
import { auth } from './auth'
import { NextResponse } from 'next/server'

// 공개 페이지 (인증 없이 접근 가능)
const publicPages = [
  '/',
  '/login',
  '/signup',
  '/marketplace',
  '/predictions',
  '/agents',
  '/leaderboard',
  '/about',
]

// 정적 파일 및 API 경로 (미들웨어 스킵)
const skipPaths = [
  '/api/',
  '/_next/',
  '/favicon',
  '/icon.svg',
  '/images/',
]

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // 정적 파일, API, 이미지 등은 미들웨어 스킵
  if (skipPaths.some((path) => pathname.startsWith(path)) || pathname === '/icon.svg') {
    return NextResponse.next()
  }

  // 공개 페이지 체크
  const isPublicPage = publicPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  )

  const isLoggedIn = !!req.auth

  // 비로그인 사용자가 보호된 페이지 접근 시 로그인 페이지로 리다이렉트
  if (!isPublicPage && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
