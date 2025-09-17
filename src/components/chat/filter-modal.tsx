
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface FilterModalProps {
  setOpen: (open: boolean) => void;
}

export function FilterModal({ setOpen }: FilterModalProps) {
  const [patientStatusOpen, setPatientStatusOpen] = useState(true);
  const [serviceStatusOpen, setServiceStatusOpen] = useState(true);
  const [chatFilterOpen, setChatFilterOpen] = useState(true);

  return (
    <DialogContent className="sm:max-w-md p-0">
      <DialogHeader className="p-4 bg-primary text-primary-foreground">
        <DialogTitle className="text-center text-lg">Messages Filter</DialogTitle>
      </DialogHeader>
      
      <div className="p-4 space-y-4">

        {/* Filter by service status */}
        <Collapsible open={serviceStatusOpen} onOpenChange={setServiceStatusOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left font-medium">
            Filter by service status
            <ChevronDown className={`h-4 w-4 transition-transform ${serviceStatusOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 p-2">
            <RadioGroup>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sn" id="sn" />
                  <Label htmlFor="sn" className="text-sm">SN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pt" id="pt" />
                  <Label htmlFor="pt" className="text-sm">PT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ot" id="ot" />
                  <Label htmlFor="ot" className="text-sm">OT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slp" id="slp" />
                  <Label htmlFor="slp" className="text-sm">SLP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="msw" id="msw" />
                  <Label htmlFor="msw" className="text-sm">MSW</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hha" id="hha" />
                  <Label htmlFor="hha" className="text-sm">HHA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rd" id="rd" />
                  <Label htmlFor="rd" className="text-sm">RD</Label>
                </div>
              </div>
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        <hr />

        {/* Filter chats by */}
        <Collapsible open={chatFilterOpen} onOpenChange={setChatFilterOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left font-medium">
            Filter chats by
            <ChevronDown className={`h-4 w-4 transition-transform ${chatFilterOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 p-2">
            <RadioGroup>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="date" className="text-cyan-500" />
                  <Label htmlFor="date" className="text-sm">Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unread" id="unread" />
                  <Label htmlFor="unread" className="text-sm">Unread Messages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="referrals" id="referrals" />
                  <Label htmlFor="referrals" className="text-sm">Pending Referrals</Label>
                </div>
              </div>
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <DialogFooter className="p-4 border-t bg-muted/40 flex justify-between">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Reset
        </Button>
        <Button onClick={() => setOpen(false)}>
          Apply
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
