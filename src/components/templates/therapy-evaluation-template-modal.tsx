'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface TherapyEvaluationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TherapyEvaluationTemplateModal({ isOpen, onClose }: TherapyEvaluationTemplateModalProps) {
  const [formData, setFormData] = useState({
    evaluationDate: '09/12/2025',
    timeIn: '07:00 AM',
    timeOut: '08:00 AM',
    completedBy: 'Physical Therapist',
    frequency: '1w9',
    assistanceNeeded: 'Physical Therapist Assistant (PTA)',
    notes: ''
  });

  const handleSubmit = () => {
    console.log('Therapy Evaluation Template Data:', formData);
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

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs font-semibold bg-gray-300">
              Therapy Evaluation
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Reassessment Therapy Evaluation
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="evaluationDate" className="text-sm font-medium">Evaluation Date</Label>
              <Input
                id="evaluationDate"
                value={formData.evaluationDate}
                onChange={(e) => setFormData({ ...formData, evaluationDate: e.target.value })}
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
                  <SelectItem value="Physical Therapist">Physical Therapist</SelectItem>
                  <SelectItem value="Occupational Therapist">Occupational Therapist</SelectItem>
                  <SelectItem value="Speech Therapist">Speech Therapist</SelectItem>
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

          <div>
            <Label htmlFor="assistanceNeeded" className="text-sm font-medium">Assistance Needed</Label>
            <Select value={formData.assistanceNeeded} onValueChange={(value) => setFormData({ ...formData, assistanceNeeded: value })}>
              <SelectTrigger className="mt-1 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Physical Therapist Assistant (PTA)">Physical Therapist Assistant (PTA)</SelectItem>
                <SelectItem value="Occupational Therapist Assistant (OTA)">Occupational Therapist Assistant (OTA)</SelectItem>
                <SelectItem value="Speech Language Pathology Assistant">Speech Language Pathology Assistant</SelectItem>
              </SelectContent>
            </Select>
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