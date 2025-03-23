'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaHome className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We apologize for the inconvenience. Please try again or return to the homepage.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 