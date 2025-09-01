
'use client';

import React from 'react';
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

interface SelectPermissionModalProps {
  setOpen: (open: boolean) => void;
}

const permissions = [
  'New Patients Charts',
  'New Internal Groups',
  'New Broadcasting',
  'Billing',
  'ADR Record',
  'Order Follow Up',
  'Export Chats with media',
  'Add/Edit/Delete Users',
  'Report Center',
];

export function SelectPermissionModal({ setOpen }: SelectPermissionModalProps) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">Select Permission</DialogTitle>
        <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {permissions.map((permission) => (
          <div key={permission} className="flex items-center space-x-2 rounded-md border p-2">
            <Checkbox id={permission} />
            <Label htmlFor={permission} className="flex-1 font-normal">
              {permission}
            </Label>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="submit" onClick={() => setOpen(false)} className="w-full bg-primary hover:bg-primary/90">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
