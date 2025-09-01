
'use client';

import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ReportCenterModalProps {
  setOpen: (open: boolean) => void;
}

const reportButtons = [
  'Patient Groups',
  'Field Staff',
  'Office Staff',
  'Internal Groups',
];

export function ReportCenterModal({ setOpen }: ReportCenterModalProps) {
  return (
    <DialogContent className="sm:max-w-sm p-0">
      <DialogHeader className="p-4 bg-primary text-primary-foreground">
        <DialogTitle className="text-center text-xl">Report Center</DialogTitle>
        <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-primary data-[state=open]:text-primary-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogHeader>
      <div className="grid gap-4 p-6">
        {reportButtons.map((buttonLabel) => (
          <Button
            key={buttonLabel}
            variant="outline"
            className="w-full justify-center h-12 text-md"
            onClick={() => {
              // TODO: Implement report generation logic
              console.log(`Generating report: ${buttonLabel}`);
              setOpen(false);
            }}
          >
            {buttonLabel}
          </Button>
        ))}
      </div>
    </DialogContent>
  );
}
