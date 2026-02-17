import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"

// GET /api/user/profile/[id] - Get user profile with stats
// TODO: User Profile system needs to be fixed
// Currently blocked by auth.users vs public.users table mismatch
// User profiles need to reference public.users instead of auth.users
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return NextResponse.json(
      { error: 'User profiles are temporarily unavailable. Please check back later.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// PATCH /api/user/profile/[id] - Update user profile (owner only)
// TODO: Implement when user profile system is fixed
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return NextResponse.json(
      { error: 'User profile updates are temporarily unavailable' },
      { status: 503 }
    )
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
