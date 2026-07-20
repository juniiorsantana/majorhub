import ClientWorkspace from '@/components/content-hub/ClientWorkspace'

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  return <ClientWorkspace clientId={clientId} />
}
