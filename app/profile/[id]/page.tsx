import { auth } from "@/auth";
import { UserProfileView } from "@/src/components/user/UserProfileView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const isOwner = session?.user?.id === id;

  return (
    <UserProfileView
      userId={id}
      isOwner={isOwner}
      currentUserId={session?.user?.id}
    />
  );
}
