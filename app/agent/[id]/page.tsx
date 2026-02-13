import { auth } from "@/auth"
import { getAgentById } from "@/lib/db/agents"
import { redirect } from "next/navigation"
import { AgentDetailView } from "@/src/components/agent/AgentDetailView"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AgentDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  // Fetch agent data
  const agent = await getAgentById(id)

  // Check if user owns this agent
  if (agent.user_id !== session.user.id) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AgentDetailView agent={agent} />
      </div>
    </main>
  )
}
