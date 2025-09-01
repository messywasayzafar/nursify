
'use client';

import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationSettingsModalProps {
  setOpen: (open: boolean) => void;
}

export function NotificationSettingsModal({ setOpen }: NotificationSettingsModalProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">Notifications</DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="desktop-notification" className="font-normal">Desktop Notification</Label>
          <Switch id="desktop-notification" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="all-notification" className="font-normal">All Notification</Label>
          <Switch id="all-notification" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="important-notifications" className="font-normal">Important Notifications</Label>
          <Switch id="important-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="do-not-disturb" className="font-normal">Do Not Disturb</Label>
          <Switch id="do-not-disturb" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={() => setOpen(false)} className="w-full bg-primary hover:bg-primary/90">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
