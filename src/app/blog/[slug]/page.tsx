import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, blogPosts } from '@/data/blog-posts';
import type { BlogPost } from '@/data/blog-posts';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { BlogContent } from '../../../components/BlogContent';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { Metadata } from 'next';

// Using a simple params type definition
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: {
      canonical: `https://www.localroofernearme.co.uk/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      url: `https://www.localroofernearme.co.uk/blog/${post.slug}`,
      siteName: 'Local Roofer Near Me',
      locale: 'en_GB',
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: `https://www.localroofernearme.co.uk${post.image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [`https://www.localroofernearme.co.uk${post.image}`],
    },
  };
}

export default async function BlogPost({ params }: any) {
  const slug = params.slug;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Blog', url: '/blog' },
    { label: post.title }
  ];

  // Generate structured data for this blog post
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `https://www.localroofernearme.co.uk${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'Local Roofer Near Me',
      url: 'https://www.localroofernearme.co.uk',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Local Roofer Near Me',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.localroofernearme.co.uk/Roofer Near Me-2.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.localroofernearme.co.uk/blog/${post.slug}`,
    },
  };

  // Generate breadcrumbs structured data
  const breadcrumbsStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.localroofernearme.co.uk'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://www.localroofernearme.co.uk/blog'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': `https://www.localroofernearme.co.uk/blog/${post.slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      {/* Breadcrumbs Structured Data */}
      <Script id="breadcrumbs-structured-data" type="application/ld+json">
        {JSON.stringify(breadcrumbsStructuredData)}
      </Script>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/Roofer Near Me-2.png"
                alt="Local Roofer Near Me Logo"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="ml-3 text-lg font-bold text-gray-900">Local Roofer Near Me</span>
            </Link>
            <Link
              href="/blog"
              className="text-yellow-500 hover:text-yellow-600 font-medium flex items-center gap-2"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-1">
          <Breadcrumbs items={breadcrumbItems} theme="light" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <div className="text-yellow-400 font-medium mb-4">
                {post.category}
              </div>
              <h1 className="text-4xl font-bold mb-4">
                {post.title}
              </h1>
              <div className="text-gray-300">
                {new Date(post.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <BlogContent content={post.content} />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost: BlogPost) => (
                <Link
                  href={`/blog/${relatedPost.slug}`}
                  key={relatedPost.slug}
                  className="bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="relative h-48">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm font-medium text-yellow-500 mb-2">
                      {relatedPost.category}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Need Professional Roofing Help?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with trusted local roofers who can help with your roofing needs.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg"
          >
            Find a Roofer
          </Link>
        </div>
      </div>
    </div>
  );
} 