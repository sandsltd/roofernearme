'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';
import { blogPosts } from '@/data/blog-posts';
import type { BlogPost } from '@/data/blog-posts';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
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
                      alt="Roofers Near Me Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                    />
                    <span className="ml-3 text-2xl font-bold text-white">Roofers Near Me</span>
                  </Link>
                </div>
                <div>
                  <Link
                    href="/"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Find a Roofer
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
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

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                selectedCategory === category
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post: BlogPost) => (
            <Link 
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-yellow-600 font-medium mb-2">{post.category}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString('en-GB', { 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                  <span className="text-yellow-600 hover:text-yellow-700 transition-colors duration-300">
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
            alt="Roofers Near Me Logo"
            width={40}
            height={40}
            className="mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">
            Saunders Simmons Ltd | Registered in England and Wales<br />
            © {new Date().getFullYear()} Roofers Near Me - A Saunders Simmons Ltd Service
          </p>
        </div>
      </footer>
    </div>
  );
} 