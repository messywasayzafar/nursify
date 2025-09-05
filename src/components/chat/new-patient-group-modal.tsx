
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
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
import { AddMembersModal } from './add-members-modal';

interface NewPatientGroupModalProps {
  setOpen: (open: boolean) => void;
}

export function NewPatientGroupModal({ setOpen }: NewPatientGroupModalProps) {
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);

  const handleAddMembersClick = () => {
    setOpen(false); // Close the current modal
    setIsAddMembersModalOpen(true); // Open the new modal
  };

  return (
    <>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="bg-primary text-primary-foreground p-4 flex-shrink-0">
          <DialogTitle className="text-center text-xl">New Patient Group</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Patient Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Patient Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="full-name">Full Name*</Label>
                <Input id="full-name" defaultValue="Cook Robert" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="dob">Date of Birth*</Label>
                <Input id="dob" type="date" defaultValue="1965-10-22" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="insurance">Insurance*</Label>
                <Input id="insurance" defaultValue="Medicare" />
              </div>
              <div className="grid gap-1.5">
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
              <div className="grid gap-1.5">
                <Label htmlFor="emergency-person">Emergency Person Name</Label>
                <Input id="emergency-person" defaultValue="Nicki Robert" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="emergency-contact">Emergency Person Contact</Label>
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
              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="home-address">Home Address*</Label>
                <Input id="home-address" defaultValue="123 N Halfway" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="city">City*</Label>
                <Input id="city" defaultValue="Glenheights" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
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
                  <div className="grid gap-1.5">
                      <Label htmlFor="zip-code">Zip Code*</Label>
                      <Input id="zip-code" defaultValue="60139" />
                  </div>
              </div>
            </div>
          </div>

          {/* Physician Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Physician Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="primary-physician">Primary Physician Name*</Label>
                <Input id="primary-physician" defaultValue="Dr. Suleman" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f2f-date">Last Face to Face Date*</Label>
                <Input id="f2f-date" type="date" defaultValue="2025-06-12" />
              </div>
              <div className="grid gap-1.5">
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
              <div className="grid gap-1.5">
                <Label htmlFor="hh-order-date">HH Order Date*</Label>
                <Input id="hh-order-date" type="date" defaultValue="2025-07-01" />
              </div>
            </div>
          </div>
          
          {/* Other Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                  <Label>Who will Do the SOC*</Label>
                  <RadioGroup defaultValue="sn" className="flex gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sn" id="sn" />
                          <Label htmlFor="sn" className="font-normal">SN</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ot" id="ot" />
                          <Label htmlFor="ot" className="font-normal">OT</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pt" id="pt" />
                          <Label htmlFor="pt" className="font-normal">PT</Label>
                      </div>
                  </RadioGroup>
              </div>
              <div className="grid gap-1.5">
                  <Label htmlFor="referral-source">Referral Source</Label>
                  <Input id="referral-source" defaultValue="Rosery Hill" />
              </div>
              <div className="grid gap-1.5">
                  <Label htmlFor="patient-tag">Patient Tag</Label>
                  <Input id="patient-tag" />
              </div>
          </div>
          <div className="grid gap-1.5">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" defaultValue="Patient want to come from back door" rows={2} />
          </div>
        </div>
        <DialogFooter className="p-4 pt-0 flex-shrink-0 flex justify-between w-full">
          <div>
              <Button variant="outline">Attachment</Button>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMembersClick} className="bg-primary hover:bg-primary/90">Add Members</Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={isAddMembersModalOpen} onOpenChange={setIsAddMembersModalOpen}>
        <AddMembersModal setOpen={setIsAddMembersModalOpen} />
      </Dialog>
    </>
  );
}
