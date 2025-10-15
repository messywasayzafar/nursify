'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

// Dynamic import to handle potential build issues
let maplibregl: any = null;

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const loadMapLibre = async () => {
  if (typeof window !== 'undefined') {
    try {
      const maplibre = await import('maplibre-gl');
      maplibregl = maplibre.default;
      // CSS will be loaded by the component when needed
    } catch (error) {
      console.warn('MapLibre GL could not be loaded:', error);
    }
  }
};

interface Clinician {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  location?: string;
  status: 'available' | 'busy' | 'offline';
  coordinates?: { lat: number; lng: number };
}

interface PatientCliniciansMapProps {
  patientAddress: string;
  patientCoordinates?: { lat: number; lng: number };
  clinicians: Clinician[];
  onClinicianClick?: (clinician: Clinician) => void;
  selectedClinicianId?: string;
}

export const PatientCliniciansMap: React.FC<PatientCliniciansMapProps> = ({
  patientAddress,
  patientCoordinates,
  clinicians,
  onClinicianClick,
  selectedClinicianId
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const patientMarker = useRef<any>(null);
  const clinicianMarkers = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [maplibreglLoaded, setMaplibreglLoaded] = useState(false);

  // Default coordinates (Chicago) if patient coordinates not provided
  const defaultCoordinates = { lat: 41.8781, lng: -87.6298 };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        await loadMapLibre();
        
        if (!maplibregl) {
          setMapError(true);
          return;
        }

        setMaplibreglLoaded(true);

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
          center: patientCoordinates ? [patientCoordinates.lng, patientCoordinates.lat] : [defaultCoordinates.lng, defaultCoordinates.lat],
          zoom: 12,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          setMapLoaded(true);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add patient marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !maplibreglLoaded || !maplibregl) return;

    // Remove existing patient marker
    if (patientMarker.current) {
      patientMarker.current.remove();
    }

    const coords = patientCoordinates || defaultCoordinates;
  console.log('🗺️ PatientCliniciansMap using coordinates:', coords);
  console.log('🗺️ PatientCliniciansMap patient address:', patientAddress);
    
    // Create patient marker with red circle
    const patientEl = document.createElement('div');
    patientEl.innerHTML = '<div style="width: 40px; height: 40px; background: red; border: 4px solid white; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">P</div>';

    patientMarker.current = new maplibregl.Marker({ element: patientEl })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current);

    // Add popup for patient
    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-red-600">Patient Location</h3>
          <p class="text-sm">${patientAddress}</p>
        </div>
      `);
    
    patientMarker.current.setPopup(popup);
  }, [mapLoaded, patientCoordinates, patientAddress, maplibreglLoaded]);

  // Add clinician markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !maplibreglLoaded || !maplibregl) return;

    console.log('🗺️ Adding clinician markers:', clinicians.length);
    console.log('🗺️ Clinicians with coords:', clinicians.filter(c => c.coordinates).length);

    // Clear existing clinician markers
    clinicianMarkers.current.forEach(marker => marker.remove());
    clinicianMarkers.current = [];

    clinicians.forEach((clinician, index) => {
      if (!clinician.coordinates) {
        console.log('⚠️ Clinician without coordinates:', clinician.name);
        return;
      }
      console.log('✅ Adding marker for:', clinician.name, clinician.coordinates);

      const isSelected = selectedClinicianId === clinician.id;
      
      // Create clinician marker
      const clinicianEl = document.createElement('div');
      clinicianEl.className = 'clinician-marker';
      clinicianEl.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${isSelected ? '#2563eb' : '#10b981'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 999;
      `;
      clinicianEl.innerHTML = clinician.name.charAt(0).toUpperCase();

      const marker = new maplibregl.Marker({ element: clinicianEl })
        .setLngLat([clinician.coordinates.lng, clinician.coordinates.lat])
        .addTo(map.current);

      // Calculate distance from patient
      const patientCoords = patientCoordinates || defaultCoordinates;
      const distance = calculateDistance(
        patientCoords.lat, patientCoords.lng,
        clinician.coordinates.lat, clinician.coordinates.lng
      );

      // Add popup for clinician
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-green-600">${clinician.name}</h3>
            <p class="text-sm text-gray-600">${clinician.role}</p>
            ${clinician.location && clinician.location !== 'Not specified' ? `<p class="text-xs text-gray-500 mt-1">${clinician.location}</p>` : ''}
            <p class="text-xs font-semibold text-blue-600 mt-1">${distance.toFixed(1)} km from patient</p>
            <div class="flex items-center gap-1 mt-1">
              <div class="w-2 h-2 rounded-full ${clinician.status === 'available' ? 'bg-green-500' : clinician.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'}"></div>
              <span class="text-xs text-gray-500 capitalize">${clinician.status}</span>
            </div>
          </div>
        `);
      
      marker.setPopup(popup);

      // Add click handler
      if (onClinicianClick) {
        clinicianEl.addEventListener('click', () => {
          onClinicianClick(clinician);
        });
      }

      clinicianMarkers.current.push(marker);
    });
  }, [mapLoaded, clinicians, selectedClinicianId, onClinicianClick, maplibreglLoaded]);

  // Fit map to show all markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !maplibregl || clinicians.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    
    // Add patient coordinates
    const patientCoords = patientCoordinates || defaultCoordinates;
    bounds.extend([patientCoords.lng, patientCoords.lat]);

    // Add clinician coordinates
    clinicians.forEach(clinician => {
      if (clinician.coordinates) {
        bounds.extend([clinician.coordinates.lng, clinician.coordinates.lat]);
      }
    });

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [mapLoaded, clinicians, patientCoordinates, maplibreglLoaded]);

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-gray-500 mb-4">
            Unable to load the interactive map. Please use the member list to select clinicians.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Patient: {patientAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{clinicians.length} Clinicians Available</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapContainer} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      />
    </div>
  );
};
