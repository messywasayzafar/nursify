'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { fetchAuthSession } from 'aws-amplify/auth';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAuth } from '../auth/auth-provider';
import { LocationClient, GetMapStyleDescriptorCommand } from '@aws-sdk/client-location';

interface RefreshCredentialsMapProps {
  onAreaSelect?: (coordinates: [number, number]) => void;
  onLocationInfo?: (info: { name: string; area: number }) => void;
}

export function RefreshCredentialsMap({ onAreaSelect }: RefreshCredentialsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { user, loading } = useAuth();
  const [mapError, setMapError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current || !user || isInitializing) return;

    const initializeMap = async () => {
      setIsInitializing(true);
      try {
        // Force fresh credentials
        const session = await fetchAuthSession({ forceRefresh: true });
        console.log('Session:', session);
        const credentials = session.credentials;

        if (!credentials) {
          console.error('No credentials in session');
          throw new Error('No credentials available. Please log out and log back in.');
        }

        console.log('Using credentials:', {
          accessKeyId: credentials.accessKeyId?.substring(0, 10) + '...',
          hasSessionToken: !!credentials.sessionToken
        });

        // Use AWS SDK to fetch the style descriptor
        const locationClient = new LocationClient({
          region: 'us-east-1',
          credentials,
        });

        const command = new GetMapStyleDescriptorCommand({
          MapName: 'nursify-map'
        });

        const response = await locationClient.send(command);
        const styleBlob = response.Blob;
        const styleJson = JSON.parse(new TextDecoder().decode(styleBlob));

        if (!mapContainer.current) return;

        // Initialize map
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleJson,
          center: [-87.6298, 41.8781],
          zoom: 10,
        });

        map.current.on('load', () => {
          if (!map.current) return;
          
          map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

          map.current.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            onAreaSelect?.([lng, lat]);
            new maplibregl.Marker().setLngLat([lng, lat]).addTo(map.current!);
          });

          new maplibregl.Marker({ color: 'red' })
            .setLngLat([-87.7845, 41.885])
            .setPopup(new maplibregl.Popup().setHTML('<h3>Oak Park, IL</h3>'))
            .addTo(map.current);

          new maplibregl.Marker({ color: 'blue' })
            .setLngLat([-87.6298, 41.8781])
            .setPopup(new maplibregl.Popup().setHTML('<h3>Chicago, IL</h3>'))
            .addTo(map.current);
        });

      } catch (error: any) {
        console.error('Failed to initialize AWS map:', error);
        if (error.name === 'InvalidIdentityPoolConfigurationException') {
          setMapError('Please log out and log back in to refresh credentials');
        } else {
          setMapError(error.message || 'Failed to load map');
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onAreaSelect, user, isInitializing]);

  if (loading || isInitializing) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p>Loading AWS map...</p>
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