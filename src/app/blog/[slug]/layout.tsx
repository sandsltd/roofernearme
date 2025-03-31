import { Metadata } from 'next';
import { getPostBySlug } from '@/data/blog-posts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    metadataBase: new URL('https://www.localroofernearme.co.uk'),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 