import { ActivityLogs } from "@/components/Agent/TeamManagement/ActivityLogs";

interface PageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { memberId } = await params;

  return <ActivityLogs memberId={memberId} />;
}
