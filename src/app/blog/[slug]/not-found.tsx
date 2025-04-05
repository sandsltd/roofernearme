import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
        <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/blog"
          className="text-yellow-500 hover:text-yellow-600 font-medium"
        >
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
} 