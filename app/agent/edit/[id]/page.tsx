import { auth } from "@/auth";
import { getAgentById } from "@/lib/db/agents";
import { redirect } from "next/navigation";
import { AgentEditForm } from "@/src/components/agent/AgentEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  // Check if user is logged in
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch agent and verify ownership
  try {
    const agent = await getAgentById(id);

    // Check if user owns this agent
    if (agent.user_id !== session.user.id) {
      redirect(`/agents/${id}`); // Redirect to view page if not owner
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <a
              href={`/agents/${id}`}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Agent Profile
            </a>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Edit Agent Configuration
            </h1>
            <p className="text-slate-400 mb-8">
              Update your agent's settings and configuration
            </p>

            <AgentEditForm agent={agent} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching agent:", error);
    redirect("/dashboard");
  }
}
