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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TransferDischargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (message: string) => void;
}

export function TransferDischargeModal({ open, onOpenChange, onSubmit }: TransferDischargeModalProps) {
  const [activeTab, setActiveTab] = useState('transfer');
  const [transferDate, setTransferDate] = useState<Date>();
  const [facilityName, setFacilityName] = useState('');
  const [reasonOfTransfer, setReasonOfTransfer] = useState('');
  const [physicianNotified, setPhysicianNotified] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    const data: any = {
      transferDate: transferDate ? format(transferDate, "MM/dd/yyyy") : 'N/A',
      facilityName: facilityName || 'N/A',
      reasonOfTransfer: reasonOfTransfer || 'N/A',
      physicianNotified: physicianNotified || 'N/A',
      notes: notes || 'N/A'
    };
    
    const templateData = {
      type: activeTab === 'transfer' ? 'TRANSFER_TEMPLATE' : 'TRANSFERDISCHARGE_TEMPLATE',
      data,
      status: activeTab === 'transfer' ? 'Hospitalized' : 'Discharge'
    };
    
    const message = JSON.stringify(templateData);
    
    if (onSubmit) {
      await onSubmit(message);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="bg-primary text-primary-foreground p-4 -m-6 mb-6">
          <DialogTitle className="text-center">Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="transfer-discharge">Transfer Discharge</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transfer" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Transfer Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !transferDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {transferDate ? format(transferDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={transferDate}
                        onSelect={setTransferDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Label>Transfer Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !transferDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {transferDate ? format(transferDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={transferDate}
                        onSelect={setTransferDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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