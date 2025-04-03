import { FaMapMarkerAlt, FaTools } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface RooferCardProps {
  businessName: string;
  address: string;
  website?: string;
  services?: string[];
  coverage?: string[];
  distance?: number;
  logo?: string;
}

// Function to check if a color is dark
const isColorDark = (r: number, g: number, b: number) => {
  // Calculate relative luminance using a stricter threshold
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6; // Increased threshold to catch more logos as "dark"
};

export default function RooferCard({ 
  businessName, 
  address, 
  website, 
  services = [], 
  coverage = [],
  distance,
  logo
}: RooferCardProps) {
  const [isDarkLogo, setIsDarkLogo] = useState(false);
  
  // Generate logo path from business name as fallback
  const generatedLogoPath = `/logos/${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  // Use provided logo path or fall back to generated one
  const logoPath = logo || generatedLogoPath;

  useEffect(() => {
    const checkLogoColor = async () => {
      try {
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.src = logoPath;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Sample pixels from the edges of the image
          const sampleSize = 10;
          const pixels = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
          
          // Calculate average color of sampled pixels
          let totalR = 0, totalG = 0, totalB = 0, count = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] > 0) { // Only count non-transparent pixels
              totalR += pixels[i];
              totalG += pixels[i + 1];
              totalB += pixels[i + 2];
              count++;
            }
          }

          if (count > 0) {
            const avgR = totalR / count;
            const avgG = totalG / count;
            const avgB = totalB / count;
            setIsDarkLogo(isColorDark(avgR, avgG, avgB));
          }
        };
      } catch (error) {
        console.error('Error analyzing logo:', error);
      }
    };

    checkLogoColor();
  }, [logoPath]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full min-h-[400px] flex flex-col">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image
              src={logoPath}
              alt={`${businessName} logo`}
              width={64}
              height={64}
              className="w-16 h-16 object-contain rounded-lg"
              onError={(e) => {
                // If logo fails to load, replace with default home icon
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>';
                  parent.appendChild(icon.firstChild!);
                }
              }}
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white leading-tight mb-1">{businessName}</h3>
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
          {(distance !== undefined && (distance <= 15 || distance === 0)) && (
            <span className="bg-yellow-400 text-black px-3 py-0.5 rounded-full text-sm font-medium">
              Local Roofer
            </span>
          )}
          {distance !== undefined && distance > 0 && distance > 15 && (
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
            Note: This roofer is {Math.round(distance)} miles away from your location. Therefore may not cover your postcode.
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