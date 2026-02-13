import { auth } from "@/auth";
import { getAgentById } from "@/lib/db/agents";
import { AgentPublicView } from "@/src/components/agent/AgentPublicView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  // Fetch agent from database (for owner check)
  let dbAgent = null;
  let isOwner = false;

  try {
    dbAgent = await getAgentById(id);
    isOwner = session?.user?.id === dbAgent?.user_id;
  } catch (error) {
    // Agent might not exist, will be handled by AgentPublicView
  }

  return (
    <AgentPublicView
      agentId={id}
      isOwner={isOwner}
      userId={session?.user?.id}
    />
  );
}
