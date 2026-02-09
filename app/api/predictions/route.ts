import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// Mock data store (in-memory, will be replaced with DB later)
const mockPredictions = new Map<string, any>()

// Initialize with some sample predictions
function initializeSamplePredictions() {
  if (mockPredictions.size === 0) {
    const samples = [
      {
        id: "pred_1",
        title: "AI will achieve AGI by end of 2026",
        description: "Artificial General Intelligence (AGI) - an AI system that can perform any intellectual task that a human can - will be achieved by at least one major AI lab before December 31, 2026.",
        category: "tech",
        deadline: new Date("2026-12-31T23:59:59Z").toISOString(),
        resolutionDate: null,
        resolutionValue: null,
        resolvedBy: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "pred_2",
        title: "Bitcoin will reach $150,000 in 2026",
        description: "Bitcoin (BTC) price will reach or exceed $150,000 USD on any major exchange (Coinbase, Binance, Kraken) at any point during 2026.",
        category: "economics",
        deadline: new Date("2026-12-31T23:59:59Z").toISOString(),
        resolutionDate: null,
        resolutionValue: null,
        resolvedBy: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "pred_3",
        title: "Quantum computer will break RSA-2048 in 2026",
        description: "A quantum computer will successfully factor a 2048-bit RSA number in less than 24 hours, demonstrating practical cryptographic vulnerability.",
        category: "tech",
        deadline: new Date("2026-12-31T23:59:59Z").toISOString(),
        resolutionDate: null,
        resolutionValue: null,
        resolvedBy: null,
        createdAt: new Date().toISOString(),
      },
    ]

    samples.forEach(pred => mockPredictions.set(pred.id, pred))
  }
}

// GET /api/predictions - List all predictions
export async function GET(request: NextRequest) {
  try {
    initializeSamplePredictions()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status") // "open" | "resolved"

    let predictions = Array.from(mockPredictions.values())

    // Filter by category
    if (category && category !== "all") {
      predictions = predictions.filter(p => p.category === category)
    }

    // Filter by status
    if (status === "open") {
      predictions = predictions.filter(p => p.resolutionValue === null)
    } else if (status === "resolved") {
      predictions = predictions.filter(p => p.resolutionValue !== null)
    }

    // Sort by deadline (nearest first)
    predictions.sort((a, b) =>
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )

    return NextResponse.json(predictions)
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
    const { title, description, category, deadline } = body

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

    // Create new prediction (mock)
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const now = new Date().toISOString()

    const newPrediction = {
      id: predictionId,
      title: title.trim(),
      description: description.trim(),
      category: category || null,
      deadline: deadlineDate.toISOString(),
      resolutionDate: null,
      resolutionValue: null,
      resolvedBy: null,
      createdAt: now,
    }

    // Store in mock data
    mockPredictions.set(predictionId, newPrediction)

    console.log(`✅ Prediction created: ${title} (${predictionId}) by user ${session.user.id}`)

    return NextResponse.json(newPrediction, { status: 201 })
  } catch (error) {
    console.error("Error creating prediction:", error)
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 }
    )
  }
}

// Export mock data for access in other API routes
export { mockPredictions }
