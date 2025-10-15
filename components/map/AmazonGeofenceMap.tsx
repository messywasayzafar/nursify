import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LocationClient, GetMapStyleDescriptorCommand } from '@aws-sdk/client-location';

interface AmazonGeofenceMapProps {
  onGeofenceCreate?: (geofence: { center: [number, number], radius: number, id: string }) => void;
  searchLocation?: string;
  onLocationInfo?: (info: { name: string; area: number }) => void;
}

interface Geofence {
  center: [number, number];
  radius: number;
  id: string;
  coordinates?: [number, number][];
  type: 'circle' | 'polygon';
}

export const AmazonGeofenceMap: React.FC<AmazonGeofenceMapProps> = ({ onGeofenceCreate, searchLocation, onLocationInfo }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(true);
  const [locationName, setLocationName] = useState<string>('');
  const [areaKm, setAreaKm] = useState<number>(0);
  const drawingPointsRef = useRef<[number, number][]>([]);
  const isDrawingRef = useRef(true);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        if (!mapContainer.current) return;

        // Use OpenStreetMap for geofencing (simpler, no auth needed)
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
          center: [-87.6298, 41.8781],
          zoom: 10,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add geofence source and layers
        map.current.on('load', () => {
          const m = map.current!;

          if (!m.getSource('geofences')) {
            m.addSource('geofences', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              }
            });
          }

          if (!m.getLayer('geofence-fill')) {
            m.addLayer({
              id: 'geofence-fill',
              type: 'fill',
              source: 'geofences',
              paint: {
                'fill-color': '#007cbf',
                'fill-opacity': 0.2
              }
            });
          }

          if (!m.getLayer('geofence-border')) {
            m.addLayer({
              id: 'geofence-border',
              type: 'line',
              source: 'geofences',
              paint: {
                'line-color': '#007cbf',
                'line-width': 2
              }
            });
          }
          
          // Add drawing line source
          if (!m.getSource('drawing-line')) {
            m.addSource('drawing-line', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: []
                }
              }
            });
            
            m.addLayer({
              id: 'drawing-line',
              type: 'line',
              source: 'drawing-line',
              paint: {
                'line-color': '#007cbf',
                'line-width': 3,
                'line-dasharray': [2, 2]
              }
            });
          }
          
          // Click handler for drawing polygon geofence - inside load event
          m.on('click', async (e) => {
            console.log('Map clicked, isDrawing:', isDrawingRef.current);
            if (!isDrawingRef.current) return;
            
            const { lng, lat } = e.lngLat;
            const newPoints = [...drawingPointsRef.current, [lng, lat] as [number, number]];
            drawingPointsRef.current = newPoints;
            
            // Add marker for each point
            new maplibregl.Marker({ color: '#007cbf' })
              .setLngLat([lng, lat])
              .addTo(m);
            
            // Draw line between points
            const lineSource = m.getSource('drawing-line') as maplibregl.GeoJSONSource;
            if (lineSource) {
              lineSource.setData({
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: newPoints
                }
              });
            }
            
            // Get location name for first point
            if (newPoints.length === 1) {
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                );
                const data = await response.json();
                const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setLocationName(name);
                onLocationInfo?.({ name, area: 0 });
              } catch (error) {
                const name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setLocationName(name);
                onLocationInfo?.({ name, area: 0 });
              }
            }
            
            // Calculate area if we have at least 3 points
            if (newPoints.length >= 3) {
              const area = calculatePolygonArea(newPoints);
              setAreaKm(area);
              onLocationInfo?.({ name: locationName, area });
            }
            
            console.log('Point added:', newPoints.length);
          });
        });

        // Function to add geofence to map
        const addGeofenceToMap = (geofence: Geofence) => {
          const geometry = geofence.type === 'polygon' && geofence.coordinates
            ? {
                type: 'Polygon',
                coordinates: [geofence.coordinates]
              }
            : createCircle(geofence.center, geofence.radius);
          
          const source = map.current!.getSource('geofences') as maplibregl.GeoJSONSource;
          
          if (source) {
            const currentData = source._data as any;
            currentData.features.push({
              type: 'Feature',
              properties: { id: geofence.id },
              geometry
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
            // Import dynamically to avoid SSR issues
            const { geofenceService } = await import('@/lib/geofence-service');
            
            await geofenceService.createGeofence({
              id: geofence.id,
              center: geofence.center,
              radius: geofence.radius,
              name: `Geofence ${new Date().toLocaleString()}`,
              type: 'custom'
            });
            
            console.log('Geofence created successfully:', geofence.id);
          } catch (error) {
            console.error('Error creating geofence:', error);
          }
        };
        
        // Map is now using the custom fetch that handles signing

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
    };
  }, [onGeofenceCreate]);

  // Search and navigate to location
  useEffect(() => {
    const searchAndNavigate = async () => {
      if (!searchLocation || searchLocation.length < 3 || !map.current) return;

      try {
        if (searchLocation.includes('|')) {
          const [, coords] = searchLocation.split('|');
          const [lat, lon] = coords.split(',');
          map.current.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: 14,
            duration: 1000
          });
          return;
        }

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

  const startDrawing = () => {
    setIsDrawing(true);
    isDrawingRef.current = true;
    drawingPointsRef.current = [];
    setLocationName('');
    setAreaKm(0);
    console.log('Drawing started');
  };
  
  const finishDrawing = () => {
    if (drawingPointsRef.current.length < 3) {
      alert('Need at least 3 points to create a geofence');
      return;
    }
    
    // Close the polygon
    const closedPoints = [...drawingPointsRef.current, drawingPointsRef.current[0]];
    
    const geofenceId = `geofence-${Date.now()}`;
    const center = calculateCenter(drawingPointsRef.current);
    
    const newGeofence: Geofence = {
      center,
      radius: 0,
      id: geofenceId,
      coordinates: closedPoints,
      type: 'polygon'
    };
    
    setGeofences(prev => [...prev, newGeofence]);
    onGeofenceCreate?.({ center, radius: 0, id: geofenceId });
    
    // Add to map
    setTimeout(() => {
      const source = map.current?.getSource('geofences') as maplibregl.GeoJSONSource;
      if (source) {
        const currentData = source._data as any;
        currentData.features.push({
          type: 'Feature',
          properties: { id: geofenceId },
          geometry: {
            type: 'Polygon',
            coordinates: [closedPoints]
          }
        });
        source.setData(currentData);
      }
    }, 100);
    
    // Clear drawing
    setIsDrawing(false);
    isDrawingRef.current = false;
    drawingPointsRef.current = [];
    setLocationName('');
    setAreaKm(0);
    setTimeout(() => {
      const lineSource = map.current?.getSource('drawing-line') as maplibregl.GeoJSONSource;
      if (lineSource) {
        lineSource.setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] }
        });
      }
    }, 100);
  };
  
  const cancelDrawing = () => {
    setIsDrawing(false);
    isDrawingRef.current = false;
    drawingPointsRef.current = [];
    setLocationName('');
    setAreaKm(0);
    const lineSource = map.current?.getSource('drawing-line') as maplibregl.GeoJSONSource;
    if (lineSource) {
      lineSource.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] }
      });
    }
  };
  
  const calculateCenter = (points: [number, number][]): [number, number] => {
    const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [sum[0] / points.length, sum[1] / points.length];
  };
  
  const calculatePolygonArea = (points: [number, number][]): number => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    area = Math.abs(area) / 2;
    
    // Convert to km² (approximate)
    const kmPerDegree = 111.32;
    return area * kmPerDegree * kmPerDegree;
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        {locationName && (
          <div style={{ fontSize: '12px', color: '#666', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <div><strong>Location:</strong> {locationName}</div>
            {areaKm > 0 && <div><strong>Area:</strong> {areaKm.toFixed(2)} km²</div>}
          </div>
        )}
      </div>
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