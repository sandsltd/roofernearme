'use client';

import Link from 'next/link';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbsProps {
  items: {
    label: string;
    url?: string;
  }[];
  theme?: 'light' | 'dark';
}

export function Breadcrumbs({ items, theme = 'dark' }: BreadcrumbsProps) {
  const textColor = theme === 'dark' 
    ? 'text-white' 
    : 'text-gray-600';
  
  const activeColor = theme === 'dark'
    ? 'text-yellow-400'
    : 'text-blue-600';
  
  const hoverColor = theme === 'dark'
    ? 'hover:text-yellow-400'
    : 'hover:text-blue-600';
  
  const separatorColor = theme === 'dark'
    ? 'text-white/70'
    : 'text-gray-400';

  return (
    <nav className="flex items-center space-x-1 text-sm font-medium py-2 px-2">
      <Link href="/" className={`flex items-center ${textColor} ${hoverColor} transition-colors`}>
        <FaHome className="mr-1" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <FaChevronRight className={`${separatorColor} mx-1 text-xs`} />
          {item.url ? (
            <Link 
              href={item.url} 
              className={`${textColor} ${hoverColor} transition-colors`}
            >
              {item.label}
            </Link>
          ) : (
            <span className={activeColor}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
} 