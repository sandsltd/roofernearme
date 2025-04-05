'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaBook } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { BlogPost } from '@/data/blog-posts';

interface BlogPostsListProps {
  allPosts: BlogPost[];
}

export function BlogPostsList({ allPosts }: BlogPostsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(allPosts);

  // Listen for category selection events (simple pub/sub pattern)
  useEffect(() => {
    // Create a handler for the custom event
    const handleCategoryChange = (event: CustomEvent) => {
      const category = event.detail.category;
      setSelectedCategory(category);
      
      // Filter posts based on selected category
      const filtered = category === 'all'
        ? allPosts
        : allPosts.filter(post => post.category === category);
      
      setFilteredPosts(filtered);
    };

    // Add event listener for category changes
    window.addEventListener('categoryChange' as any, handleCategoryChange as EventListener);

    // Clean up the event listener
    return () => {
      window.removeEventListener('categoryChange' as any, handleCategoryChange as EventListener);
    };
  }, [allPosts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredPosts.map((post: BlogPost) => (
        <Link 
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
            <div className="text-sm text-blue-600 font-medium mb-2">{post.category}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <FaBook className="w-4 h-4 mr-2" />
                {post.readTime}
              </div>
              <span className="text-yellow-600 hover:text-yellow-700 transition-colors duration-300">
                Read More →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 