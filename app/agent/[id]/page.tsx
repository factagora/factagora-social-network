import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Redirect old URL structure to new unified page
export default async function AgentManagementPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/agents/${id}`);
}
