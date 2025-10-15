import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface SimpleAddressMapProps {
  onLocationSelect?: (coordinates: { lat: number; lng: number }) => void;
  searchLocation?: string;
  initialCoordinates?: { lat: number; lng: number };
}

export const SimpleAddressMap: React.FC<SimpleAddressMapProps> = ({ 
  onLocationSelect, 
  searchLocation,
  initialCoordinates
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Handle initial coordinates changes
  useEffect(() => {
    if (map.current && initialCoordinates) {
      console.log('📍 Updating map with initial coordinates:', initialCoordinates);
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }
      
      // Add new marker at initial coordinates
      marker.current = new maplibregl.Marker({ color: '#007cbf' })
        .setLngLat([initialCoordinates.lng, initialCoordinates.lat])
        .addTo(map.current);
      
      // Center map on initial coordinates
      map.current.setCenter([initialCoordinates.lng, initialCoordinates.lat]);
      map.current.setZoom(12);
    }
  }, [initialCoordinates]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        if (!mapContainer.current) return;

        // Use OpenStreetMap for simple pin placement
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [{
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }]
          },
          center: initialCoordinates ? [initialCoordinates.lng, initialCoordinates.lat] : [-87.6298, 41.8781],
          zoom: initialCoordinates ? 12 : 10,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add click handler for pin placement
        map.current.on('click', async (e) => {
          const { lng, lat } = e.lngLat;
          
          // Remove existing marker
          if (marker.current) {
            marker.current.remove();
          }
          
          // Add new marker
          marker.current = new maplibregl.Marker({ color: '#007cbf' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          // Call the callback with coordinates
          onLocationSelect?.({ lat, lng });
        });

        // Initial pin placement is handled in the separate useEffect above

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError('Failed to load map');
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, []); // Empty dependency array to prevent reinitialization

  // Search and navigate to location
  useEffect(() => {
    const searchAndNavigate = async () => {
      if (!searchLocation || searchLocation.length < 3 || !map.current) return;
      
      // Add a small delay to prevent too many API calls
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1`
        );
        const results = await response.json();
        
        if (results.length > 0) {
          const { lat, lon } = results[0];
          map.current.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: 14,
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const timeoutId = setTimeout(searchAndNavigate, 500);
    return () => clearTimeout(timeoutId);
  }, [searchLocation]);

  if (mapError) {
    return (
      <div 
        style={{ 
          height: '200px', 
          width: '100%', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666'
        }}
      >
        {mapError}
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ height: '200px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
    />
  );
};

