'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ChangeFrequencyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeFrequencyTemplateModal({ isOpen, onClose }: ChangeFrequencyTemplateModalProps) {
  const [formData, setFormData] = useState({
    discipline: 'Skilled Nurse',
    changeFrequency: '1w9',
    newFrequencyDate: '09/12/2025',
    notes: ''
  });

  const handleSubmit = () => {
    console.log('Change Frequency Template Data:', formData);
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
              Frequency Changed
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Add/Delete Discipline
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discipline" className="text-sm font-medium">Discipline</Label>
              <Select value={formData.discipline} onValueChange={(value) => setFormData({ ...formData, discipline: value })}>
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
              <Label htmlFor="changeFrequency" className="text-sm font-medium">Change Frequency</Label>
              <Input
                id="changeFrequency"
                value={formData.changeFrequency}
                onChange={(e) => setFormData({ ...formData, changeFrequency: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="newFrequencyDate" className="text-sm font-medium">New Frequency Date</Label>
            <Input
              id="newFrequencyDate"
              value={formData.newFrequencyDate}
              onChange={(e) => setFormData({ ...formData, newFrequencyDate: e.target.value })}
              className="mt-1 max-w-xs"
            />
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