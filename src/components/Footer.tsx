'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Image
                src="/Roofer Near Me-2.png"
                alt="Local Roofer Near Me Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-white">Local Roofer Near Me</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connecting you with trusted local roofing professionals across the UK 
              for quality repairs, installations, and maintenance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                Home
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                Blog
              </Link>
              <Link href="/recommend" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                Recommend a Roofer
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <p className="text-gray-400 text-sm">
              Are you a roofer? <Link href="/recommend" className="text-yellow-400 hover:text-yellow-300">Join our network</Link>
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            Saunders Simmons Ltd | Registered in England and Wales<br />
            © {currentYear} Local Roofer Near Me - A Saunders Simmons Ltd Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 