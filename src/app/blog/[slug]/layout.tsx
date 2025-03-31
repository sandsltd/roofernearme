import { Metadata } from 'next';
import { getPostBySlug } from '@/data/blog-posts';
import BlogPost from './page';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
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

export default function BlogPostLayout() {
  return <BlogPost />;
} 