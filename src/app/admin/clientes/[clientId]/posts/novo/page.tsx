import PostEditor from '@/components/content-hub/PostEditor'

export default async function NewPostPage({ params, searchParams }: { params: Promise<{ clientId: string }>; searchParams: Promise<{ calendar?: string }> }) {
  const [{ clientId }, query] = await Promise.all([params, searchParams])
  return <PostEditor clientId={clientId} initialCalendarId={query.calendar} />
}
