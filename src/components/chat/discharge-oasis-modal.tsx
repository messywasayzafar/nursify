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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';

interface DischargeOasisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DischargeOasisModal({ open, onOpenChange }: DischargeOasisModalProps) {
  const [dischargeDate, setDischargeDate] = useState('09/12/2025');
  const [dischargeEducation, setDischargeEducation] = useState('');
  const [reasonOfDischarge, setReasonOfDischarge] = useState('');
  const [nonVisitDischarge, setNonVisitDischarge] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="bg-primary text-primary-foreground p-4 -m-6 mb-6">
          <div className="flex items-center justify-between">
            <DialogTitle>Templates</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted p-2 rounded">
            <span className="text-sm font-medium">Discharge</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discharge-date">Discharge Date</Label>
              <Input
                id="discharge-date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discharge-education">Discharge education to</Label>
              <Input
                id="discharge-education"
                value={dischargeEducation}
                onChange={(e) => setDischargeEducation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason-discharge">Reason Of Discharge</Label>
            <Input
              id="reason-discharge"
              value={reasonOfDischarge}
              onChange={(e) => setReasonOfDischarge(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Non-Visit Discharge</Label>
            <RadioGroup value={nonVisitDischarge} onValueChange={setNonVisitDischarge}>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

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