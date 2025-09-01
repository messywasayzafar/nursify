
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PatientGroupsReportModal } from './patient-groups-report-modal';

interface ReportCenterModalProps {
  setOpen: (open: boolean) => void;
}

const reportButtons = [
  'Field Staff',
  'Office Staff',
  'Internal Groups',
];

export function ReportCenterModal({ setOpen }: ReportCenterModalProps) {
  const [isPatientGroupModalOpen, setIsPatientGroupModalOpen] = React.useState(false);

  return (
    <>
      <DialogContent className="sm:max-w-sm p-0">
        <DialogHeader className="p-4 bg-primary text-primary-foreground">
          <DialogTitle className="text-center text-xl">Report Center</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 p-6">
          <DialogTrigger asChild>
             <Button
                variant="outline"
                className="w-full justify-center h-12 text-md"
                onClick={() => {
                  setOpen(false);
                  setIsPatientGroupModalOpen(true);
                }}
              >
                Patient Groups
              </Button>
          </DialogTrigger>

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

      <Dialog open={isPatientGroupModalOpen} onOpenChange={setIsPatientGroupModalOpen}>
        <PatientGroupsReportModal setOpen={setIsPatientGroupModalOpen} />
      </Dialog>
    </>
  );
}
