import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import rooferData from '@/data/roofers.json';
import { Roofer, RooferData } from '@/types/roofers';

interface MapProps {
  className?: string;
  onRooferSelect?: (roofer: Roofer) => void;
}

// Set your Mapbox token from environment variable
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.');
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RoofersMap({ className = '', onRooferSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const typedRooferData = rooferData as RooferData;

  useEffect(() => {
    if (!mapboxgl.supported()) {
      console.error('Your browser does not support Mapbox GL');
      setIsLoading(false);
      return;
    }

    let handleResize: (() => void) | null = null;
    // Store markers in a variable that can be used in cleanup
    const currentMarkers: mapboxgl.Marker[] = [];

    const initializeMap = async () => {
      try {
        if (!mapRef.current) return;

        const mapInstance = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-3, 54.5],
          zoom: window.innerWidth < 768 ? 4.2 : 5,
          maxZoom: 7,
          minZoom: window.innerWidth < 768 ? 4 : 4.5
        });

        // Disable map rotation and pitch
        mapInstance.dragRotate.disable();
        mapInstance.touchZoomRotate.disableRotation();
        mapInstance.setPitch(0);

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl({
          showCompass: false
        }), 'top-right');

        // Add resize handler to adjust zoom on window resize
        handleResize = () => {
          if (mapInstance) {
            const isMobile = window.innerWidth < 768;
            mapInstance.setZoom(isMobile ? 4.2 : 5);
            mapInstance.setMinZoom(isMobile ? 4 : 4.5);
          }
        };
        window.addEventListener('resize', handleResize);

        // Wait for map to load
        mapInstance.on('load', async () => {
          try {
            // Add markers for existing roofers
            for (const roofer of typedRooferData.roofers) {
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

                  // Create marker element for roofer
                  const markerEl = document.createElement('div');
                  markerEl.className = 'w-6 h-6 rounded-full bg-yellow-400 border-2 border-black cursor-pointer transition-all duration-200';
                  markerEl.style.width = '24px';
                  markerEl.style.height = '24px';
                  markerEl.style.backgroundColor = '#FBBF24';
                  markerEl.style.border = '2px solid black';
                  markerEl.style.borderRadius = '50%';
                  markerEl.style.cursor = 'pointer';
                  markerEl.style.transition = 'all 0.2s';
                  markerEl.style.boxShadow = '0 0 0 8px rgba(251, 191, 36, 0.2), 0 0 0 16px rgba(251, 191, 36, 0.1)';

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

                  // Store marker reference in both refs and local array
                  markersRef.current.push(marker);
                  currentMarkers.push(marker);

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
                    markerEl.style.boxShadow = '0 0 0 12px rgba(251, 191, 36, 0.2), 0 0 0 24px rgba(251, 191, 36, 0.1)';
                    marker.setPopup(popup);
                    popup.addTo(mapInstance);
                  });
                  markerEl.addEventListener('mouseleave', () => {
                    innerEl.style.transform = 'scale(1)';
                    markerEl.style.boxShadow = '0 0 0 8px rgba(251, 191, 36, 0.2), 0 0 0 16px rgba(251, 191, 36, 0.1)';
                    popup.remove();
                  });
                  
                  // Add click event to open roofer card
                  markerEl.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    if (onRooferSelect) {
                      onRooferSelect(roofer);
                    }
                  });
                }
              } catch (error) {
                console.error(`Error adding marker for ${roofer.postcode}:`, error);
              }
            }

            // Add markers for coming soon locations
            if (typedRooferData.comingSoonLocations) {
              for (const location of typedRooferData.comingSoonLocations) {
                try {
                  const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location.postcode)}.json?country=GB&types=postcode&access_token=${mapboxgl.accessToken}`
                  );
                  
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  const data = await response.json();

                  if (data.features && data.features[0]) {
                    const [lng, lat] = data.features[0].center;

                    // Create marker element for coming soon location
                    const markerEl = document.createElement('div');
                    markerEl.className = 'w-6 h-6 rounded-full bg-red-500 border-2 border-white cursor-pointer transition-all duration-200';
                    markerEl.style.width = '24px';
                    markerEl.style.height = '24px';
                    markerEl.style.backgroundColor = '#EF4444';
                    markerEl.style.border = '2px solid white';
                    markerEl.style.borderRadius = '50%';
                    markerEl.style.cursor = 'pointer';
                    markerEl.style.transition = 'all 0.2s';
                    markerEl.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.3)';

                    // Create inner element for hover effect
                    const innerEl = document.createElement('div');
                    innerEl.style.width = '100%';
                    innerEl.style.height = '100%';
                    innerEl.style.backgroundColor = '#EF4444';
                    innerEl.style.borderRadius = '50%';
                    markerEl.appendChild(innerEl);

                    // Create and add marker
                    const marker = new mapboxgl.Marker({
                      element: markerEl,
                      anchor: 'center'
                    })
                      .setLngLat([lng, lat])
                      .addTo(mapInstance);

                    // Store marker reference in both refs and local array
                    markersRef.current.push(marker);
                    currentMarkers.push(marker);

                    // Create popup
                    const popup = new mapboxgl.Popup({
                      closeButton: false,
                      closeOnClick: false,
                      offset: 15
                    })
                      .setHTML(`<div class="px-3 py-2 bg-red-500 rounded shadow text-sm font-medium text-white">Coming Soon: ${location.city}</div>`);

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
                  }
                } catch (error) {
                  console.error(`Error adding coming soon marker for ${location.postcode}:`, error);
                }
              }
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
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      // Clean up markers using the local array
      currentMarkers.forEach(marker => marker.remove());
    };
  }, [onRooferSelect, typedRooferData.roofers, typedRooferData.comingSoonLocations]);

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