import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"

interface Argument {
  id: string
  predictionId: string
  authorId: string
  authorType: "AI_AGENT" | "HUMAN"
  authorName: string
  position: "YES" | "NO" | "NEUTRAL"
  content: string
  evidence: any[]
  reasoning: string
  confidence: number
  roundNumber: number
  createdAt: string
  updatedAt: string
  replyCount: number
  qualityScore: number
  supportCount: number
  counterCount: number
  reactCycle: any
  upvotes: number
  downvotes: number
  score: number
}

export function useRealtimeArguments(
  predictionId: string,
  initialArguments: Argument[]
) {
  const [arguments_, setArguments] = useState<Argument[]>(initialArguments)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new arguments
    const channel = supabase
      .channel(`prediction_${predictionId}_arguments`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "arguments",
          filter: `prediction_id=eq.${predictionId}`,
        },
        async (payload) => {
          console.log("New argument received:", payload)

          // Fetch full argument data with relations
          const { data: newArgument } = await supabase
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
            .eq("id", payload.new.id)
            .single()

          if (newArgument) {
            const formattedArgument: Argument = {
              id: newArgument.id,
              predictionId: newArgument.prediction_id,
              authorId: newArgument.author_id,
              authorType: newArgument.author_type,
              authorName: newArgument.author_name || (newArgument.author_type === "AI_AGENT" ? "AI Agent" : "Human"),
              position: newArgument.position,
              content: newArgument.content,
              evidence: newArgument.evidence || [],
              reasoning: newArgument.reasoning,
              confidence: newArgument.confidence,
              roundNumber: newArgument.round_number || 1,
              createdAt: newArgument.created_at,
              updatedAt: newArgument.updated_at,
              replyCount: 0,
              qualityScore: (newArgument.argument_quality?.evidence_strength || 0.5) * 100,
              supportCount: 0,
              counterCount: 0,
              reactCycle: newArgument.agent_react_cycles?.[0] || null,
              upvotes: newArgument.upvotes || 0,
              downvotes: newArgument.downvotes || 0,
              score: newArgument.score || 0,
            }

            setArguments((prev) => [formattedArgument, ...prev])
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "arguments",
          filter: `prediction_id=eq.${predictionId}`,
        },
        (payload) => {
          console.log("Argument updated:", payload)

          setArguments((prev) =>
            prev.map((arg) =>
              arg.id === payload.new.id
                ? {
                    ...arg,
                    upvotes: payload.new.upvotes || arg.upvotes,
                    downvotes: payload.new.downvotes || arg.downvotes,
                    score: payload.new.score || arg.score,
                  }
                : arg
            )
          )
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsSubscribed(true)
          console.log("Subscribed to realtime arguments")
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
      setIsSubscribed(false)
    }
  }, [predictionId])

  return { arguments_, isSubscribed }
}
