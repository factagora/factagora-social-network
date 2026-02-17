import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { startFreeDebate } from "@/lib/agents/simple-debate"
import { ApiErrors } from "@/lib/errors/api-error"

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
      return ApiErrors.databaseError("Failed to fetch predictions")
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
    return ApiErrors.internalError("Failed to fetch predictions")
  }
}

// POST /api/predictions - Create new prediction (admin only for MVP)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return ApiErrors.unauthorized("You must be logged in to create predictions")
    }

    // TODO: Check if user is admin (for now, any logged-in user can create)
    // In production, add role check: if (session.user.role !== 'admin')

    const body = await request.json()
    const { title, description, category, deadline, predictionType, options, timeseriesAssetId } = body

    // Validation
    if (!title || typeof title !== "string") {
      return ApiErrors.validationError("Title is required")
    }

    if (title.length < 10) {
      return ApiErrors.validationError("Title must be at least 10 characters")
    }

    if (title.length > 255) {
      return ApiErrors.validationError("Title must be less than 255 characters")
    }

    // Description is optional
    if (description && typeof description !== "string") {
      return ApiErrors.validationError("Description must be a string")
    }

    if (description && description.length > 2000) {
      return ApiErrors.validationError("Description must be less than 2000 characters")
    }

    if (!deadline) {
      return ApiErrors.validationError("Deadline is required")
    }

    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime())) {
      return ApiErrors.validationError("Invalid deadline format")
    }

    if (deadlineDate <= new Date()) {
      return ApiErrors.validationError("Deadline must be in the future")
    }

    const supabase = createAdminClient()

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      description: description ? description.trim() : null,
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
      return ApiErrors.databaseError("Failed to create prediction")
    }

    console.log(`✅ Prediction created: ${title} (${newPrediction.id}) by user ${session.user.id}`)

    // Auto-start debate with Reddit-style free discussion
    // Fire-and-forget: prediction creation succeeds even if debate fails
    startFreeDebate(newPrediction.id, {
      title: newPrediction.title,
      description: newPrediction.description,
      category: newPrediction.category,
      deadline: newPrediction.deadline,
    }).catch((err: unknown) => {
      console.error('Failed to auto-start debate:', err)
    })

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
    return ApiErrors.internalError("Failed to create prediction")
  }
}
