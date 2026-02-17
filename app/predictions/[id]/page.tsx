import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/server"
import { PredictionDetailClient } from "@/components/prediction/PredictionDetailClient"

interface PageProps {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: prediction } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", id)
    .single()

  if (!prediction) {
    return {
      title: "Prediction Not Found | Factagora",
    }
  }

  // Get consensus data
  const { data: consensus } = await supabase
    .from("prediction_consensus")
    .select("*")
    .eq("prediction_id", id)
    .single()

  const yesPercentage = consensus?.consensus_yes_pct
    ? Math.round(consensus.consensus_yes_pct * 100)
    : 50

  const aiVotes = consensus?.ai_votes || 0

  const description = prediction.description
    ? `${prediction.description.slice(0, 150)}...`
    : `${aiVotes} AI agents debating. Current consensus: ${yesPercentage}% YES.`

  const title = `${prediction.title} | Factagora`

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      url: `https://factagora.com/predictions/${id}`,
      title: prediction.title,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(prediction.title)}&yes=${yesPercentage}`,
          width: 1200,
          height: 630,
          alt: prediction.title,
        },
      ],
      siteName: 'Factagora',
    },
    twitter: {
      card: 'summary_large_image',
      title: prediction.title,
      description,
      images: [`/api/og?title=${encodeURIComponent(prediction.title)}&yes=${yesPercentage}`],
    },
  }
}

export default async function PredictionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  // Fetch prediction
  const { data: prediction, error: predictionError } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", id)
    .single()

  if (predictionError || !prediction) {
    console.error("Prediction not found:", id, predictionError)
    notFound()
  }

  // Fetch arguments with related data
  const { data: args, error: argsError } = await supabase
    .from("arguments")
    .select(`
      *,
      argument_quality(
        evidence_strength,
        logical_coherence,
        community_score
      ),
      agent_react_cycles!agent_react_cycles_argument_id_fkey(*)
    `)
    .eq("prediction_id", id)
    .order("created_at", { ascending: false })

  if (argsError) {
    console.error("Error fetching arguments:", argsError)
  }

  // Get reply counts for each argument
  const argsWithCounts = await Promise.all(
    (args || []).map(async (arg: any) => {
      const { count: replyCount } = await supabase
        .from("argument_replies")
        .select("*", { count: "exact", head: true })
        .eq("argument_id", arg.id)

      const { count: supportCount } = await supabase
        .from("argument_replies")
        .select("*", { count: "exact", head: true })
        .eq("argument_id", arg.id)
        .eq("reply_type", "SUPPORT")

      const { count: counterCount } = await supabase
        .from("argument_replies")
        .select("*", { count: "exact", head: true })
        .eq("argument_id", arg.id)
        .eq("reply_type", "COUNTER")

      return {
        id: arg.id,
        predictionId: arg.prediction_id,
        authorId: arg.author_id,
        authorType: arg.author_type,
        authorName: arg.author_name || (arg.author_type === "AI_AGENT" ? "AI Agent" : "Human"),
        position: arg.position,
        content: arg.content,
        evidence: arg.evidence || [],
        reasoning: arg.reasoning,
        confidence: arg.confidence,
        roundNumber: arg.round_number || 1,
        createdAt: arg.created_at,
        updatedAt: arg.updated_at,
        replyCount: replyCount || 0,
        qualityScore: (arg.argument_quality?.evidence_strength || 0.5) * 100,
        supportCount: supportCount || 0,
        counterCount: counterCount || 0,
        reactCycle: arg.agent_react_cycles?.[0] || null,
        upvotes: arg.upvotes || 0,
        downvotes: arg.downvotes || 0,
        score: arg.score || 0,
      }
    })
  )

  // Calculate statistics
  const totalArguments = argsWithCounts.length
  const yesCount = argsWithCounts.filter((a) => a.position === "YES").length
  const noCount = argsWithCounts.filter((a) => a.position === "NO").length
  const neutralCount = argsWithCounts.filter((a) => a.position === "NEUTRAL").length

  const byType = {
    aiAgents: {
      total: argsWithCounts.filter((a) => a.authorType === "AI_AGENT").length,
      yes: argsWithCounts.filter((a) => a.authorType === "AI_AGENT" && a.position === "YES")
        .length,
      no: argsWithCounts.filter((a) => a.authorType === "AI_AGENT" && a.position === "NO").length,
    },
    humans: {
      total: argsWithCounts.filter((a) => a.authorType === "HUMAN").length,
      yes: argsWithCounts.filter((a) => a.authorType === "HUMAN" && a.position === "YES").length,
      no: argsWithCounts.filter((a) => a.authorType === "HUMAN" && a.position === "NO").length,
    },
  }

  const stats = {
    total: totalArguments,
    yes: yesCount,
    no: noCount,
    neutral: neutralCount,
    byType,
  }

  // Format prediction data
  const formattedPrediction = {
    id: prediction.id,
    title: prediction.title,
    description: prediction.description,
    category: prediction.category,
    predictionType: prediction.prediction_type,
    deadline: prediction.deadline,
    resolutionDate: prediction.resolution_date,
    resolutionValue: prediction.resolution_value,
    createdAt: prediction.created_at,
  }

  return (
    <PredictionDetailClient
      initialPrediction={formattedPrediction}
      initialArguments={argsWithCounts}
      initialStats={stats}
    />
  )
}
