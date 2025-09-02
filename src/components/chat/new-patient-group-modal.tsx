
'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface NewPatientGroupModalProps {
  setOpen: (open: boolean) => void;
}

export function NewPatientGroupModal({ setOpen }: NewPatientGroupModalProps) {
  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader className="bg-primary text-primary-foreground p-4">
        <DialogTitle className="text-center text-xl">New Patient Group</DialogTitle>
        <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogHeader>
      <div className="p-6 space-y-6">
        {/* Patient Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Patient Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name*</Label>
              <Input id="full-name" defaultValue="Cook Robert" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth*</Label>
              <Input id="dob" type="date" defaultValue="1965-10-22" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="insurance">Insurance*</Label>
              <Input id="insurance" defaultValue="Medicare" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-number">Contact Number*</Label>
              <div className="flex gap-2">
                <Select defaultValue="us">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">(+1) USA</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="contact-number" type="tel" defaultValue="(123) 456-7890" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergency-person">Emergency Person Name</Label>
              <Input id="emergency-person" defaultValue="Nicki Robert" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergency-contact">Emergency Person Contact Number</Label>
              <div className="flex gap-2">
                <Select defaultValue="us">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">(+1) USA</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="emergency-contact" type="tel" defaultValue="(123) 456-7890" />
              </div>
            </div>
             <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="home-address">Home Address*</Label>
              <Input id="home-address" defaultValue="123 N Halfway" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City*</Label>
              <Input id="city" defaultValue="Glenheights" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="state">State*</Label>
                    <Select defaultValue="il">
                        <SelectTrigger id="state">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="il">IL</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="zip-code">Zip Code*</Label>
                    <Input id="zip-code" defaultValue="60139" />
                </div>
            </div>
          </div>
        </div>

        {/* Physician Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Physician Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="primary-physician">Primary Physician Name*</Label>
              <Input id="primary-physician" defaultValue="Dr. Suleman" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="f2f-date">Last Face to Face Date*</Label>
              <Input id="f2f-date" type="date" defaultValue="2025-06-12" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secondary-physician">Secondary Physician Name</Label>
              <Input id="secondary-physician" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="hh-order-date">HH Order Date*</Label>
              <Input id="hh-order-date" type="date" defaultValue="2025-07-01" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="physician-contact">Contact Number*</Label>
               <div className="flex gap-2">
                <Select defaultValue="us">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">(+1) USA</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="physician-contact" type="tel" defaultValue="(123) 456-7890" />
              </div>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="secondary-physician-contact">Contact Number</Label>
               <div className="flex gap-2">
                <Select defaultValue="us">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">(+1) USA</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="secondary-physician-contact" type="tel" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Other Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
                <Label>Who will Do the SOC*</Label>
                <RadioGroup defaultValue="sn" className="flex gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sn" id="sn" />
                        <Label htmlFor="sn">SN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ot" id="ot" />
                        <Label htmlFor="ot">OT</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pt" id="pt" />
                        <Label htmlFor="pt">PT</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="referral-source">Referral Source</Label>
                <Input id="referral-source" defaultValue="Rosery Hill" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="patient-tag">Patient Tag</Label>
                <Input id="patient-tag" />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="about">About</Label>
            <Textarea id="about" defaultValue="Patient want to come from back door" />
        </div>
      </div>
      <DialogFooter className="p-6 pt-0 flex justify-between w-full">
        <div>
            <Button variant="outline">Attachment</Button>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)} className="bg-primary hover:bg-primary/90">Add Members</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
