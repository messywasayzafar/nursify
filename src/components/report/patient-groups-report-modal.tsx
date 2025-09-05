
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { X } from 'lucide-react';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

interface PatientGroupsReportModalProps {
  setOpen: (open: boolean) => void;
}

const mockGroupData = [
  {
    groupName: 'Jone, Bass',
    status: 'Active',
    insurance: 'Medicare',
    phone: '123456789',
    gender: 'Male',
    address: '1234 Cedar ST',
    city: 'Palatine',
    created: '12/25/2024',
    totalMembers: 14,
  },
   {
    groupName: 'Jone, Bass',
    status: 'Active',
    insurance: 'Medicare',
    phone: '123456789',
    gender: 'Male',
    address: '1234 Cedar ST',
    city: 'Palatine',
    created: '12/25/2024',
    totalMembers: 14,
  },
   {
    groupName: 'Jone, Bass',
    status: 'Active',
    insurance: 'Medicare',
    phone: '123456789',
    gender: 'Male',
    address: '1234 Cedar ST',
    city: 'Palatine',
    created: '12/25/2024',
    totalMembers: 14,
  },
];

export function PatientGroupsReportModal({ setOpen }: PatientGroupsReportModalProps) {
  return (
    <DialogContent className="sm:max-w-4xl p-0 max-h-[90vh] flex flex-col">
       <DialogHeader className="p-4 bg-primary text-primary-foreground flex-shrink-0">
        <DialogTitle className="text-center text-xl">Patient Groups Report</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-grow">
        <div className="p-6 bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-end gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status" className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="discharge">Discharge</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Input type="text" value="05/18/2025 - 07/16/2025" className="w-[240px]"/>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">Export To Excel</Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary/90">
                  <TableHead className="text-primary-foreground">Group Name</TableHead>
                  <TableHead className="text-primary-foreground">Status</TableHead>
                  <TableHead className="text-primary-foreground">Insurance</TableHead>
                  <TableHead className="text-primary-foreground">Phone</TableHead>
                  <TableHead className="text-primary-foreground">Gender</TableHead>
                  <TableHead className="text-primary-foreground">Address</TableHead>
                  <TableHead className="text-primary-foreground">City</TableHead>
                  <TableHead className="text-primary-foreground">Created</TableHead>
                  <TableHead className="text-primary-foreground">Total Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGroupData.map((group, index) => (
                  <TableRow key={index} className="bg-card">
                    <TableCell>{group.groupName}</TableCell>
                    <TableCell>{group.status}</TableCell>
                    <TableCell>{group.insurance}</TableCell>
                    <TableCell>{group.phone}</TableCell>
                    <TableCell>{group.gender}</TableCell>
                    <TableCell>{group.address}</TableCell>
                    <TableCell>{group.city}</TableCell>
                    <TableCell>{group.created}</TableCell>
                    <TableCell>{group.totalMembers}</TableCell>
                  </TableRow>
                ))}
                {/* Render empty rows */}
                {Array.from({ length: 10 - mockGroupData.length }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[53px] bg-card hover:bg-muted/50">
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
