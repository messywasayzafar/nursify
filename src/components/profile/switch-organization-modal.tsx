
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
import { X } from 'lucide-react';

interface SwitchOrganizationModalProps {
  setOpen: (open: boolean) => void;
}

export function SwitchOrganizationModal({ setOpen }: SwitchOrganizationModalProps) {
  const handleOrgSelect = (orgName: string) => {
    // TODO: Implement actual organization switching logic
    console.log(`Selected organization: ${orgName}`);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">Select Organization</DialogTitle>
      </DialogHeader>
      <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
      </DialogClose>
      <div className="grid gap-4 py-4">
        <Button
          variant="outline"
          className="w-full justify-start h-12 text-left"
          onClick={() => handleOrgSelect('Company A')}
        >
          Company A
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-12 text-left"
          onClick={() => handleOrgSelect('Company B')}
        >
          Company B
        </Button>
      </div>
      <DialogFooter>
        <Button onClick={() => setOpen(false)} className="w-full bg-accent hover:bg-accent/90">
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
