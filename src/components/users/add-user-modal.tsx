
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AddUserModalProps {
  setOpen: (open: boolean) => void;
}

export function AddUserModal({ setOpen }: AddUserModalProps) {
  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">New User</DialogTitle>
         <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
      </DialogClose>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
        {/* Left Section */}
        <div className="col-span-1 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="https://picsum.photos/128" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <label
                htmlFor="photo-upload"
                className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Camera className="h-4 w-4" />
                <input id="photo-upload" type="file" className="sr-only" />
              </label>
            </div>
            <Button variant="outline" size="sm">Upload Photo</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="designation">Designation</Label>
            <Select defaultValue="skilled-nurse">
              <SelectTrigger id="designation">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skilled-nurse">Skilled Nurse</SelectItem>
                <SelectItem value="pt">Physical Therapist</SelectItem>
                <SelectItem value="ot">Occupational Therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Select defaultValue="sn">
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sn">SN</SelectItem>
                <SelectItem value="pt">PT</SelectItem>
                <SelectItem value="ot">OT</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid gap-2">
            <Label htmlFor="roles">Roles</Label>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1">Field Staff</Button>
                <Button variant="outline" className="flex-1">Office Staff</Button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-2 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" placeholder="Enter full name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="Enter email address" />
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
              <Input id="phone-number" type="tel" placeholder="Enter phone number" className="flex-1" />
            </div>
          </div>
           <div className="grid gap-2">
            <Label htmlFor="address">Home Address</Label>
            <Input id="address" placeholder="Enter home address" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="City" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select>
                <SelectTrigger id="state">
                    <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ca">CA</SelectItem>
                    <SelectItem value="ny">NY</SelectItem>
                    <SelectItem value="tx">TX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip">Zip Code</Label>
              <Input id="zip" placeholder="Zip Code" />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={() => setOpen(false)} className="bg-accent hover:bg-accent/90">
          Add User
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
