import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaHome className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-lg transition-colors duration-300"
        >
          <FaHome className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
} 