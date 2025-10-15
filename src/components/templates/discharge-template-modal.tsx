'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DischargeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (message: string) => void;
}

export function DischargeTemplateModal({ isOpen, onClose, onSubmit }: DischargeTemplateModalProps) {
  const [dischargeDate, setDischargeDate] = useState<Date>();
  const [formData, setFormData] = useState({
    dischargeEducationTo: '',
    reasonOfDischarge: '',
    nonVisitDischarge: '',
    notes: ''
  });

  const handleSubmit = async () => {
    const data: any = {
      dischargeDate: dischargeDate ? format(dischargeDate, "MM/dd/yyyy") : 'N/A',
      dischargeEducationTo: formData.dischargeEducationTo || 'N/A',
      reasonOfDischarge: formData.reasonOfDischarge || 'N/A',
      nonVisitDischarge: formData.nonVisitDischarge || 'N/A',
      notes: formData.notes || 'N/A'
    };
    
    const templateData = {
      type: 'DISCHARGE_TEMPLATE',
      data,
      status: 'Discharge'
    };
    
    const message = JSON.stringify(templateData);
    
    if (onSubmit) {
      await onSubmit(message);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-slate-200" hideClose>
        <div className="bg-teal-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-teal-700 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <h3 className="font-semibold text-sm">Discharge</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Discharge Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !dischargeDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dischargeDate ? format(dischargeDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dischargeDate}
                    onSelect={setDischargeDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="dischargeEducationTo" className="text-sm font-medium">Discharge education to</Label>
              <Input
                id="dischargeEducationTo"
                value={formData.dischargeEducationTo}
                onChange={(e) => setFormData({ ...formData, dischargeEducationTo: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reasonOfDischarge" className="text-sm font-medium">Reason Of Discharge</Label>
            <Input
              id="reasonOfDischarge"
              value={formData.reasonOfDischarge}
              onChange={(e) => setFormData({ ...formData, reasonOfDischarge: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Non-Visit Discharge</Label>
            <div className="flex items-center space-x-6 mt-2">
              <Button 
                type="button" 
                variant={formData.nonVisitDischarge === 'Yes' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFormData({ ...formData, nonVisitDischarge: 'Yes' })}
              >
                Yes.
              </Button>
              <Button 
                type="button" 
                variant={formData.nonVisitDischarge === 'No' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFormData({ ...formData, nonVisitDischarge: 'No' })}
              >
                No
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 min-h-[60px]"
              placeholder="Enter notes..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white px-6">
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
