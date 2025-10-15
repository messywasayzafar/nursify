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

interface RevisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (message: string) => void;
}

export function RevisitModal({ open, onOpenChange, onSubmit }: RevisitModalProps) {
  const [activeTab, setActiveTab] = useState('re-visit');
  const [visitDate, setVisitDate] = useState<Date>();
  const [missedVisitDate, setMissedVisitDate] = useState<Date>();
  const [nextVisitDate, setNextVisitDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [timeIn, setTimeIn] = useState('07:00 AM');
  const [timeOut, setTimeOut] = useState('08:00 AM');
  const [nextTimeIn, setNextTimeIn] = useState('07:00 AM');
  const [nextTimeOut, setNextTimeOut] = useState('08:00 AM');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    const data: any = {
      type: activeTab === 're-visit' ? 'RE_VISIT' : 'MISSED_VISIT',
      notes: notes || 'N/A'
    };
    
    if (activeTab === 're-visit') {
      data.visitDate = visitDate ? format(visitDate, "MM/dd/yyyy") : 'N/A';
      data.timeIn = timeIn || 'N/A';
      data.timeOut = timeOut || 'N/A';
      data.nextVisitDate = nextVisitDate ? format(nextVisitDate, "MM/dd/yyyy") : 'N/A';
      data.nextTimeIn = nextTimeIn || 'N/A';
      data.nextTimeOut = nextTimeOut || 'N/A';
    } else {
      data.missedVisitDate = missedVisitDate ? format(missedVisitDate, "MM/dd/yyyy") : 'N/A';
      data.reason = reason || 'N/A';
      data.nextVisitDate = nextVisitDate ? format(nextVisitDate, "MM/dd/yyyy") : 'N/A';
      data.nextTimeIn = nextTimeIn || 'N/A';
      data.nextTimeOut = nextTimeOut || 'N/A';
    }
    
    const templateData = {
      type: activeTab === 're-visit' ? 'REVISIT_TEMPLATE' : 'MISSEDVISIT_TEMPLATE',
      data
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
              <TabsTrigger value="re-visit">Re-Visit</TabsTrigger>
              <TabsTrigger value="missed-visit">Missed Visit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="re-visit" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !visitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {visitDate ? format(visitDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={visitDate}
                        onSelect={setVisitDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Label>Next Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextVisitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextVisitDate ? format(nextVisitDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={nextVisitDate}
                        onSelect={setNextVisitDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-time-in">Time In</Label>
                  <Input
                    id="next-time-in"
                    value={nextTimeIn}
                    onChange={(e) => setNextTimeIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-time-out">Time Out</Label>
                  <Input
                    id="next-time-out"
                    value={nextTimeOut}
                    onChange={(e) => setNextTimeOut(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="missed-visit" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Missed Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !missedVisitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {missedVisitDate ? format(missedVisitDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={missedVisitDate}
                        onSelect={setMissedVisitDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Label>Next Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextVisitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextVisitDate ? format(nextVisitDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={nextVisitDate}
                        onSelect={setNextVisitDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-time-in-2">Time In</Label>
                  <Input
                    id="next-time-in-2"
                    value={nextTimeIn}
                    onChange={(e) => setNextTimeIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-time-out-2">Time Out</Label>
                  <Input
                    id="next-time-out-2"
                    value={nextTimeOut}
                    onChange={(e) => setNextTimeOut(e.target.value)}
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