import { FaMapMarkerAlt, FaHome, FaTools } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface RooferCardProps {
  name: string;
  logo?: string;
  address: string;
  website?: string;
  services?: string[];
  coverage?: string[];
  distance?: number;
}

export default function RooferCard({ 
  name, 
  logo, 
  address, 
  website, 
  services = [], 
  coverage = [],
  distance
}: RooferCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full min-h-[400px] flex flex-col">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-full shadow-md w-16 h-16 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logo ? (
              <Image
                src={logo}
                alt={`${name} logo`}
                width={48}
                height={48}
                className="w-12 h-12 object-contain rounded-full"
              />
            ) : (
              <FaHome className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white leading-tight mb-1">{name}</h3>
            <div className="flex items-center gap-1">
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
        
        {/* Location with Local Badge */}
        <div className="mt-4 flex items-center flex-wrap gap-2 text-white/90">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{address}</span>
          </div>
          {(distance !== undefined && (distance <= 5 || distance === 0)) && (
            <span className="bg-yellow-400 text-black px-3 py-0.5 rounded-full text-sm font-medium">
              Local Roofer
            </span>
          )}
          {distance !== undefined && distance > 0 && distance > 5 && (
            <span className="text-sm text-white/75 whitespace-nowrap">
              ({Math.round(distance)} miles away)
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-grow flex flex-col gap-6">
        {/* Services */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-blue-700 mb-3">
            <FaTools className="h-5 w-5" />
            <span className="font-semibold">Services</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-6">
          <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Coverage Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {coverage.map((area, index) => (
              <span
                key={index}
                className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Distance Warning if over 50 miles */}
        {distance !== undefined && distance > 0 && distance > 50 && (
          <div className="p-3 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-lg text-sm">
            Note: This roofer is {Math.round(distance)} miles away from your location.
          </div>
        )}

        {/* Visit Website Button */}
        {website && (
          <Link
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium text-center py-3 rounded-lg transition-colors duration-300 mt-auto"
          >
            Visit Website
          </Link>
        )}
      </div>
    </div>
  );
} 