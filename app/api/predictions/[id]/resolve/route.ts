import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { notifyFactBlockResolved, notifyVotersOfResolution } from "@/lib/notifications"

// POST /api/predictions/[id]/resolve - Resolve a prediction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { resolutionValue } = await request.json()

    if (typeof resolutionValue !== 'boolean' && typeof resolutionValue !== 'number' && typeof resolutionValue !== 'string') {
      return NextResponse.json(
        { error: "Invalid resolution value. Must be boolean for BINARY, number for NUMERIC/RANGE/TIMESERIES, or string for MULTIPLE_CHOICE predictions." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the prediction
    const { data: prediction, error: fetchError } = await supabase
      .from('predictions')
      .select('id, user_id, title, prediction_type, deadline, resolution_value, numeric_resolution, resolved_option_id')
      .eq('id', id)
      .single()

    if (fetchError || !prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (prediction.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can resolve this prediction" },
        { status: 403 }
      )
    }

    // Check if already resolved
    if (prediction.resolution_value !== null || prediction.numeric_resolution !== null || prediction.resolved_option_id !== null) {
      return NextResponse.json(
        { error: "Prediction already resolved" },
        { status: 400 }
      )
    }

    // Check if deadline has passed
    const now = new Date()
    const deadline = new Date(prediction.deadline)
    if (now < deadline) {
      return NextResponse.json(
        { error: "Cannot resolve before deadline" },
        { status: 400 }
      )
    }

    // Validate resolution value based on prediction type
    const predictionType = prediction.prediction_type || 'BINARY'

    if (predictionType === 'BINARY' && typeof resolutionValue !== 'boolean') {
      return NextResponse.json(
        { error: "BINARY predictions require boolean resolution value (true/false)" },
        { status: 400 }
      )
    }

    if (['NUMERIC', 'RANGE', 'TIMESERIES'].includes(predictionType) && typeof resolutionValue !== 'number') {
      return NextResponse.json(
        { error: `${predictionType} predictions require numeric resolution value` },
        { status: 400 }
      )
    }

    if (predictionType === 'MULTIPLE_CHOICE' && typeof resolutionValue !== 'string') {
      return NextResponse.json(
        { error: "MULTIPLE_CHOICE predictions require string resolution value (option label)" },
        { status: 400 }
      )
    }

    // Build update payload based on prediction type
    const updatePayload: Record<string, any> = {
      resolution_date: new Date().toISOString(),
      resolved_by: session.user.id,
    }

    if (predictionType === 'MULTIPLE_CHOICE') {
      updatePayload.resolved_option_id = resolutionValue
    } else if (['NUMERIC', 'RANGE', 'TIMESERIES'].includes(predictionType)) {
      updatePayload.numeric_resolution = resolutionValue
    } else {
      updatePayload.resolution_value = resolutionValue
    }

    // Resolve the prediction
    const { data: resolved, error: updateError } = await supabase
      .from('predictions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error resolving prediction:', updateError)
      return NextResponse.json(
        { error: "Failed to resolve prediction" },
        { status: 500 }
      )
    }

    // Send notifications
    const resolutionText = typeof resolutionValue === 'boolean'
      ? (resolutionValue ? 'TRUE' : 'FALSE')
      : resolutionValue.toString()

    // Notify the creator
    await notifyFactBlockResolved(
      prediction.user_id,
      id,
      'prediction',
      prediction.title,
      resolutionText
    )

    // Notify voters
    await notifyVotersOfResolution(
      id,
      'prediction',
      prediction.title,
      resolutionText
    )

    return NextResponse.json({
      message: "Prediction resolved successfully",
      prediction: resolved,
    })
  } catch (error) {
    console.error('Error in /api/predictions/[id]/resolve:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
