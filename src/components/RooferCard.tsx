import Image from 'next/image';
import Link from 'next/link';
import { FaTools, FaMapMarkerAlt, FaHome, FaRuler, FaPhoneAlt, FaStar, FaGlobe } from 'react-icons/fa';

interface RooferCardProps {
  businessName: string;
  logo: string;
  services: string[];
  coverage: string[];
  website: string;
  postcode: string;
  location: string;
  distance?: number; // Optional distance in miles
}

export default function RooferCard({ businessName, logo, services, coverage, website, postcode, location, distance }: RooferCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full">
      {/* Card Header */}
      <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 p-6">
        {/* Logo & Title */}
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-white p-2 rounded-full shadow-md w-16 h-16 flex items-center justify-center">
              {logo ? (
                <Image
                  src={logo}
                  alt={`${businessName} logo`}
                  width={56}
                  height={56}
                  style={{ objectFit: 'contain' }}
                  className="rounded-full"
                />
              ) : (
                <FaHome className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{businessName}</h3>
            {/* Rating stars for visual appeal */}
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="h-4 w-4 text-yellow-300 mr-0.5" />
              ))}
              <span className="text-white text-sm ml-1">Verified Roofer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Location and Distance */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <FaMapMarkerAlt className="h-5 w-5" />
              <span className="font-medium">{location}</span>
            </div>
            {distance !== undefined && (
              <div className="flex items-center text-blue-700">
                <FaRuler className="h-4 w-4 mr-1" />
                <span className="font-medium">{distance} miles away</span>
              </div>
            )}
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-green-700 mb-3">
            <FaMapMarkerAlt className="h-5 w-5" />
            <span className="font-semibold">Coverage Areas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {coverage.map((area) => (
              <span
                key={area}
                className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-blue-700 mb-3">
            <FaTools className="h-5 w-5" />
            <span className="font-semibold">Services</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <span
                key={service}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Distance Warning if over 50 miles */}
        {distance && distance > 50 && (
          <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700">
              <FaMapMarkerAlt className="h-5 w-5" />
              <span className="font-medium">Travel Distance Warning</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              This roofer is {distance} miles away and may not cover your location due to travel time.
            </p>
          </div>
        )}

        {/* Visit Website Button */}
        <div className="pt-3">
          <Link
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md text-lg"
          >
            <span>Visit Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 