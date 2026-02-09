/**
 * 세션 헬퍼 함수
 *
 * Server Component에서 세션 조회 시 사용합니다.
 * cache()를 사용하여 같은 요청 내에서 중복 조회를 방지합니다.
 */
import { auth } from '@/auth'
import { cache } from 'react'

/**
 * 현재 세션 조회 (캐싱)
 *
 * 같은 요청 내에서 여러 번 호출해도 한 번만 실행됩니다.
 */
export const getSession = cache(async () => {
  return await auth()
})

/**
 * 현재 사용자 조회
 *
 * 로그인하지 않은 경우 null 반환
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession()
  return session?.user ?? null
})

/**
 * 인증 필수
 *
 * 로그인하지 않은 경우 에러 throw
 * API Route나 Server Action에서 사용
 *
 * @throws Error - 'Unauthorized'
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session
}

/**
 * 역할 기반 인증
 *
 * 지정된 역할 중 하나를 가지고 있지 않으면 에러 throw
 *
 * @param roles - 허용된 역할 목록
 * @throws Error - 'Unauthorized' | 'Forbidden'
 */
export async function requireRole(roles: string[]) {
  const session = await requireAuth()

  if (!session.user.role || !roles.includes(session.user.role)) {
    throw new Error('Forbidden')
  }

  return session
}

/**
 * 관리자 권한 필수
 *
 * admin 역할이 아니면 에러 throw
 */
export async function requireAdmin() {
  return requireRole(['admin'])
}

/**
 * 세션 사용자 ID 조회
 *
 * 로그인하지 않은 경우 null 반환
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}

/**
 * 특정 사용자인지 확인
 *
 * 현재 로그인한 사용자가 지정된 ID와 일치하는지 확인
 */
export async function isCurrentUser(userId: string): Promise<boolean> {
  const currentUserId = await getUserId()
  return currentUserId === userId
}

/**
 * 특정 사용자이거나 관리자인지 확인
 *
 * 본인이거나 관리자 권한이 있으면 true
 */
export async function isOwnerOrAdmin(ownerId: string): Promise<boolean> {
  const session = await getSession()

  if (!session?.user) {
    return false
  }

  return session.user.id === ownerId || session.user.role === 'admin'
}
