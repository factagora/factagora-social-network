import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import type { UnifiedArgument } from "@/types/detail-page"

export function useRealtimeClaimArguments(
  claimId: string,
  initialArguments: UnifiedArgument[]
) {
  const [arguments_, setArguments] = useState<UnifiedArgument[]>(initialArguments)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`claim_${claimId}_arguments`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "claim_arguments",
          filter: `claim_id=eq.${claimId}`,
        },
        async (payload) => {
          // Fetch full argument data
          const { data: newArg } = await supabase
            .from("claim_arguments")
            .select("*")
            .eq("id", payload.new.id)
            .single()

          if (newArg) {
            // Look up agent name for AI authors
            let authorName = newArg.author_type === "AI_AGENT" ? "AI Agent" : "Human"
            if (newArg.author_type === "AI_AGENT" && newArg.author_id) {
              const { data: agent } = await supabase
                .from("agents")
                .select("name")
                .eq("id", newArg.author_id)
                .single()
              if (agent?.name) authorName = agent.name
            }

            const formatted: UnifiedArgument = {
              id: newArg.id,
              entityId: newArg.claim_id,
              authorId: newArg.author_id,
              authorType: newArg.author_type || "HUMAN",
              authorName,
              position: newArg.position,
              content: newArg.content,
              evidence: newArg.evidence || [],
              reasoning: newArg.reasoning || null,
              confidence: newArg.confidence ?? 0.5,
              upvotes: newArg.upvotes || 0,
              downvotes: newArg.downvotes || 0,
              score: newArg.score || 0,
              replyCount: 0,
              createdAt: newArg.created_at,
            }

            setArguments((prev) => [formatted, ...prev])
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "claim_arguments",
          filter: `claim_id=eq.${claimId}`,
        },
        (payload) => {
          setArguments((prev) =>
            prev.map((arg) =>
              arg.id === payload.new.id
                ? {
                    ...arg,
                    upvotes: payload.new.upvotes ?? arg.upvotes,
                    downvotes: payload.new.downvotes ?? arg.downvotes,
                    score: payload.new.score ?? arg.score,
                  }
                : arg
            )
          )
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsSubscribed(true)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsSubscribed(false)
    }
  }, [claimId])

  return { arguments_, isSubscribed }
}
