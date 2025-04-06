'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/Roofer Near Me-2.png"
                alt="Local Roofer Near Me Logo"
                width={40}
                height={40}
                className="h-8 w-auto sm:h-10"
              />
              <span className="ml-3 text-lg sm:text-2xl font-bold text-white whitespace-nowrap">
                Local Roofer Near Me
              </span>
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/blog"
              className="text-white hover:text-yellow-300 font-medium transition-colors duration-300"
            >
              Blog
            </Link>
            <Link
              href="/recommend"
              className="inline-flex items-center justify-center bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg"
            >
              Recommend a Roofer
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-yellow-300 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 pb-4 space-y-1">
            <Link
              href="/blog"
              className="block text-white hover:bg-blue-600 px-3 py-2 rounded-md font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/recommend"
              className="block bg-yellow-400 text-black px-3 py-2 rounded-md font-medium hover:bg-yellow-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Recommend a Roofer
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header; 