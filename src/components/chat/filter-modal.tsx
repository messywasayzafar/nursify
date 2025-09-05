
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface FilterModalProps {
  setOpen: (open: boolean) => void;
}

const roles = ['SN', 'PT', 'OT', 'SLP', 'MSW', 'HHA', 'RD'];

export function FilterModal({ setOpen }: FilterModalProps) {
  return (
    <DialogContent className="sm:max-w-sm p-0">
      <DialogHeader className="p-4 bg-primary text-primary-foreground">
        <DialogTitle className="text-center text-lg">Filter</DialogTitle>
      </DialogHeader>
      <div className="p-6">
        <p className="mb-4 text-sm font-medium">Select the role</p>
        <div className="grid grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox id={role} />
              <Label htmlFor={role} className="font-normal">
                {role}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="p-4 border-t bg-muted/40">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={() => setOpen(false)} className="bg-primary hover:bg-primary/90">
          Apply
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
