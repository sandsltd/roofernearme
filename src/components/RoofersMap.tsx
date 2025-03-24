import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import rooferData from '@/data/roofers.json';

interface MapProps {
  className?: string;
  onRooferSelect?: (roofer: typeof rooferData.roofers[0]) => void;
}

// Set your Mapbox token from environment variable
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.');
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RoofersMap({ className = '', onRooferSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    // Check if mapboxgl is supported
    if (!mapboxgl.supported()) {
      console.error('Your browser does not support Mapbox GL');
      setIsLoading(false);
      return;
    }

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        const mapInstance = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-3.5, 55],
          zoom: 5.5,
          minZoom: 5.5,
          maxZoom: 5.5,
          bounds: [
            [-8, 49.8], // Southwest coordinates (covering Cornwall)
            [1, 61]    // Northeast coordinates (covering Shetland Islands)
          ],
          fitBoundsOptions: {
            padding: { top: 20, bottom: 20, left: 20, right: 20 }
          }
        });

        // Disable zooming
        mapInstance.scrollZoom.disable();
        mapInstance.doubleClickZoom.disable();
        mapInstance.touchZoomRotate.disable();

        // Remove navigation controls since zooming is disabled
        // mapInstance.addControl(new mapboxgl.NavigationControl());

        // Wait for map to load before adding markers
        mapInstance.on('load', async () => {
          try {
            const bounds = new mapboxgl.LngLatBounds();

            // Add markers for each roofer
            for (const roofer of rooferData.roofers) {
              try {
                const response = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(roofer.postcode)}.json?country=GB&types=postcode&access_token=${mapboxgl.accessToken}`
                );
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();

                if (data.features && data.features[0]) {
                  const [lng, lat] = data.features[0].center;

                  // Create marker element
                  const markerEl = document.createElement('div');
                  markerEl.className = 'w-6 h-6 rounded-full bg-yellow-400 border-2 border-black cursor-pointer transition-all duration-200';
                  markerEl.style.width = '24px';
                  markerEl.style.height = '24px';
                  markerEl.style.backgroundColor = '#FBBF24';
                  markerEl.style.border = '2px solid black';
                  markerEl.style.borderRadius = '50%';
                  markerEl.style.cursor = 'pointer';
                  markerEl.style.transition = 'all 0.2s';

                  // Create inner element for hover effect
                  const innerEl = document.createElement('div');
                  innerEl.style.width = '100%';
                  innerEl.style.height = '100%';
                  innerEl.style.backgroundColor = '#FBBF24';
                  innerEl.style.borderRadius = '50%';
                  markerEl.appendChild(innerEl);

                  // Create and add marker
                  const marker = new mapboxgl.Marker({
                    element: markerEl,
                    anchor: 'center'
                  })
                    .setLngLat([lng, lat])
                    .addTo(mapInstance);

                  // Store marker reference
                  markersRef.current.push(marker);

                  // Extend bounds
                  bounds.extend([lng, lat]);

                  // Create popup
                  const popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: 15
                  })
                    .setHTML(`<div class="px-3 py-2 bg-blue-600 rounded shadow text-sm font-medium text-white">${roofer.businessName}</div>`);

                  // Add hover events
                  markerEl.addEventListener('mouseenter', () => {
                    innerEl.style.transform = 'scale(1.1)';
                    marker.setPopup(popup);
                    popup.addTo(mapInstance);
                  });
                  markerEl.addEventListener('mouseleave', () => {
                    innerEl.style.transform = 'scale(1)';
                    popup.remove();
                  });
                  
                  // Add click event to open roofer card
                  markerEl.addEventListener('click', () => {
                    // Scroll to search results first
                    const searchResults = document.getElementById('search-results');
                    if (searchResults) {
                      searchResults.scrollIntoView({ behavior: 'instant', block: 'start' });
                    }
                    // Then trigger the search
                    if (onRooferSelect) {
                      onRooferSelect(roofer);
                    }
                  });
                }
              } catch (error) {
                console.error(`Error adding marker for ${roofer.postcode}:`, error);
              }
            }

            // Fit map to bounds if we have any markers
            if (!bounds.isEmpty()) {
              mapInstance.fitBounds(bounds, { 
                padding: { top: 50, bottom: 50, left: 50, right: 50 },
                maxZoom: 5 // Lock the zoom level
              });
            }

            setIsLoading(false);
          } catch (error) {
            console.error('Error adding markers:', error);
            setIsLoading(false);
          }
        });

        mapInstance.on('error', (e) => {
          console.error('Map error:', e);
          setIsLoading(false);
        });

        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (map) {
        map.remove();
      }
    };
  }, [onRooferSelect]);

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
      <style jsx global>{`
        .mapboxgl-map {
          width: 100% !important;
          height: 100% !important;
        }
        .mapboxgl-canvas {
          width: 100% !important;
          height: 100% !important;
        }
        .mapboxgl-ctrl-bottom-right {
          opacity: 0.7;
        }
        .mapboxgl-ctrl-attrib {
          font-size: 10px !important;
          padding: 2px 4px !important;
          background: rgba(255, 255, 255, 0.7) !important;
          border-radius: 4px 0 0 0 !important;
        }
        .mapboxgl-ctrl-attrib a {
          color: #666 !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" style={{ position: 'relative' }} />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
} 