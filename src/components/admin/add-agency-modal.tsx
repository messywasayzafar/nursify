
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface AddAgencyModalProps {
  setOpen: (open: boolean) => void;
}

export function AddAgencyModal({ setOpen }: AddAgencyModalProps) {
  return (
    <DialogContent className="sm:max-w-3xl bg-slate-100">
      <DialogHeader className="bg-cyan-700 text-white -mx-6 -mt-6 p-4 rounded-t-lg">
        <DialogTitle className="text-center text-xl">New Agency</DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company-person">Company Person Name</Label>
            <Input id="company-person" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="npi-number">NPI Number</Label>
            <Input id="npi-number" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <div className="flex gap-2">
              <Select defaultValue="us">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">(+1) USA</SelectItem>
                  <SelectItem value="ca">(+1) CA</SelectItem>
                  <SelectItem value="mx">(+52) MX</SelectItem>
                </SelectContent>
              </Select>
              <Input id="phone-number" type="tel" className="flex-1" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="grid gap-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Select>
                    <SelectTrigger id="state">
                        <SelectValue placeholder="Select"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="il">Illinois</SelectItem>
                        <SelectItem value="mi">Michigan</SelectItem>
                        <SelectItem value="ca">California</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="zip-code">Zip Code</Label>
                <Input id="zip-code" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2">
                <Label htmlFor="patient-census">Patient Census</Label>
                <Select>
                    <SelectTrigger id="patient-census">
                        <SelectValue placeholder="0 - 50"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0-50">0 - 50</SelectItem>
                        <SelectItem value="51-100">51 - 100</SelectItem>
                        <SelectItem value="101+">101+</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="subscription-type">Subscription type</Label>
                <Select>
                    <SelectTrigger id="subscription-type">
                        <SelectValue placeholder="Monthly"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" />
            </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={() => setOpen(false)} className="bg-cyan-700 text-white hover:bg-cyan-800">
          Send Agreement
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
