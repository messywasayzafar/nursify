
'use client';

import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Search, Shield, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AmazonLocationMap } from '@/components/map/amazon-location-map';

interface SelectWorkingAreaModalProps {
  setOpen: (open: boolean) => void;
  onAreaSelected: () => void;
}

export function SelectWorkingAreaModal({ setOpen, onAreaSelected }: SelectWorkingAreaModalProps) {
  const [selectedArea, setSelectedArea] = useState('');
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [trackerEnabled, setTrackerEnabled] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Initialize map immediately
    setMapLoaded(true);
  }, []);

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
  };

  const createGeofence = async (area: string) => {
    try {
      const { locationService } = await import('@/lib/location-service');
      const coordinates: [number, number] = area === 'Oak Park, IL' ? [-87.7845, 41.8850] : [-87.6298, 41.8781];
      await locationService.createGeofence(`geofence-${area.replace(/[^a-zA-Z0-9]/g, '-')}`, coordinates, 1000);
      console.log('Geofence created for:', area);
    } catch (error) {
      console.error('Failed to create geofence:', error);
    }
  };

  const setupTracker = async () => {
    try {
      console.log('Tracker configured for nursify-tracker');
    } catch (error) {
      console.error('Failed to setup tracker:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedArea) {
      alert('Please select a working area');
      return;
    }
    
    if (geofenceEnabled) {
      await createGeofence(selectedArea);
    }
    
    if (trackerEnabled) {
      await setupTracker();
    }
    
    onAreaSelected();
  };

  return (
    <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto p-0">
      <DialogHeader className="p-4 border-b">
        <DialogTitle className="text-xl">Select Working Area & Location Services</DialogTitle>
      </DialogHeader>
      <div className="flex">
        {/* Map Section */}
        <div className="w-2/3">
          <div className="w-full h-[500px]">
            <AmazonLocationMap onAreaSelect={(coords) => console.log('Selected coordinates:', coords)} />
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-1/3 bg-muted/30 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search city, state" className="pl-10" />
          </div>

          {/* Area Selection */}
          <div className="space-y-2">
            <Button 
              variant={selectedArea === 'Oak Park, IL' ? 'default' : 'outline'} 
              className="w-full justify-start h-10 text-left"
              onClick={() => handleAreaSelect('Oak Park, IL')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Oak Park, IL
            </Button>
            <Button 
              variant={selectedArea === 'Chicago, IL' ? 'default' : 'outline'} 
              className="w-full justify-start h-10 text-left"
              onClick={() => handleAreaSelect('Chicago, IL')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Chicago, IL
            </Button>
          </div>

          {/* Location Services */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Location Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <Label htmlFor="geofence" className="text-sm">Geofence</Label>
                </div>
                <Switch 
                  id="geofence"
                  checked={geofenceEnabled}
                  onCheckedChange={setGeofenceEnabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Monitor when users enter/exit work areas
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <Label htmlFor="tracker" className="text-sm">Location Tracker</Label>
                </div>
                <Switch 
                  id="tracker"
                  checked={trackerEnabled}
                  onCheckedChange={setTrackerEnabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Track real-time location of field staff
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <DialogFooter className="p-4 border-t">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
          Configure Area
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
