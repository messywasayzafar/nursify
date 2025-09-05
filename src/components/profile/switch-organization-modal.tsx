
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
