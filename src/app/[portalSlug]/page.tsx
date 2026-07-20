import type { Metadata } from 'next'
import ClientPortal from '@/components/content-hub/ClientPortal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Portal de aprovação | Major Hub',
  description: 'Portal privado para revisão e aprovação de conteúdo.',
  robots: { index: false, follow: false },
}

export default async function PortalPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = await params
  return <ClientPortal slug={portalSlug.toLowerCase()} />
}
