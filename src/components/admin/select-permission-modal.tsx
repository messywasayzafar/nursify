
'use client';

import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SelectPermissionModalProps {
  setOpen: (open: boolean) => void;
}

const permissions = [
  'Agencies',
  'Add New Agencies',
  'Add New User',
  'Report',
  'Support Settings',
  'Invoices',
  'Dashboard',
];

export function SelectPermissionModal({ setOpen }: SelectPermissionModalProps) {
  return (
    <DialogContent className="sm:max-w-md bg-slate-100">
      <DialogHeader className="bg-cyan-700 text-white -mx-6 -mt-6 p-4 rounded-t-lg">
        <DialogTitle className="text-center text-xl">Select Permission</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {permissions.map((permission) => (
          <div key={permission} className="flex items-center space-x-2 rounded-md border p-3 bg-white">
            <Checkbox id={permission} />
            <Label htmlFor={permission} className="flex-1 font-normal">
              {permission}
            </Label>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="submit" onClick={() => setOpen(false)} className="w-full bg-cyan-700 text-white hover:bg-cyan-800">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
