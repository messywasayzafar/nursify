
'use client';

import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditAdminProfileModalProps {
  setOpen: (open: boolean) => void;
}

export function EditAdminProfileModal({ setOpen }: EditAdminProfileModalProps) {
  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">Profile</DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://picsum.photos/100" alt="User" data-ai-hint="person" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <label
              htmlFor="admin-photo-upload"
              className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Camera className="h-4 w-4" />
              <input id="admin-photo-upload" type="file" className="sr-only" />
            </label>
          </div>
          <Button variant="outline" size="sm">Upload Photo</Button>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" defaultValue="Noman Nizam" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue="noman.nizam@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <div className="flex gap-2">
            <Select defaultValue="us">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">(+1) USA</SelectItem>
                <SelectItem value="ca">(+1) CA</SelectItem>
                <SelectItem value="mx">(+52) MX</SelectItem>
              </SelectContent>
            </Select>
            <Input id="phone-number" type="tel" placeholder="555-123-4567" className="flex-1" />
          </div>
        </div>
         <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="123 Main St" />
          </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Anytown" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" placeholder="CA" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zip">Zip Code</Label>
            <Input id="zip" placeholder="12345" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
        <Button type="submit" onClick={() => setOpen(false)} className="bg-primary hover:bg-primary/90">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
