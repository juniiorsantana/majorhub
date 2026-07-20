import PostEditor from '@/components/content-hub/PostEditor'

export default async function EditPostPage({ params }: { params: Promise<{ clientId: string; postId: string }> }) {
  const { clientId, postId } = await params
  return <PostEditor clientId={clientId} postId={postId} />
}
