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
import { blogPosts } from '@/data/blog-posts';
import Breadcrumbs from '@/components/Breadcrumbs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  const [showScrollCTA, setShowScrollCTA] = useState(false);

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

  // Add scroll detection for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollCTA(scrollPosition > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Schema.org structured data */}
      <Script id="local-business-data" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Local Roofer Near Me",
            "description": "Find trusted local roofers across the UK for roof repairs, installations and maintenance.",
            "provider": {
              "@type": "Organization",
              "name": "Local Roofer Near Me",
              "logo": "https://www.localroofernearme.co.uk/Roofer%20Near%20Me-2.png"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United Kingdom"
            },
            "serviceType": ["Roof Repair", "Roof Installation", "Roof Maintenance"],
            "termsOfService": "Free to use service connecting homeowners with trusted local roofers",
            "serviceOutput": "Connection with verified local roofing professionals",
            "audience": {
              "@type": "PeopleAudience",
              "audienceType": "UK homeowners"
            }
          }
        `}
      </Script>
            
      {/* FAQ Schema */}
      <Script id="faq-data" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I find a trusted roofer near me?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can quickly find trusted roofers near you by entering your postcode into our search tool. We'll connect you with verified local roofing professionals who serve your area and provide the specific roofing services you need."
                }
              },
              {
                "@type": "Question",
                "name": "How much does roof repair typically cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Roof repair costs vary depending on the extent of damage, materials needed, and your location. Minor repairs might cost £150-£400, while major repairs can range from £500 to several thousand pounds. For an accurate quote, we recommend getting estimates from multiple local roofers."
                }
              },
              {
                "@type": "Question",
                "name": "How do I know if I need a roof repair or a full replacement?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Signs you may need a roof repair include missing shingles, small leaks, or damaged flashing. A full replacement is typically necessary if your roof is over 20 years old, has widespread damage, or multiple leaks. A professional roofer can inspect your roof and recommend the best course of action."
                }
              },
              {
                "@type": "Question",
                "name": "What questions should I ask before hiring a roofer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Before hiring a roofer, ask about their experience, insurance coverage, warranties offered, estimated timeline, and request references from previous clients. Also inquire about their approach to unexpected issues and additional costs that might arise during the project."
                }
              }
            ]
          }
        `}
      </Script>

      {/* Header */}
      <Header />
      
      {/* Breadcrumbs - visible on smaller pages */}
      <div className="bg-gray-100 py-2 hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Find a Roofer' }]} />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Untitled design-16.png"
            alt="Roofing professional on a roof"
            fill
            quality={90}
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-800/70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          {/* Main Hero Content */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              <span className="block">Roofer Near Me - Find Local</span>
              <span className="block text-yellow-400">Trusted Professionals Today</span>
            </h1>
            
            <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto">
              Connect with verified roofing professionals near you for repairs, 
              installations, and maintenance. Get free quotes from local experts.
            </p>
            
            <div className="flex justify-center mt-12">
              <div className="inline-block text-center">
                <div className="relative max-w-xl w-full">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter your postcode..."
                    className="pl-12 pr-32 py-4 w-full rounded-xl shadow-xl text-gray-900 bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent border-transparent focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg flex items-center transition-all duration-300"
                    onClick={() => handleSearch()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                        Searching...
                      </span>
                    ) : (
                      <>
                        <FaSearch className="mr-2" />
                        Find Roofers
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-white/80 mt-2">
                  For best results, enter your full postcode to find the closest roofers near you
                </p>
                {/* Popular locations */}
                <div className="mt-6">
                  <p className="text-sm text-white font-medium mb-2">Popular locations:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['London', 'Manchester', 'Birmingham', 'Glasgow', 'Leeds'].map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSearch(city)}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all duration-300"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      {/* Search Results */}
      {hasSearched && <SearchResults />}

      {/* Trust Signals Section - Enhanced */}
      <div className="bg-white py-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-3">Why Users Trust Us</div>
            <h2 className="text-3xl font-bold text-gray-900">What Makes Us Different</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm transform transition-transform duration-300 hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Local Roofers Near You</h3>
              <p className="text-gray-600">Find trusted roofers within minutes of your location</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm transform transition-transform duration-300 hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Verified Pros</h3>
              <p className="text-gray-600">All roofers are vetted and reviewed</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm transform transition-transform duration-300 hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600">Fast quotes from local experts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Roofing Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From emergency repairs to complete roof replacements, find expert roofers for any job
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaTools className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Repairs</h3>
              <p className="text-gray-600">24/7 emergency roof repair services for leaks, storm damage, and urgent issues.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaHome className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Roof Replacement</h3>
              <p className="text-gray-600">Complete roof replacement services with quality materials and expert installation.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaPoundSign className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Quotes</h3>
              <p className="text-gray-600">Get detailed quotes from multiple local roofers for your project.</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300"
            >
              Find a Roofer Today
            </button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">Find a Roofer Near Me</h2>
          <p className="text-gray-600 mb-4">
            Discover our verified roofing professionals near you across the UK. Hover over any marker to see the roofer&apos;s name, and click to search in their area.
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

      {/* Recent Blog Posts */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Expert Roofing Advice</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get professional tips and insights about roofing from our expert guides
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts
              .filter(post => !post.slug.startsWith('roofers-in-'))
              .slice(0, 3)
              .map((post, index) => (
              <Link
                key={index}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <span className="text-yellow-600 hover:text-yellow-700 transition-colors duration-300">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-3">Customer Stories</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Clients Say About Our Local Roofers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from homeowners who found trusted roofers near them
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-yellow-300 flex items-center justify-center text-yellow-800 text-xl font-bold mr-4">
                  SM
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Sarah M.</h3>
                  <p className="text-gray-500 text-sm">London</p>
                </div>
              </div>
              <div className="flex text-yellow-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-800">
                "After storm damage to our roof, I needed a roofer near me urgently. Found a local professional through this site who came the same day. Excellent service and reasonable pricing."
              </p>
              <div className="mt-4 text-sm text-yellow-700 font-medium">
                Emergency Roof Repair
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-yellow-300 flex items-center justify-center text-yellow-800 text-xl font-bold mr-4">
                  JT
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">James T.</h3>
                  <p className="text-gray-500 text-sm">Manchester</p>
                </div>
              </div>
              <div className="flex text-yellow-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-800">
                "Needed a complete roof replacement and got quotes from 3 local roofers through this site. The one I chose was professional, thorough and kept to the budget. Highly recommend!"
              </p>
              <div className="mt-4 text-sm text-yellow-700 font-medium">
                Roof Replacement
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-yellow-300 flex items-center justify-center text-yellow-800 text-xl font-bold mr-4">
                  LK
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Lisa K.</h3>
                  <p className="text-gray-500 text-sm">Birmingham</p>
                </div>
              </div>
              <div className="flex text-yellow-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-800">
                "I found a roofer near me who specialised in slate roofing. They understood the local architecture and regulations perfectly. The result looks amazing and has improved our home's value."
              </p>
              <div className="mt-4 text-sm text-yellow-700 font-medium">
                Slate Roofing Installation
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300"
            >
              Find Trusted Roofers Near You Now
            </button>
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
          
          {/* Why Choose a Roofer Near Me Section */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-sm mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose a Roofer Near Me?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-800 leading-relaxed mb-4">
                  Choosing a roofer near you offers several advantages over hiring contractors from further away:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-800"><strong>Faster Response Times</strong> - Local roofers can reach your property quickly, especially for emergency repairs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-800"><strong>Local Knowledge</strong> - Roofers near you understand regional weather patterns and building regulations.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-800"><strong>Community Reputation</strong> - It's easier to verify the quality of work from roofers in your area.</span>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-800"><strong>Better Communication</strong> - Face-to-face meetings are easier with local professionals.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-800"><strong>Lower Travel Costs</strong> - Nearby roofers don't need to factor in long travel distances.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-800"><strong>Ongoing Support</strong> - Local roofers are available for follow-up maintenance and warranty work.</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center justify-center bg-yellow-400 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-all duration-300"
                  >
                    Find a Roofer Near Me
                  </button>
                </div>
              </div>
            </div>
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
      
      {/* FAQ Section for "Roofer Near Me" */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Roofer Near Me - Frequently Asked Questions</h2>
            <p className="text-lg text-gray-800 max-w-3xl mx-auto">
              Find answers to common questions about finding and hiring local roofers
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How quickly can I find a roofer near me?</h3>
              <p className="text-gray-800">
                Our platform connects you with local roofers instantly. Simply enter your postcode and you'll see a list of verified roofers in your area within seconds. For emergency repairs, many local roofers offer same-day service when available.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What services do local roofers typically offer?</h3>
              <p className="text-gray-800">
                Roofers near you typically offer a comprehensive range of services including roof repairs, complete replacements, emergency repairs, maintenance, guttering work, chimney repairs, and inspections. Many local roofers also specialise in specific roofing materials like slate, tile, flat roofing, or metal roofing.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How much does a roofer near me typically charge?</h3>
              <p className="text-gray-800">
                Prices vary depending on the service required, materials used, and your location. Local roofers typically charge between £150-£250 for small repairs, while complete roof replacements can range from £5,000 to £15,000. Getting quotes from multiple local roofers can help you find competitive pricing.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How do I choose the best roofer near me?</h3>
              <p className="text-gray-800">
                Look for local roofers with verified reviews, proper insurance, and relevant experience with your type of roofing. Ask about warranties, get multiple quotes, and verify their local knowledge. Using our platform, you can easily compare local roofers' services, coverage areas, and reputation.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I find emergency roofers near me outside business hours?</h3>
              <p className="text-gray-800">
                Yes, many local roofers offer 24/7 emergency services for urgent issues like leaks, storm damage, or fallen debris. Using our platform, you can quickly identify roofers near you who provide emergency repairs, even on weekends and holidays.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is it better to hire a roofer near me or a national company?</h3>
              <p className="text-gray-800">
                Local roofers often provide more personalized service, faster response times, and detailed knowledge of regional roofing needs. They're typically more invested in their local reputation and can offer more competitive pricing without the overhead of national chains. For most homeowners, a reputable local roofer is the best choice.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300"
            >
              Find Your Local Roofer Now
            </button>
          </div>
        </div>
      </div>

      {/* Sticky CTA Button */}
      <div 
        className={`fixed bottom-5 right-5 z-40 transition-transform duration-300 ${
          showScrollCTA ? 'translate-y-0' : 'translate-y-24'
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
          aria-label="Find a roofer near me"
        >
          <FaMapMarkerAlt className="mr-2" />
          <span>Find a Roofer Near Me</span>
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

