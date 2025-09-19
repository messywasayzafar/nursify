'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X } from 'lucide-react';

interface TransferDischargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferDischargeModal({ open, onOpenChange }: TransferDischargeModalProps) {
  const [transferDate, setTransferDate] = useState('09/12/2025');
  const [facilityName, setFacilityName] = useState('');
  const [reasonOfTransfer, setReasonOfTransfer] = useState('');
  const [physicianNotified, setPhysicianNotified] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="bg-primary text-primary-foreground p-4 -m-6 mb-6">
          <DialogTitle className="text-center">Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="transfer-discharge">Transfer Discharge</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transfer" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-date">Transfer Date</Label>
                  <Input
                    id="transfer-date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility-name">Facility Name</Label>
                  <Input
                    id="facility-name"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason-transfer">Reason Of Transfer</Label>
                <Input
                  id="reason-transfer"
                  value={reasonOfTransfer}
                  onChange={(e) => setReasonOfTransfer(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Physician Notified</Label>
                <div className="flex items-center space-x-6">
                  <Button 
                    type="button" 
                    variant={physicianNotified === 'yes' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPhysicianNotified('yes')}
                  >
                    Yes
                  </Button>
                  <Button 
                    type="button" 
                    variant={physicianNotified === 'no' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPhysicianNotified('no')}
                  >
                    No
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transfer-discharge" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-date-2">Transfer Date</Label>
                  <Input
                    id="transfer-date-2"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility-name-2">Facility Name</Label>
                  <Input
                    id="facility-name-2"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason-transfer-2">Reason Of Transfer</Label>
                <Input
                  id="reason-transfer-2"
                  value={reasonOfTransfer}
                  onChange={(e) => setReasonOfTransfer(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Physician Notified</Label>
                <div className="flex items-center space-x-6">
                  <Button 
                    type="button" 
                    variant={physicianNotified === 'yes' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPhysicianNotified('yes')}
                  >
                    Yes
                  </Button>
                  <Button 
                    type="button" 
                    variant={physicianNotified === 'no' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPhysicianNotified('no')}
                  >
                    No
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}