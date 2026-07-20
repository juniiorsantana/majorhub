import ClientForm from '@/components/content-hub/ClientForm'

export default async function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  return <ClientForm clientId={clientId} />
}
