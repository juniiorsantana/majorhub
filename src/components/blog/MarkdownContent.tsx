import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-sora font-extrabold text-[clamp(28px,4.5vw,42px)] leading-[1.15] mt-12 mb-6 text-[#0a2540]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-sora font-bold text-[clamp(22px,3.2vw,30px)] leading-[1.2] mt-14 mb-5 text-[#0a2540]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-sora font-bold text-xl leading-[1.3] mt-10 mb-4 text-[#0a2540]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-5">
      {children}
    </p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-[#0099ff] underline decoration-[#0099ff]/30 underline-offset-4 hover:decoration-[#0099ff] transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#0a2540]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-6 mb-5 space-y-2 text-slate-600 marker:text-[#0099ff]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-6 mb-5 space-y-2 text-slate-600 marker:text-[#0099ff] marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-base md:text-lg">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-4 border-[#0099ff] bg-[#0099ff]/6 rounded-r-lg px-6 py-5 text-[#0a2540] font-medium text-lg leading-relaxed">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-slate-200" />,
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-sm md:text-base">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#0099ff]/6">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left font-sora font-bold text-[#0a2540] px-4 py-3 border-b border-slate-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 border-b border-slate-100 text-slate-600 align-top">
      {children}
    </td>
  ),
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded bg-[#0099ff]/8 text-[#0a2540] text-[0.9em] font-mono">
      {children}
    </code>
  ),
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
