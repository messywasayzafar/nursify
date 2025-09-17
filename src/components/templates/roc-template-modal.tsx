'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ROCTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ROCTemplateModal({ isOpen, onClose }: ROCTemplateModalProps) {
  const [formData, setFormData] = useState({
    rocDate: '09/12/2025',
    timeIn: '07:00 AM',
    timeOut: '08:00 AM',
    completedBy: 'Skilled Nurse',
    frequency: '1w5',
    homeHealthAidFrequency: '2w5',
    assistanceNeeded: 'LPN (Licensed Practice Nurse)',
    evaluate: 'PT (Physical Therapy)',
    facilityName: '',
    facilityDischargeDate: '09/12/2025',
    notes: ''
  });

  const handleSubmit = () => {
    console.log('ROC Template Data:', formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-slate-200">
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
          <h3 className="font-semibold text-sm">Resumption Of Care - ROC</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="rocDate" className="text-sm font-medium">ROC Date</Label>
              <Input
                id="rocDate"
                value={formData.rocDate}
                onChange={(e) => setFormData({ ...formData, rocDate: e.target.value })}
                className="mt-1"
              />
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skilled Nurse">Skilled Nurse</SelectItem>
                  <SelectItem value="LPN">LPN</SelectItem>
                  <SelectItem value="Physical Therapist">Physical Therapist</SelectItem>
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

          <div className="text-center">
            <div className="inline-block">
              <Label className="text-sm font-medium">Home Health Aid</Label>
              <div className="mt-1">
                <span className="text-sm font-medium mr-2">Add</span>
                <span className="text-sm font-medium mr-4">Frequency</span>
                <Input
                  value={formData.homeHealthAidFrequency}
                  onChange={(e) => setFormData({ ...formData, homeHealthAidFrequency: e.target.value })}
                  className="inline-block w-20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="assistanceNeeded" className="text-sm font-medium">Assistance Needed</Label>
              <Select value={formData.assistanceNeeded} onValueChange={(value) => setFormData({ ...formData, assistanceNeeded: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LPN (Licensed Practice Nurse)">LPN (Licensed Practice Nurse)</SelectItem>
                  <SelectItem value="RN (Registered Nurse)">RN (Registered Nurse)</SelectItem>
                  <SelectItem value="CNA (Certified Nursing Assistant)">CNA (Certified Nursing Assistant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evaluate" className="text-sm font-medium">Evaluate</Label>
              <Select value={formData.evaluate} onValueChange={(value) => setFormData({ ...formData, evaluate: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PT (Physical Therapy)">PT (Physical Therapy)</SelectItem>
                  <SelectItem value="OT (Occupational Therapy)">OT (Occupational Therapy)</SelectItem>
                  <SelectItem value="ST (Speech Therapy)">ST (Speech Therapy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="facilityName" className="text-sm font-medium">Facility Name</Label>
              <Input
                id="facilityName"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="facilityDischargeDate" className="text-sm font-medium">Facility Discharge Date</Label>
              <Input
                id="facilityDischargeDate"
                value={formData.facilityDischargeDate}
                onChange={(e) => setFormData({ ...formData, facilityDischargeDate: e.target.value })}
                className="mt-1"
              />
            </div>
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