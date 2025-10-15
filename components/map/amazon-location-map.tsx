'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { fetchAuthSession } from 'aws-amplify/auth';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAuth } from '../auth/auth-provider';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';


interface AmazonLocationMapProps {
  onAreaSelect?: (coordinates: [number, number]) => void;
}

export function AmazonLocationMap({ onAreaSelect }: AmazonLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { user, loading } = useAuth();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || !user) return;

    const initializeMap = async () => {
      try {
        const session = await fetchAuthSession();
        const { credentials } = session;

        if (!credentials) {
          throw new Error('No credentials available');
        }

        // Use AWS SDK Location client with Cognito credentials
        const { LocationClient, GetMapStyleDescriptorCommand } = await import('@aws-sdk/client-location');
        
        const locationClient = new LocationClient({
          region: 'us-east-1',
          credentials,
        });

        try {
          // Get the style descriptor using AWS SDK
          const command = new GetMapStyleDescriptorCommand({
            MapName: 'nursify-map'
          });
          
          const response = await locationClient.send(command);
          const styleBlob = response.Blob;
          const styleJson = JSON.parse(new TextDecoder().decode(styleBlob));
          
          // Initialize map with the fetched style
          map.current = new maplibregl.Map({
            container: mapContainer.current!,
            style: styleJson,
            center: [-87.6298, 41.8781],
            zoom: 10,
          });
        } catch (error) {
          console.error('Failed to load AWS map style:', error);
          throw error;
        }

        // Handle authentication errors
        map.current.on('error', (e) => {
          console.error('Map error:', e);
          if (e.error?.status === 403) {
            setMapError('Authentication failed. Please refresh the page.');
          }
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Click to add marker
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          onAreaSelect?.([lng, lat]);
          new maplibregl.Marker().setLngLat([lng, lat]).addTo(map.current!);
        });

        // Example markers
        new maplibregl.Marker({ color: 'red' })
          .setLngLat([-87.7845, 41.885])
          .setPopup(new maplibregl.Popup().setHTML('<h3>Oak Park, IL</h3>'))
          .addTo(map.current);

        new maplibregl.Marker({ color: 'blue' })
          .setLngLat([-87.6298, 41.8781])
          .setPopup(new maplibregl.Popup().setHTML('<h3>Chicago, IL</h3>'))
          .addTo(map.current);


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
  }, [onAreaSelect, user]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p>Loading map...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
        <MapPin className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-600">Please log in to view the map</p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
        <MapPin className="h-12 w-12 text-red-400 mb-2" />
        <p className="text-red-600">{mapError}</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}
