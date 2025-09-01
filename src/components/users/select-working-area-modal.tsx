
'use client';

import React from 'react';
import Image from 'next/image';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, X } from 'lucide-react';

interface SelectWorkingAreaModalProps {
  setOpen: (open: boolean) => void;
  onAreaSelected: () => void;
}

export function SelectWorkingAreaModal({ setOpen, onAreaSelected }: SelectWorkingAreaModalProps) {
  const handleSubmit = () => {
    // a real app would do form validation and API calls here
    onAreaSelected();
  }
  return (
    <DialogContent className="sm:max-w-6xl p-0">
      <DialogHeader className="p-4 border-b">
        <DialogTitle className="text-xl">Select Working Area</DialogTitle>
         <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
      </DialogClose>
      </DialogHeader>
      <div className="flex">
        <div className="w-2/3">
          <Image
            src="https://picsum.photos/1200/800"
            alt="Map of working area"
            data-ai-hint="map"
            width={1200}
            height={800}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-1/3 bg-muted/30 p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search city, state" className="pl-10" />
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start h-12 text-left bg-background">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Oak Park, IL
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-left bg-background">
               <MapPin className="mr-2 h-5 w-5 text-primary" />
              Chicago, IL
            </Button>
          </div>
        </div>
      </div>
       <DialogFooter className="p-4 border-t">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
          Select Area
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
