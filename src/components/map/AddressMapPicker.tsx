import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface AddressMapPickerProps {
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  onGeofenceCreate?: (geofence: { center: [number, number], radius: number }) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

interface Geofence {
  center: [number, number];
  radius: number;
  id: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({ 
  onAddressSelect, 
  onGeofenceCreate, 
  searchValue = '', 
  onSearchChange 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [marker, setMarker] = useState<maplibregl.Marker | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  // Search function
  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const results = await response.json();
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Navigate to location
  const navigateToLocation = (lat: number, lng: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000
      });
      
      // Remove existing marker
      if (marker) {
        marker.remove();
      }
      
      // Add new marker
      const newMarker = new maplibregl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      setMarker(newMarker);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with OpenStreetMap tiles (no AWS credentials needed)
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
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [-74.5, 40],
      zoom: 10
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add geofence source and layer
    map.current.on('load', () => {
      map.current!.addSource('geofences', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current!.addLayer({
        id: 'geofence-fill',
        type: 'fill',
        source: 'geofences',
        paint: {
          'fill-color': '#007cbf',
          'fill-opacity': 0.2
        }
      });

      map.current!.addLayer({
        id: 'geofence-border',
        type: 'line',
        source: 'geofences',
        paint: {
          'line-color': '#007cbf',
          'line-width': 2
        }
      });
    });

    // Add click handler for geofence creation
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Create geofence
      const geofenceId = `geofence-${Date.now()}`;
      const radius = 1000; // 1km radius
      const newGeofence: Geofence = {
        center: [lng, lat],
        radius,
        id: geofenceId
      };
      
      setGeofences(prev => [...prev, newGeofence]);
      onGeofenceCreate?.(newGeofence);
      
      // Add geofence to map
      addGeofenceToMap(newGeofence);
    });

    // Function to add geofence to map
    const addGeofenceToMap = (geofence: Geofence) => {
      const circle = createCircle(geofence.center, geofence.radius);
      const source = map.current!.getSource('geofences') as maplibregl.GeoJSONSource;
      
      if (source) {
        const currentData = source._data as any;
        currentData.features.push({
          type: 'Feature',
          properties: { id: geofence.id },
          geometry: circle
        });
        source.setData(currentData);
      }
    };

    // Function to create circle geometry
    const createCircle = (center: [number, number], radiusInMeters: number) => {
      const points = 64;
      const coords = [];
      const distanceX = radiusInMeters / (111320 * Math.cos(center[1] * Math.PI / 180));
      const distanceY = radiusInMeters / 110540;

      for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([center[0] + x, center[1] + y]);
      }
      coords.push(coords[0]); // Close the polygon

      return {
        type: 'Polygon',
        coordinates: [coords]
      };
    };



    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onGeofenceCreate]);



  return (
    <div>

      <div 
        ref={mapContainer} 
        style={{ height: '200px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      {geofences.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Geofences created: {geofences.length}
        </div>
      )}
    </div>
  );
};