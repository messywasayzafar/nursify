
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { SelectPermissionModal } from './select-permission-modal';

interface AddUserModalProps {
  setOpen: (open: boolean) => void;
}

export function AddUserModal({ setOpen }: AddUserModalProps) {
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  return (
    <>
      <DialogContent className="sm:max-w-4xl bg-slate-100">
        <DialogHeader className="bg-cyan-700 text-white -mx-6 -mt-6 p-4 rounded-t-lg">
          <DialogTitle className="text-center text-xl">New User</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          <div className="col-span-1 flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="https://picsum.photos/128" alt="User" data-ai-hint="person" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cyan-700 text-white"
              >
                <Camera className="h-4 w-4" />
                <input id="photo-upload" type="file" className="sr-only" />
              </label>
            </div>
            <Button variant="outline">Upload Photo</Button>
          </div>

          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date Of Birth</Label>
              <Input id="dob" type="text" placeholder="MM/DD/YYYY" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Select defaultValue="us">
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">(+1) USA</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="phone-number" type="tel" className="flex-1" />
              </div>
            </div>
            <div className="md:col-span-2 grid gap-2">
              <Label htmlFor="home-address">Home Address</Label>
              <Input id="home-address" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip-code">Zip Code</Label>
                <Input id="zip-code" />
              </div>
            </div>
            <div className="md:col-span-2 grid gap-2">
              <Label htmlFor="creation-date">Date Of Creation</Label>
              <Input id="creation-date" type="text" placeholder="MM/DD/YYYY" />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between w-full">
            <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="bg-cyan-700 text-white hover:bg-cyan-800">Permissions</Button>
                </DialogTrigger>
                <SelectPermissionModal setOpen={setIsPermissionModalOpen} />
            </Dialog>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button type="submit" onClick={() => setOpen(false)} className="bg-cyan-700 text-white hover:bg-cyan-800">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </>
  );
}
