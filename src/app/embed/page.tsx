'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCopy, FaCheck } from 'react-icons/fa';

export default function EmbedPage() {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- Local Roofer Near Me Directory Badge - Start -->
<div class="lrnm-badge">
  <a href="https://www.localroofernearme.co.uk" target="_blank" rel="noopener noreferrer" class="lrnm-badge-link">
    <div class="lrnm-badge-inner">
      <img src="https://www.localroofernearme.co.uk/Roofer%20Near%20Me-2.png" alt="Local Roofer Near Me Directory" class="lrnm-badge-logo">
      <div class="lrnm-badge-text">
        <div class="lrnm-badge-title">Verified Member</div>
        <div class="lrnm-badge-subtitle">Local Roofer Near Me Directory</div>
      </div>
    </div>
  </a>
  <style>
    .lrnm-badge {
      max-width: 300px;
      margin: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    .lrnm-badge-link {
      text-decoration: none;
      display: block;
      padding: 12px;
      border-radius: 12px;
      background: linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    .lrnm-badge-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06);
    }
    .lrnm-badge-inner {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .lrnm-badge-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    .lrnm-badge-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .lrnm-badge-title {
      color: #1a1a1a;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.2;
    }
    .lrnm-badge-subtitle {
      color: #4a5568;
      font-size: 14px;
      line-height: 1.2;
    }
    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .lrnm-badge-link {
        background: linear-gradient(145deg, #2d3748 0%, #1a202c 100%);
        border-color: rgba(255, 255, 255, 0.1);
      }
      .lrnm-badge-title {
        color: #ffffff;
      }
      .lrnm-badge-subtitle {
        color: #cbd5e0;
      }
    }
    /* Alternative dark background detection */
    :root[data-theme="dark"] .lrnm-badge-link,
    [data-theme="dark"] .lrnm-badge-link,
    .dark .lrnm-badge-link,
    .dark-mode .lrnm-badge-link {
      background: linear-gradient(145deg, #2d3748 0%, #1a202c 100%);
      border-color: rgba(255, 255, 255, 0.1);
    }
    :root[data-theme="dark"] .lrnm-badge-title,
    [data-theme="dark"] .lrnm-badge-title,
    .dark .lrnm-badge-title,
    .dark-mode .lrnm-badge-title {
      color: #ffffff;
    }
    :root[data-theme="dark"] .lrnm-badge-subtitle,
    [data-theme="dark"] .lrnm-badge-subtitle,
    .dark .lrnm-badge-subtitle,
    .dark-mode .lrnm-badge-subtitle {
      color: #cbd5e0;
    }
  </style>
</div>
<!-- Local Roofer Near Me Directory Badge - End -->`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="relative z-10">
        <nav className="bg-white shadow-sm">
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
                  <span className="ml-3 text-lg sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
                    Local Roofer Near Me
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Directory Member Badge
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Copy the code below to add our verified member badge to your website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Preview Section */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Preview</h2>
            <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: embedCode }} />
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                The badge automatically adapts to light and dark backgrounds.
              </p>
            </div>
          </div>

          {/* Code Section */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Embed Code</h2>
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {copied ? (
                  <>
                    <FaCheck className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy className="mr-2" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Copy the code above</li>
                <li>Paste it into your website&apos;s HTML where you want the badge to appear</li>
                <li>The badge will automatically adapt to light and dark backgrounds</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 