import AgencyView from "@/components/Admin/Agencies/AgencyView";

export default async function AgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgencyView agencyId={id} />;
}