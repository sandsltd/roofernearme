'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaPoundSign, FaTools, FaHome, FaMapMarkerAlt, FaBuilding, FaClock } from 'react-icons/fa';
import RooferCard from '@/components/RooferCard';
import rooferData from '@/data/roofers.json';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import RoofersMap from '@/components/RoofersMap';
import LondonMap from '@/components/LondonMap';

// Define Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        Geocoder: new () => GoogleMapsGeocoder;
      };
    };
    gm_authFailure?: () => void;
  }
}

interface GoogleMapsLocation {
  lat: () => number;
  lng: () => number;
  toJSON: () => { lat: number; lng: number };
}

interface GoogleMapsGeocoder {
  geocode: (request: { address: string }) => Promise<{
    results: {
      formatted_address: string;
      geometry: {
        location: GoogleMapsLocation;
      };
    }[];
    status: string;
  }>;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: GoogleMapsLocation;
  };
}

interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

interface Roofer {
  businessName: string;
  logo?: string;
  location: string;
  city?: string;
  website?: string;
  services?: string[];
  coverage?: string[];
  distance?: number;
  postcode: string;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Add a helper function for geocoding with retry
const geocodeWithRetry = async (
  geocoder: GoogleMapsGeocoder,
  address: string,
  maxRetries = 3,
  delay = 1000
): Promise<{
  results: {
    formatted_address: string;
    geometry: {
      location: GoogleMapsLocation;
    };
  }[];
  status: string;
} | null> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await geocoder.geocode({ address });
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error(`Failed to geocode ${address} after ${maxRetries} attempts:`, error);
        return null;
      }
      console.warn(`Retrying geocode for ${address}, attempt ${retries} of ${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Roofer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geocoder, setGeocoder] = useState<GoogleMapsGeocoder | null>(null);

  // Add useEffect for scrolling
  useEffect(() => {
    if (hasSearched && !isLoading) {
      const searchResults = document.getElementById('search-results');
      if (searchResults) {
        searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [hasSearched, isLoading]);

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const loadGoogleMapsScript = () => {
        return new Promise<void>((resolve, reject) => {
          try {
            // Remove any existing script to prevent duplicate loads
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
              existingScript.remove();
            }
            
            const script = document.createElement('script');
            // Load only geocoding library since it's what's working - remove places API
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=quarterly&region=GB`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
              try {
                if (window.google && window.google.maps) {
                  const geocoder = new window.google.maps.Geocoder();
                  setGeocoder(geocoder);
                  console.log('Google Maps geocoding initialized successfully');
                  resolve();
                } else {
                  console.error('Google Maps API not available');
                  reject(new Error('Google Maps API not available'));
                }
              } catch (error) {
                console.error('Error initializing services:', error);
                reject(error);
              }
            };
            
            script.onerror = (error) => {
              console.error('Error loading script:', error);
              reject(error);
            };
            
            document.head.appendChild(script);
          } catch (error) {
            console.error('Error creating script:', error);
            reject(error);
          }
        });
      };

      loadGoogleMapsScript().catch(error => {
        console.error('Failed to load Google Maps:', error);
      });
    } else if (!geocoder) {
      try {
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          setGeocoder(geocoder);
          console.log('Google Maps geocoding reinitialized successfully');
        } else {
          console.error('Google Maps API not available for reinitialization');
        }
      } catch (error) {
        console.error('Error reinitializing Google Maps services:', error);
      }
    }
    
    // Add global error handler for the Google Maps JavaScript API
    window.gm_authFailure = () => {
      console.warn('Google Maps authentication warning: Some features may be limited');
      // Don't set any error message since the main functionality works
    };
    
    return () => {
      // Clean up global objects when component unmounts
      // @ts-expect-error - handle the case if it exists
      window.initGoogleMaps = function() {};
      window.gm_authFailure = function() {}; // Replace with no-op function
      
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) {
        script.remove();
      }
    };
  }, [geocoder]);

  const handleSearch = async (location?: string) => {
    setIsLoading(true);
    setSearchResults([]);
    setSearchMessage('');
    
    const searchTermLower = (location || searchTerm).toLowerCase().trim();
    const upperSearchTerm = searchTermLower.toUpperCase();
    
    if (!searchTermLower) {
      setSearchMessage('Please enter a location to search');
      setIsLoading(false);
      return;
    }

    try {
      if (!geocoder) {
        setSearchMessage('Location service is not available');
        setIsLoading(false);
        return;
      }

      // Get coordinates for the search term
      const searchResponse = await geocodeWithRetry(geocoder, searchTermLower + ', UK', 2) as GeocodeResponse;
      if (!searchResponse?.results?.[0]) {
        setSearchMessage('Location not found. Please try a different search term.');
        setIsLoading(false);
        return;
      }

      const searchResult = searchResponse.results[0];
      const location = searchResult.geometry.location;
      const coords = location.toJSON();
      const lat = coords.lat;
      const lng = coords.lng;

      // Get the postcode from the search result if available
      const searchPostcode = searchResult.address_components
        .find((component: AddressComponent) => component.types.includes('postal_code'))?.short_name || '';

      const shortAddress = searchPostcode || 
        searchResult.address_components
          .find((component: AddressComponent) => component.types.includes('locality'))?.short_name ||
        upperSearchTerm;

      // Calculate distance to all roofers
      const rooferDistances = [];
      
      for (const roofer of rooferData.roofers) {
        try {
          const rooferResponse = await geocodeWithRetry(geocoder, roofer.postcode + ', UK', 2) as GeocodeResponse;
          if (rooferResponse?.results?.[0]) {
            const rooferCoords = rooferResponse.results[0].geometry.location.toJSON();
            const distance = calculateDistance(
              lat,
              lng,
              rooferCoords.lat,
              rooferCoords.lng
            );
            
            const distanceMiles = Math.round(distance * 0.621371);
            
            // Include all roofers with their distance
            rooferDistances.push({
              ...roofer,
              distance: distanceMiles
            });
          }
        } catch (error) {
          console.error(`Error getting coordinates for ${roofer.postcode}:`, error);
        }
      }

      // Sort by distance and take top 3
      const nearestRoofers = rooferDistances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      if (nearestRoofers.length > 0) {
        setSearchResults(nearestRoofers);
        setSearchMessage(`We found the ${nearestRoofers.length} closest roofer${nearestRoofers.length > 1 ? 's' : ''} to ${shortAddress}`);
      } else {
        setSearchResults([]);
        setSearchMessage(`We couldn't find any roofers near ${shortAddress}. Please try a different location.`);
      }

      // Send search notification
      try {
        const response = await fetch('/api/search-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchTerm: searchTermLower,
            postcode: searchPostcode,
            results: nearestRoofers.map(roofer => ({
              businessName: roofer.businessName,
              distance: roofer.distance
            }))
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error('Failed to send notification');
        }
      } catch (error) {
        console.error('Error sending search notification:', error);
        // Don't show error to user as this is background functionality
      }

      setHasSearched(true);
      setIsLoading(false);

      // Scroll to search results immediately
      const searchResults = document.getElementById('search-results');
      if (searchResults) {
        searchResults.scrollIntoView({ behavior: 'instant', block: 'start' });
      }

    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]);
      setSearchMessage(`There was an error processing your search. Please try again.`);
      setIsLoading(false);
    }
  };

  // Update the search results section
  const SearchResults = () => (
    <div id="search-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
      <div className="text-center mb-8">
        <div className="inline-block bg-white rounded-xl px-8 py-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                <span className="text-gray-900">Searching your area...</span>
              </>
            ) : searchResults.length > 0 ? (
              <>
                <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{searchMessage}</h2>
              </>
            ) : hasSearched ? (
              <>
                <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">No Results Found</h2>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results Grid - Only show when we have results and not loading */}
      {searchResults.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {searchResults.map((roofer, index) => (
            <RooferCard
              key={index}
              businessName={roofer.businessName}
              logo={roofer.logo}
              address={roofer.location}
              website={roofer.website}
              services={roofer.services}
              coverage={roofer.coverage}
              distance={roofer.distance}
            />
          ))}
        </div>
      )}

      {/* No Results Message - Only show when explicitly no results and not loading */}
      {hasSearched && !isLoading && searchResults.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-3xl mx-auto text-center">
          <div className="inline-block bg-blue-50 p-6 rounded-full mb-6">
            <FaMapMarkerAlt className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No Roofers Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We don&apos;t have any roofers within 35 miles of {searchMessage.split("We don&apos;t have any roofers within 35 miles of ")[1]?.split(".")[0] || "this location"}.
          </p>
          <Link 
            href="/recommend" 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md text-lg"
          >
            <FaTools className="h-5 w-5" />
            <span>Recommend a Roofer in Your Area</span>
          </Link>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (hasSearched && !isLoading) {
      const searchResults = document.getElementById('search-results');
      if (searchResults) {
        searchResults.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }
  }, [hasSearched, isLoading, searchResults.length]);

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Local Roofer Near Me",
            "description": "Find verified local roofers across the UK. Get free quotes for roof repairs, replacements, and maintenance.",
            "url": "https://www.localroofernearme.co.uk",
            "areaServed": {
              "@type": "Country",
              "name": "United Kingdom"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "GB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150"
            },
            "serviceType": [
              "Roof Repair",
              "Roof Replacement",
              "Emergency Roof Repair",
              "Gutter Repair",
              "Gutter Replacement"
            ]
          })
        }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Map Background */}
        <div className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/Untitled design-16.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-blue-900/5 to-blue-900/20" />
          </div>

          {/* Navigation Bar */}
          <div className="relative z-10">
            <nav className="bg-white/5 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                  <div className="flex items-center flex-shrink-0">
                    <Link href="/" className="flex items-center">
                      <Image
                        src="/Roofer Near Me-2.png"
                        alt="Local Roofer Near Me Logo"
                        width={40}
                        height={40}
                        className="h-8 w-auto sm:h-10"
                      />
                      <span className="ml-3 text-lg sm:text-2xl font-bold text-white whitespace-nowrap">Local Roofer Near Me</span>
                    </Link>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href="/recommend"
                      className="hidden md:inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap"
                    >
                      Recommend a Roofer
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Find Trusted Local Roofers
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12">
                Connect with verified roofing professionals in your area. Get quick responses and quality service for all your roofing needs.
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                {isLoading ? (
                  <div className="w-full py-4 flex justify-center items-center bg-white rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                    <span className="ml-3 text-gray-900">Searching your area...</span>
                  </div>
                ) : (
                  <div id="search-section" className="w-full">
                    <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter postcode"
                          className="w-full pl-12 pr-4 py-4 text-base focus:outline-none text-gray-900 placeholder-gray-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSearch();
                            }
                          }}
                          disabled={isLoading}
                        />
                      </div>
                      <button 
                        onClick={() => handleSearch()}
                        disabled={isLoading}
                        className={`px-6 py-4 flex items-center gap-2 transition-colors duration-300 ${
                          isLoading 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-yellow-400 text-black hover:bg-yellow-500'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent" />
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <FaSearch className="h-5 w-5" />
                            <span>Search</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-center mt-3">
                      <p className="text-sm text-white/80">For best results, enter your full postcode (e.g., SO41 9GH)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
              <div className="bg-blue-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-700 rounded-lg p-3">
                    <FaTools className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Expert Roofers</h3>
                    <p className="text-white/80 text-sm">Verified professionals with years of experience</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-700 rounded-lg p-3">
                    <FaClock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Quick Response</h3>
                    <p className="text-white/80 text-sm">Fast service for urgent roofing needs</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-700 rounded-lg p-3">
                    <FaCheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Quality Guaranteed</h3>
                    <p className="text-white/80 text-sm">Satisfaction guaranteed on every job</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && <SearchResults />}

        {/* Map Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">Our Network of Trusted Roofers</h1>
            <p className="text-gray-600 mb-4">
              Discover our verified roofing professionals across the UK. Hover over any marker to see the roofer&apos;s name, and click to search in their area.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* UK Map */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="relative w-full h-[675px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <div className="absolute top-0 left-0 bg-white/90 px-4 py-2 rounded-br text-sm font-medium z-10 border-b border-r border-gray-100">
                  United Kingdom
                </div>
                <RoofersMap 
                  className="w-full h-full" 
                  onRooferSelect={(roofer) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      handleSearch(roofer.postcode);
                    }, 300);
                  }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 text-center">View all our trusted roofers across the UK</p>
            </div>
            
            {/* London Map */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <div className="absolute top-0 left-0 bg-white/90 px-4 py-2 rounded-br text-sm font-medium z-10 border-b border-r border-gray-100">
                  Greater London Area
                </div>
                <LondonMap 
                  className="w-full h-full"
                  onRooferSelect={(roofer) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      handleSearch(roofer.postcode);
                    }, 300);
                  }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 text-center">Detailed view of our London coverage</p>
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Roofing Services in Your Area</h2>
              <p className="text-lg text-gray-800 max-w-3xl mx-auto">
                Find experienced local roofers for all your roofing needs, from minor repairs to complete roof replacements.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Roofing Repairs */}
              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-400 p-3 rounded-full mr-4">
                    <FaTools className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Roofing Repairs</h3>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  Don&apos;t let a damaged roof compromise your home&apos;s integrity. Our network of skilled roofers specializes in prompt, efficient repairs for:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Leaking roofs and water damage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Broken or missing tiles and slates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Storm damage assessment and repairs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Roof flashing and leadwork issues</span>
                  </li>
                </ul>
              </div>
              
              {/* Roof Replacements */}
              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-400 p-3 rounded-full mr-4">
                    <FaHome className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Roof Replacements</h3>
                </div>
                <p className="text-gray-800 mb-4">
                  When repairs aren&apos;t enough, a complete roof replacement ensures long-term protection. Our expert roofers offer:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Full roof replacements for all property types</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Various roofing materials including slate, tile, and felt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Energy-efficient and eco-friendly options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Expert installation with quality materials</span>
                  </li>
                </ul>
              </div>
              
              {/* Gutter Repair */}
              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-400 p-3 rounded-full mr-4">
                    <FaTools className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Gutter Repairs</h3>
                </div>
                <p className="text-gray-800 mb-4">
                  Damaged gutters can lead to serious water damage. Our roofers provide comprehensive gutter repair services:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Fixing leaks, holes, and separated joints</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Gutter cleaning and debris removal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Adjusting improper gutter pitch</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Repairing damaged fascia and soffits</span>
                  </li>
                </ul>
              </div>
              
              {/* Gutter Replacement */}
              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-400 p-3 rounded-full mr-4">
                    <FaHome className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Gutter Replacements</h3>
                </div>
                <p className="text-gray-800 mb-4">
                  When repairs aren&apos;t sufficient, our roofers offer complete gutter replacement solutions:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Full gutter system replacements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Various materials including uPVC, aluminum, and copper</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Seamless gutter installation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-gray-800">Enhanced drainage solutions and downpipe installation</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xl text-gray-800 mb-6 max-w-3xl mx-auto">
                Whatever your roofing needs, our network of local professionals provides quality workmanship, competitive pricing, and excellent customer service.
              </p>
              <Link
                href="#search-section"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300 shadow-md"
              >
                <FaSearch className="h-5 w-5" />
                <span>Find Roofers in Your Area</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Signals Section */}
        <div className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Why Use Roofers Near Me?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FaCheckCircle className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Local Roofers</h3>
                <p className="text-gray-800 leading-relaxed">All roofers are fully insured and registered with UK trade bodies. We verify every contractor.</p>
              </div>
              <div className="bg-white rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FaPoundSign className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Local Quotes</h3>
                <p className="text-gray-800 leading-relaxed">Get free, no-obligation quotes from trusted local roofers in your area within hours.</p>
              </div>
              <div className="bg-white rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FaTools className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Local Service</h3>
                <p className="text-gray-800 leading-relaxed">Connect with experienced local roofers who know your area and local building regulations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* For Roofing Contractors */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-yellow-400 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
              <div className="flex-1">
                <div className="text-black font-semibold mb-2">FOR ROOFING CONTRACTORS</div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                  Expand Your Business with Roofers Near Me
                </h2>
                <p className="text-black/80 text-lg mb-6 max-w-2xl">
                  Join our network of trusted roofing professionals and connect with homeowners in your area looking for quality roofing services.
                </p>
                <Link
                  href="/recommend"
                  className="inline-flex items-center bg-black text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-black/90 transition-colors duration-300"
                >
                  <FaBuilding className="h-5 w-5 mr-2" />
                  Register Your Interest
                </Link>
              </div>
              <div className="hidden md:flex items-center justify-center flex-col gap-4 ml-8">
                <div className="bg-black/10 backdrop-blur-sm rounded-xl px-6 py-3 text-black font-medium">
                  <span>Increase Visibility</span>
                </div>
                <div className="bg-black/10 backdrop-blur-sm rounded-xl px-6 py-3 text-black font-medium">
                  <span>Find New Customers</span>
                </div>
                <div className="bg-black/10 backdrop-blur-sm rounded-xl px-6 py-3 text-black font-medium">
                  <span>Grow Your Business</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Enhanced */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Image
              src="/Roofer Near Me-2.png"
              alt="Local Roofer Near Me Logo"
              width={40}
              height={40}
              className="mx-auto mb-4"
            />
            <p className="text-gray-400 text-sm">
              Saunders Simmons Ltd | Registered in England and Wales<br />
              © {new Date().getFullYear()} Local Roofer Near Me - A Saunders Simmons Ltd Service
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

