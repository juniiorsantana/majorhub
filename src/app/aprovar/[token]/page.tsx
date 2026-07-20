import type { Metadata } from 'next'
import ApprovalExperience from '@/components/content-hub/ApprovalExperience'

export const metadata: Metadata = {
  title: 'Aprovação de conteúdo — Major Hub',
  description: 'Revise e aprove suas publicações com a Major Hub.',
  robots: { index: false, follow: false },
}

export default async function ApprovalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <ApprovalExperience token={token} />
}
