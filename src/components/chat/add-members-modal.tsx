
'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Filter,
  Search,
  X,
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { FilterModal } from './filter-modal';

interface AddMembersModalProps {
  setOpen: (open: boolean) => void;
}

const mockClinicians = [
  {
    name: 'Matt Done - SN',
    nearPatient: 'Dianna Scroggins',
    distance: 'Near: 5 Miles',
  },
  {
    name: 'Jhon tang - SN',
    nearPatient: 'Janice Singlton',
    distance: 'Near: 10 Miles',
  },
  {
    name: 'June Unabia - PT',
    nearPatient: 'Richard Rebecca',
    distance: 'Near: 15 Miles',
  },
  {
    name: 'Dianne Roberson - SN',
    nearPatient: 'Richard Rebecca',
    distance: 'Near: 15 Miles',
  },
];

export function AddMembersModal({ setOpen }: AddMembersModalProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <>
      <DialogContent className="sm:max-w-6xl p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 bg-primary text-primary-foreground flex-shrink-0">
          <DialogTitle className="text-center text-xl">Add Members</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 min-h-0">
          <div className="w-2/3 h-full">
            <Image
              src="https://picsum.photos/1200/800"
              alt="Map of working area"
              data-ai-hint="map"
              width={1200}
              height={800}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-1/3 bg-card flex flex-col">
            <div className="p-4 space-y-4 border-b">
               <Tabs defaultValue="clinicians">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="clinicians">Clinicians</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                      <TabsTrigger value="groups">Groups</TabsTrigger>
                  </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-9 pr-9" />
                <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                  <DialogTrigger asChild>
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                      <Filter />
                    </button>
                  </DialogTrigger>
                  <FilterModal setOpen={setIsFilterModalOpen} />
                </Dialog>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {mockClinicians.map((clinician, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                       <Avatar className="h-12 w-12 mb-1">
                         <AvatarFallback className="bg-primary text-primary-foreground">{clinician.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">{clinician.distance}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{clinician.name}</p>
                      <p className="text-sm text-muted-foreground">Near Patient: {clinician.nearPatient}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">Send Referral</Button>
                      <Button variant="outline" size="sm">Add</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
             <DialogFooter className="p-4 border-t mt-auto">
              <Button type="submit" onClick={() => setOpen(false)} className="w-full bg-primary hover:bg-primary/90">
                Admit
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </>
  );
}
