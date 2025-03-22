import Image from 'next/image';
import Link from 'next/link';
import { FaTools, FaMapMarkerAlt, FaHome, FaRuler, FaPhoneAlt, FaStar, FaGlobe } from 'react-icons/fa';

interface RooferCardProps {
  name: string;
  description: string;
  address: string;
  city: string;
  website?: string;
}

export default function RooferCard({ name, description, address, city, website }: RooferCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full">
      {/* Card Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        {/* Logo & Title */}
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-white p-2 rounded-full shadow-md w-16 h-16 flex items-center justify-center">
              <FaHome className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
            {/* Rating stars for visual appeal */}
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Location and Distance */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <FaMapMarkerAlt className="h-5 w-5" />
            <span className="font-medium">{address}, {city}</span>
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Services */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-blue-700 mb-3">
            <FaTools className="h-5 w-5" />
            <span className="font-semibold">Services</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Services would be populated here */}
          </div>
        </div>

        {/* Distance Warning if over 50 miles */}
        {/* Distance warning would be populated here */}

        {/* Visit Website Button */}
        {website && (
          <div className="pt-3">
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Visit Website
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 