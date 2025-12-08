import PropertyView from '@/components/Admin/Properties/PropertyView';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  return <PropertyView propertyId={id} />;
}
