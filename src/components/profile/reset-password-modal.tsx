
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface ResetPasswordModalProps {
  setOpen: (open: boolean) => void;
}

export function ResetPasswordModal({ setOpen }: ResetPasswordModalProps) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">Reset Password</DialogTitle>
        <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <p className="text-sm text-muted-foreground text-center px-4">
          Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, no space, minimum 8 and maximum 25 characters.
        </p>
        <div className="grid gap-2 px-4">
          <Label htmlFor="old-password">Old Password*</Label>
          <Input id="old-password" type="password" />
        </div>
        <div className="grid gap-2 px-4">
          <Label htmlFor="new-password">New Password*</Label>
          <Input id="new-password" type="password" />
        </div>
        <div className="grid gap-2 px-4">
          <Label htmlFor="confirm-password">Confirm Password*</Label>
          <Input id="confirm-password" type="password" />
        </div>
      </div>
      <DialogFooter className="px-6 pb-6">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Back
        </Button>
        <Button type="submit" onClick={() => setOpen(false)} className="bg-primary hover:bg-primary/90">
          Update
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
