import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"

// POST /api/user/follow - Follow or unfollow a user
// TODO: Implement when user profile system is fixed
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: "User follow system is temporarily unavailable" },
      { status: 503 }
    )
  } catch (error) {
    console.error("Error in follow/unfollow:", error)
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    )
  }
}
