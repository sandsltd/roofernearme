import Link from 'next/link';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';
import { blogPosts } from '@/data/blog-posts';
import { CategoryFilter } from '../../components/CategoryFilter';
import { BlogPostsList } from '../../components/BlogPostsList';
import Breadcrumbs from '../../components/Breadcrumbs';
import Script from 'next/script';

export const metadata = {
  title: 'Roofing Tips & Guides | Local Roofer Near Me',
  description: 'Expert advice, local guides, and essential information about roofing services across the UK.',
  openGraph: {
    title: 'Roofing Tips & Guides | Local Roofer Near Me',
    description: 'Expert advice, local guides, and essential information about roofing services across the UK.',
    url: 'https://www.localroofernearme.co.uk/blog',
    siteName: 'Local Roofer Near Me',
    images: [
      {
        url: 'https://www.localroofernearme.co.uk/Untitled design-16.png',
        width: 1200,
        height: 630,
        alt: 'Roofing Tips & Guides',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofing Tips & Guides | Local Roofer Near Me',
    description: 'Expert advice, local guides, and essential information about roofing services across the UK.',
    images: ['https://www.localroofernearme.co.uk/Untitled design-16.png'],
  },
  keywords: 'roofing, roofers, roof repair, roof maintenance, roofing tips, roofing guides, UK roofers',
};

export default function BlogPage() {
  // Get unique categories from blog posts
  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];
  
  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Blog' }
  ];
  
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
      }
    ]
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs Structured Data */}
      <Script id="breadcrumbs-structured-data" type="application/ld+json">
        {JSON.stringify(breadcrumbsStructuredData)}
      </Script>
      
      {/* Hero Section with Map Background */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/Untitled design-16.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-900/10 to-blue-900/30" />
        </div>

        {/* Navigation Bar */}
        <div className="relative z-10">
          <nav className="bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/Roofer Near Me-2.png"
                      alt="Local Roofer Near Me Logo"
                      width={40}
                      height={40}
                      className="h-8 w-auto sm:h-10"
                    />
                    <span className="ml-3 text-lg sm:text-2xl font-bold text-white whitespace-nowrap">Local Roofer Near Me</span>
                  </Link>
                </div>
                <div>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg text-sm sm:text-base whitespace-nowrap"
                  >
                    Find a Roofer
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Breadcrumbs in Hero Section - Moved below and restyled */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 inline-block">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Roofing Tips & Guides
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12">
              Expert advice, local guides, and essential information about roofing services across the UK.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg"
            >
              <FaSearch className="h-5 w-5" />
              <span>Find Local Roofers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CategoryFilter categories={categories} />
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <BlogPostsList allPosts={blogPosts} />
      </div>

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/Roofer Near Me-2.png"
            alt="Local Roofer Near Me Logo"
            width={40}
            height={40}
            className="mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">
            Saunders Simmons Ltd | Registered in England and Wales<br />
            © {new Date().getFullYear()} Local Roofer Near Me - A Saunders Simmons Ltd Service
          </p>
        </div>
      </footer>
    </div>
  );
} 