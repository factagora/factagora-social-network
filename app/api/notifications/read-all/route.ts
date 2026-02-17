import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { markAllNotificationsRead } from "@/lib/notifications"

// PATCH /api/notifications/read-all - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const success = await markAllNotificationsRead(session.user.id)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark all notifications as read" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/notifications/read-all:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
