'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SOCTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (message: string) => void;
}

export function SOCTemplateModal({ isOpen, onClose, onSubmit }: SOCTemplateModalProps) {
  const [socDate, setSocDate] = useState<Date>();
  const [nextVisitDate, setNextVisitDate] = useState<Date>();
  const [formData, setFormData] = useState({
    socDate: '',
    timeIn: '07:00 AM',
    timeOut: '08:00 AM',
    completedBy: 'Skilled Nurse',
    frequency: '1w9',
    homeHealthAid: false,
    homeHealthAidFrequency: '2w9',
    assistanceNeeded: 'LPN (Licensed Practice Nurse)',
    evaluate: [] as string[],
    hha: false,
    hhaFrequency: '',
    notes: ''
  });

  const handleEvaluateChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      evaluate: checked 
        ? [...prev.evaluate, value]
        : prev.evaluate.filter(v => v !== value)
    }));
  };

  const handleSubmit = async () => {
    const data: any = {
      socDate: socDate ? format(socDate, "MM/dd/yyyy") : 'N/A',
      timeIn: formData.timeIn || 'N/A',
      timeOut: formData.timeOut || 'N/A',
      completedBy: formData.completedBy,
      frequency: formData.frequency,
      assistanceNeeded: formData.assistanceNeeded,
      nextVisitDate: nextVisitDate ? format(nextVisitDate, "MM/dd/yyyy") : 'N/A',
      notes: formData.notes || 'N/A'
    };
    
    if (formData.evaluate.includes('PT')) data.pt = 'Evaluate';
    if (formData.evaluate.includes('OT')) data.ot = 'Evaluate';
    if (formData.evaluate.includes('ST')) data.st = 'Evaluate';
    if (formData.evaluate.includes('MSW')) data.msw = 'Evaluate';
    if (formData.hha) {
      data.hha = 'Yes';
      data.hhaFrequency = formData.hhaFrequency || 'N/A';
    }
    
    const templateData = {
      type: 'SOC_TEMPLATE',
      data
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
        <DialogHeader className="sr-only">
          <DialogTitle>Start of Care Template</DialogTitle>
        </DialogHeader>
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

        <div className="p-6 space-y-2 overflow-y-auto max-h-[calc(80vh-80px)]">
          <h3 className="font-semibold text-sm">Start of Care - SOC</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-sm font-medium">SOC Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !socDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {socDate ? format(socDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={socDate}
                    onSelect={setSocDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="timeIn" className="text-sm font-medium">Time In</Label>
              <Input
                id="timeIn"
                value={formData.timeIn}
                onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="timeOut" className="text-sm font-medium">Time Out</Label>
              <Input
                id="timeOut"
                value={formData.timeOut}
                onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="completedBy" className="text-sm font-medium">Completed By</Label>
              <Select value={formData.completedBy} onValueChange={(value) => setFormData({ ...formData, completedBy: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skilled Nurse">Skilled Nurse</SelectItem>
                  <SelectItem value="LPN">LPN</SelectItem>
                  <SelectItem value="Physical Therapist">Physical Therapist</SelectItem>
                  <SelectItem value="MSW">MSW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency" className="text-sm font-medium">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="assistanceNeeded" className="text-sm font-medium">Assistance Needed</Label>
              <Select value={formData.assistanceNeeded} onValueChange={(value) => setFormData({ ...formData, assistanceNeeded: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LPN (Licensed Practice Nurse)">LPN (Licensed Practice Nurse)</SelectItem>
                  <SelectItem value="RN (Registered Nurse)">RN (Registered Nurse)</SelectItem>
                  <SelectItem value="CNA (Certified Nursing Assistant)">CNA (Certified Nursing Assistant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Next Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
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
            <div>
              <Label className="text-sm font-medium">Evaluate</Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="eval-pt" 
                    checked={formData.evaluate.includes('PT')}
                    onCheckedChange={(checked) => handleEvaluateChange('PT', checked as boolean)}
                  />
                  <Label htmlFor="eval-pt" className="cursor-pointer">PT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="eval-ot" 
                    checked={formData.evaluate.includes('OT')}
                    onCheckedChange={(checked) => handleEvaluateChange('OT', checked as boolean)}
                  />
                  <Label htmlFor="eval-ot" className="cursor-pointer">OT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="eval-st" 
                    checked={formData.evaluate.includes('ST')}
                    onCheckedChange={(checked) => handleEvaluateChange('ST', checked as boolean)}
                  />
                  <Label htmlFor="eval-st" className="cursor-pointer">ST</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="eval-msw" 
                    checked={formData.evaluate.includes('MSW')}
                    onCheckedChange={(checked) => handleEvaluateChange('MSW', checked as boolean)}
                  />
                  <Label htmlFor="eval-msw" className="cursor-pointer">MSW</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm font-medium">HHA</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox 
                  id="hha" 
                  checked={formData.hha}
                  onCheckedChange={(checked) => setFormData({ ...formData, hha: checked as boolean })}
                />
                <Label htmlFor="hha" className="cursor-pointer">Home Health Aide</Label>
              </div>
            </div>
            {formData.hha && (
              <div>
                <Label htmlFor="hhaFrequency" className="text-sm font-medium">HHA Frequency</Label>
                <Input
                  id="hhaFrequency"
                  value={formData.hhaFrequency}
                  onChange={(e) => setFormData({ ...formData, hhaFrequency: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., 2w9"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 min-h-[40px]"
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