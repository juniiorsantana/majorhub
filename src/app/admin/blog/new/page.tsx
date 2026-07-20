import type { Metadata } from 'next'
import PostEditor from '@/components/blog/PostEditor'

export const metadata: Metadata = {
  title: 'Novo Post — Admin MajorHub',
  robots: { index: false, follow: false },
}

export default function NewPostPage() {
  return <PostEditor mode="create" />
}
