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

interface RevisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevisitModal({ open, onOpenChange }: RevisitModalProps) {
  const [missedVisitDate, setMissedVisitDate] = useState('09/12/2025');
  const [reason, setReason] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('09/12/2025');
  const [timeIn, setTimeIn] = useState('07:00 AM');
  const [timeOut, setTimeOut] = useState('08:00 AM');
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
          <Tabs defaultValue="re-visit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="re-visit">Re-Visit</TabsTrigger>
              <TabsTrigger value="missed-visit">Missed Visit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="re-visit" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit-date">Visit Date</Label>
                  <Input
                    id="visit-date"
                    value={missedVisitDate}
                    onChange={(e) => setMissedVisitDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-in-1">Time In</Label>
                  <Input
                    id="time-in-1"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-out-1">Time Out</Label>
                  <Input
                    id="time-out-1"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next-visit-date">Next Visit Date</Label>
                  <Input
                    id="next-visit-date"
                    value={nextVisitDate}
                    onChange={(e) => setNextVisitDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-in-2">Time In</Label>
                  <Input
                    id="time-in-2"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-out-2">Time Out</Label>
                  <Input
                    id="time-out-2"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="missed-visit" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="missed-visit-date-2">Missed Visit Date</Label>
                  <Input
                    id="missed-visit-date-2"
                    value={missedVisitDate}
                    onChange={(e) => setMissedVisitDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason-2">Reason</Label>
                  <Input
                    id="reason-2"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next-visit-date-2">Next Visit Date</Label>
                  <Input
                    id="next-visit-date-2"
                    value={nextVisitDate}
                    onChange={(e) => setNextVisitDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-in-2">Time In</Label>
                  <Input
                    id="time-in-2"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-out-2">Time Out</Label>
                  <Input
                    id="time-out-2"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                  />
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