import AgencyView from "@/components/Admin/Agencies/AgencyView";
export default function AgencyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  return <AgencyView agencyId={id} />;
}
