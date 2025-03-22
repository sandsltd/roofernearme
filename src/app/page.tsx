'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaHardHat, FaCheckCircle, FaPoundSign, FaTools, FaHome, FaMapMarkerAlt, FaBuilding, FaClock } from 'react-icons/fa';
import RooferCard from '@/components/RooferCard';
import rooferData from '@/data/roofers.json';
import Link from 'next/link';
import Image from 'next/image';

// Define regions and their nearby areas
const regionMappings: { [key: string]: string[] } = {
  'london': [
    'Barnet',
    'Camden',
    'Ealing',
    'Enfield',
    'Fulham',
    'Hammersmith',
    'Harrow',
    'Islington',
    'Kensington',
    'Westminster'
  ],
  'basingstoke': ['Basingstoke', 'Fleet', 'Farnborough'],
  'fleet': ['Fleet', 'Basingstoke', 'Farnborough'],
  'farnborough': ['Farnborough', 'Fleet', 'Basingstoke']
};

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

// Define Google Maps types
interface GoogleMapsGeocoder {
  geocode(request: { 
    address: string;
    region?: string;
  }): Promise<{
    results: {
      formatted_address: string;
      geometry: {
        location: {
          toJSON(): { lat: number; lng: number }
        }
      }
    }[]
  }>;
}

interface GoogleMapsPlaces {
  AutocompleteService: {
    new(): {
      getPlacePredictions(request: {
        input: string;
        componentRestrictions?: { country: string[] };
        types?: string[];
      }): Promise<{ predictions: AutocompletePrediction[] }>;
    };
  };
}

interface AutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Update the Window interface
declare global {
  interface Window {
    google: {
      maps: {
        Geocoder: new () => GoogleMapsGeocoder;
        places: GoogleMapsPlaces;
      };
    };
    gm_authFailure: () => void;
    searchTimeout: ReturnType<typeof setTimeout>;
  }
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
      location: { toJSON(): { lat: number; lng: number } }
    }
  }[] 
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

// UK postcodes to latitude/longitude fallback mapper
// This helps ensure functionality works even if Google API has quota/auth issues
const postcodeToCoords: {[key: string]: {lat: number, lng: number}} = {
  'SO41': {lat: 50.7595, lng: -1.5664}, // Lymington
  'SO51': {lat: 50.9882, lng: -1.5022}, // Romsey
  'SO15': {lat: 50.9108, lng: -1.4226}, // Southampton
  'SO14': {lat: 50.9052, lng: -1.4049}, // Southampton City Center
  'SO16': {lat: 50.9404, lng: -1.4420}, // Southampton North
  'SO17': {lat: 50.9268, lng: -1.3975}, // Southampton East
  'SO18': {lat: 50.9257, lng: -1.3522}, // Southampton Bitterne
  'SO19': {lat: 50.8851, lng: -1.3645}, // Southampton Sholing
  'SO20': {lat: 51.1157, lng: -1.5410}, // Stockbridge
  'SO21': {lat: 51.0898, lng: -1.3213}, // Winchester
  'SO22': {lat: 51.0622, lng: -1.3366}, // Winchester West
  'SO23': {lat: 51.0636, lng: -1.3084}, // Winchester Central
  'SO30': {lat: 50.9187, lng: -1.3116}, // Eastleigh
  'SO40': {lat: 50.9205, lng: -1.5346}, // Totton
  'SO45': {lat: 50.8432, lng: -1.4060}, // Hythe
  'BH25': {lat: 50.7521, lng: -1.6644}, // New Milton
};

// Add this component before the main Home component
// This is a separate component to prevent focus issues
const SearchInput = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const triggerSearch = () => {
    onSearch(inputValue);
  };

  return (
    <div className="w-full flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            triggerSearch();
          }
        }}
        className="flex-1 px-6 py-4 text-lg focus:outline-none text-gray-900 placeholder-gray-500"
        placeholder="Enter postcode"
        autoComplete="off"
      />
      <button 
        onClick={triggerSearch}
        className="bg-yellow-400 text-black px-8 py-5 hover:bg-yellow-500 transition-colors duration-300 flex items-center gap-2"
        aria-label="Search for roofers"
      >
        <FaSearch className="h-5 w-5" />
        <span>Search</span>
      </button>
    </div>
  );
};

// Add type definitions for Google Maps geocoding response
interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      toJSON(): { lat: number; lng: number; };
    };
  };
}

interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

// Add function to get outcode from postcode
function getOutcode(postcode: string): string {
  // Remove all spaces and get uppercase version
  const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  // Match the outward code (everything before the last 3 characters)
  const outcodeMatch = cleanPostcode.match(/^[A-Z]{1,2}[0-9][0-9A-Z]?/);
  return outcodeMatch ? outcodeMatch[0] : cleanPostcode;
}

interface PostcodesIOResponse {
  result?: {
    parish?: string;
    admin_district?: string;
    admin_ward?: string;
    nuts?: string;
    primary_care_trust?: string;
  };
}

interface OutcodesIOResponse {
  result?: {
    admin_district?: string[];
  };
}

interface TownPostcodes {
  [key: string]: string[];
}

// Add function to check if postcode belongs to a town
async function isPostcodeInTown(postcode: string, towns: string[]): Promise<boolean> {
  try {
    // Get the outcode (e.g., "SO1" from "SO1 1AA")
    const outcode = getOutcode(postcode);
    
    // First try with the full postcode
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    let data: PostcodesIOResponse | OutcodesIOResponse;
    
    if (!response.ok) {
      // If full postcode fails, try with just the outcode
      const outcodeResponse = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(outcode)}`);
      if (!outcodeResponse.ok) return false;
      data = await outcodeResponse.json() as OutcodesIOResponse;
      
      // For outcodes, check the admin district and parish
      if (!data.result) return false;
      
      // Check if any of the towns are in the admin district
      const townPostcodes: TownPostcodes = {
        'Southampton': ['SO1', 'SO2', 'SO3', 'SO4', 'SO5', 'SO6', 'SO7', 'SO8', 'SO9', 'SO14', 'SO15', 'SO16', 'SO17', 'SO18', 'SO19'],
        'Portsmouth': ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'],
        'Chichester': ['PO18', 'PO19', 'PO20'],
        'Eastleigh': ['SO50', 'SO53'],
        'Fareham': ['PO14', 'PO15', 'PO16', 'PO17'],
        'Gosport': ['PO12', 'PO13'],
        'Havant': ['PO7', 'PO8', 'PO9', 'PO10', 'PO11'],
        'Waterlooville': ['PO7', 'PO8']
      };

      return towns.some(town => 
        (data as OutcodesIOResponse).result?.admin_district?.some(district => 
          district.toLowerCase().includes(town.toLowerCase())
        ) ||
        // Also check if the outcode is associated with any of the coverage towns
        towns.some(coverageTown => 
          townPostcodes[coverageTown]?.includes(outcode)
        )
      );
    }
    
    data = await response.json() as PostcodesIOResponse;
    if (!data.result) return false;

    // Check various location fields for matches
    const locationFields = [
      data.result.parish?.toLowerCase(),
      data.result.admin_district?.toLowerCase(),
      data.result.admin_ward?.toLowerCase(),
      data.result.nuts?.toLowerCase(),
      data.result.primary_care_trust?.toLowerCase()
    ].filter((field): field is string => Boolean(field));

    return towns.some(town => 
      locationFields.some(field => field.includes(town.toLowerCase()))
    );
  } catch (error) {
    console.error('Error checking postcode location:', error);
    return false;
  }
}

// Define postcode districts for each town
const townPostcodeDistricts: { [key: string]: string[] } = {
  'Southampton': ['SO14', 'SO15', 'SO16', 'SO17', 'SO18', 'SO19'],
  'Eastleigh': ['SO50', 'SO53'],
  'Fareham': ['PO14', 'PO15', 'PO16', 'PO17'],
  'Portsmouth': ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'],
  'Gosport': ['PO12', 'PO13'],
  'Havant': ['PO7', 'PO8', 'PO9', 'PO10', 'PO11'],
  'Waterlooville': ['PO7', 'PO8'],
  'Chichester': ['PO18', 'PO19', 'PO20']
};

// Function to get postcode district (e.g., "PO18" from "PO18 8JQ")
function getPostcodeDistrict(postcode: string): string {
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  const match = clean.match(/^[A-Z]{1,2}\d{1,2}/);
  return match ? match[0] : clean;
}

// Function to check if a postcode is in coverage area
function isInCoverageArea(postcode: string, coverageTowns: string[]): boolean {
  const district = getPostcodeDistrict(postcode);
  
  // Check if the postcode district is in any of the coverage towns' districts
  return coverageTowns.some(town => 
    townPostcodeDistricts[town]?.some(coverageDistrict => 
      district.startsWith(coverageDistrict)
    )
  );
}

interface Roofer {
  businessName: string;
  description?: string;
  location: string;
  city?: string;
  website?: string;
  services?: string[];
  coverage?: string[];
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Roofer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geocoder, setGeocoder] = useState<GoogleMapsGeocoder | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      if ('initGoogleMaps' in window) {
        // @ts-ignore - handle the case if it exists
        window.initGoogleMaps = function() {};
      }
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
      const searchCoords = searchResult.geometry.location.toJSON();

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
              searchCoords.lat,
              searchCoords.lng,
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

    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]);
      setSearchMessage(`There was an error processing your search. Please try again.`);
    }

    setHasSearched(true);
    setIsLoading(false);
  };

  // Update the search results section
  const SearchResults = () => (
    <div id="search-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {searchResults.length > 0 ? (
        <>
          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-xl px-8 py-4 shadow-md border border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{searchMessage}</h2>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {searchResults.map((roofer, index) => (
              <RooferCard
                key={index}
                name={roofer.businessName}
                description={roofer.description || "Professional roofing services"}
                address={roofer.location}
                city={roofer.city || ""}
                website={roofer.website}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-3xl mx-auto text-center">
          <div className="inline-block bg-blue-50 p-6 rounded-full mb-6">
            <FaMapMarkerAlt className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No Roofers Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We don't have any roofers within 35 miles of {searchMessage.split("We don't have any roofers within 35 miles of ")[1]?.split(".")[0] || "this location"}.
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

  return (
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
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/Roofer Near Me-2.png"
                      alt="Roofers Near Me Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                    />
                    <span className="ml-3 text-2xl font-bold text-white">Roofers Near Me</span>
                  </Link>
                </div>
                <div>
                  <Link
                    href="/recommend"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
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
                      />
                    </div>
                    <button 
                      onClick={() => handleSearch()}
                      className="bg-yellow-400 text-black px-6 py-4 hover:bg-yellow-500 transition-colors duration-300 flex items-center gap-2"
                    >
                      <FaSearch className="h-5 w-5" />
                      <span>Search</span>
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

      {/* Rest of the content */}
      {hasSearched && (
        <SearchResults />
      )}

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
              <p className="text-gray-800 mb-4">
                Don't let a damaged roof compromise your home's integrity. Our network of skilled roofers specializes in prompt, efficient repairs for:
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
                When repairs aren't enough, a complete roof replacement ensures long-term protection. Our expert roofers offer:
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
                When repairs aren't sufficient, our roofers offer complete gutter replacement solutions:
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
            alt="Roofers Near Me Logo"
            width={40}
            height={40}
            className="mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">
            Saunders Simmons Ltd | Registered in England and Wales<br />
            © {new Date().getFullYear()} Roofers Near Me - A Saunders Simmons Ltd Service
          </p>
        </div>
      </footer>
    </div>
  );
}

