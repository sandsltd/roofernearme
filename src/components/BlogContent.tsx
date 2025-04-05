'use client';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <article className="prose prose-lg max-w-none">
      <style jsx global>{`
        .warning-signs, .immediate-actions, .finding-help, .common-emergencies, .next-steps, .cta-box {
          background: white !important;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: #111827 !important;
          font-weight: 700;
        }
        .prose p, .prose li {
          color: #374151 !important;
        }
        .prose strong {
          color: #111827 !important;
        }
        .prose a {
          color: #2563eb !important;
          text-decoration: none;
        }
        .prose a:hover {
          text-decoration: underline;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
} 