import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { fetchAuthSession } from 'aws-amplify/auth';
import 'maplibre-gl/dist/maplibre-gl.css';

interface AmazonGeofenceMapProps {
  onGeofenceCreate?: (geofence: { center: [number, number], radius: number, id: string }) => void;
  searchLocation?: string;
}

interface Geofence {
  center: [number, number];
  radius: number;
  id: string;
}

export const AmazonGeofenceMap: React.FC<AmazonGeofenceMapProps> = ({ onGeofenceCreate, searchLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {

        // Initialize map with OpenStreetMap (fallback)
        map.current = new maplibregl.Map({
          container: mapContainer.current!,
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

        // Click handler for geofence creation
        map.current.on('click', async (e) => {
          const { lng, lat } = e.lngLat;
          
          const geofenceId = `geofence-${Date.now()}`;
          const radius = 1000; // 1km radius
          const newGeofence: Geofence = {
            center: [lng, lat],
            radius,
            id: geofenceId
          };
          
          setGeofences(prev => [...prev, newGeofence]);
          onGeofenceCreate?.(newGeofence);
          
          // Add to Amazon Location Service
          await createAmazonGeofence(newGeofence);
          
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
          coords.push(coords[0]);

          return {
            type: 'Polygon',
            coordinates: [coords]
          };
        };

        // Function to create geofence in Amazon Location Service
        const createAmazonGeofence = async (geofence: Geofence) => {
          try {
            const response = await fetch('/api/geofence', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                geofenceId: geofence.id,
                center: geofence.center,
                radius: geofence.radius
              })
            });
            
            if (!response.ok) {
              console.error('Failed to create geofence in AWS');
            }
          } catch (error) {
            console.error('Error creating geofence:', error);
          }
        };

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onGeofenceCreate]);

  // Search and navigate to location
  useEffect(() => {
    const searchAndNavigate = async () => {
      if (!searchLocation || searchLocation.length < 3 || !map.current) return;

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