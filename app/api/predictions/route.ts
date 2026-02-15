import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"

// GET /api/predictions - List all predictions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status") // "open" | "resolved"

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('predictions')
      .select('*')
      .order('deadline', { ascending: true })

    // Filter by category
    if (category && category !== "all") {
      query = query.eq('category', category)
    }

    // Filter by status
    if (status === "open") {
      query = query.is('resolution_value', null)
    } else if (status === "resolved") {
      query = query.not('resolution_value', 'is', null)
    }

    const { data: predictions, error } = await query

    if (error) {
      console.error("Error fetching predictions:", error)
      return NextResponse.json(
        { error: "Failed to fetch predictions" },
        { status: 500 }
      )
    }

    // Transform to camelCase for frontend
    const formattedPredictions = predictions?.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      deadline: p.deadline,
      resolutionDate: p.resolution_date,
      resolutionValue: p.resolution_value,
      resolvedBy: p.resolved_by,
      createdAt: p.created_at,
    })) || []

    return NextResponse.json(formattedPredictions)
  } catch (error) {
    console.error("Error fetching predictions:", error)
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}

// POST /api/predictions - Create new prediction (admin only for MVP)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // TODO: Check if user is admin (for now, any logged-in user can create)
    // In production, add role check: if (session.user.role !== 'admin')

    const body = await request.json()
    const { title, description, category, deadline, predictionType, options, timeseriesAssetId } = body

    // Validation
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    if (title.length < 10) {
      return NextResponse.json(
        { error: "Title must be at least 10 characters" },
        { status: 400 }
      )
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: "Title must be less than 255 characters" },
        { status: 400 }
      )
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      )
    }

    if (description.length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters" },
        { status: 400 }
      )
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: "Description must be less than 2000 characters" },
        { status: 400 }
      )
    }

    if (!deadline) {
      return NextResponse.json(
        { error: "Deadline is required" },
        { status: 400 }
      )
    }

    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid deadline format" },
        { status: 400 }
      )
    }

    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: "Deadline must be in the future" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      description: description.trim(),
      category: category || null,
      prediction_type: predictionType || 'BINARY',
      deadline: deadlineDate.toISOString(),
      // Note: predictions table doesn't have created_by column
    }

    // Add type-specific data
    if (predictionType === 'MULTIPLE_CHOICE' && options && Array.isArray(options)) {
      insertData.options = options.filter((opt: string) => opt.trim().length > 0)
    }

    if (predictionType === 'TIMESERIES' && timeseriesAssetId) {
      insertData.timeseries_asset_id = timeseriesAssetId
    }

    // Create new prediction in Supabase
    const { data: newPrediction, error: insertError } = await supabase
      .from('predictions')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating prediction:", insertError)
      return NextResponse.json(
        { error: "Failed to create prediction" },
        { status: 500 }
      )
    }

    console.log(`✅ Prediction created: ${title} (${newPrediction.id}) by user ${session.user.id}`)

    // Transform to camelCase for frontend
    const formattedPrediction = {
      id: newPrediction.id,
      title: newPrediction.title,
      description: newPrediction.description,
      category: newPrediction.category,
      deadline: newPrediction.deadline,
      resolutionDate: newPrediction.resolution_date,
      resolutionValue: newPrediction.resolution_value,
      resolvedBy: newPrediction.resolved_by,
      createdAt: newPrediction.created_at,
    }

    return NextResponse.json(formattedPrediction, { status: 201 })
  } catch (error) {
    console.error("Error creating prediction:", error)
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 }
    )
  }
}
