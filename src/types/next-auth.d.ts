import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extends the built-in session types
   */
  interface Session {
    user: {
      id: string
      username: string
      role: string
    } & DefaultSession["user"]
  }

  /**
   * Extends the built-in user types
   */
  interface User {
    id: string
    username?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT types
   */
  interface JWT {
    id?: string
    username?: string
    role?: string
    providerId?: string
  }
}
