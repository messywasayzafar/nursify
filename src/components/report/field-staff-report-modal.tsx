
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

interface FieldStaffReportModalProps {
  setOpen: (open: boolean) => void;
}

const mockStaffData = [
  {
    name: 'Noman Nizam',
    status: 'Active',
    department: 'SN',
    phone: '123456789',
    email: '123@gmail.com',
    address: '1234 Cedar ST',
    city: 'Palatine',
    created: '12/25/2024',
    patientsGroups: '02/11/2025',
    totalMembers: 14,
  },
];

export function FieldStaffReportModal({ setOpen }: FieldStaffReportModalProps) {
  return (
    <DialogContent className="sm:max-w-6xl p-0 max-h-[90vh] flex flex-col">
       <DialogHeader className="p-4 bg-card flex-shrink-0">
        <DialogTitle className="text-center text-xl">Report Center</DialogTitle>
        <DialogClose asChild>
          <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogHeader>
      <ScrollArea className="flex-grow">
        <div className="p-6 bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-end gap-4">
              <Button variant="outline" className="bg-muted">Field Staff</Button>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="status" className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Select defaultValue="sn">
                    <SelectTrigger id="department" className="w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sn">SN</SelectItem>
                      <SelectItem value="pt">PT</SelectItem>
                      <SelectItem value="ot">OT</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">Export To Excel</Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary/90">
                  <TableHead className="text-primary-foreground">Name</TableHead>
                  <TableHead className="text-primary-foreground">Status</TableHead>
                  <TableHead className="text-primary-foreground">Department</TableHead>
                  <TableHead className="text-primary-foreground">Phone</TableHead>
                  <TableHead className="text-primary-foreground">Email</TableHead>
                  <TableHead className="text-primary-foreground">Address</TableHead>
                  <TableHead className="text-primary-foreground">City</TableHead>
                  <TableHead className="text-primary-foreground">Created</TableHead>
                  <TableHead className="text-primary-foreground">Patients Groups</TableHead>
                  <TableHead className="text-primary-foreground">Total Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStaffData.map((staff, index) => (
                  <TableRow key={index} className="bg-card">
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.status}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.address}</TableCell>
                    <TableCell>{staff.city}</TableCell>
                    <TableCell>{staff.created}</TableCell>
                    <TableCell>{staff.patientsGroups}</TableCell>
                    <TableCell>{staff.totalMembers}</TableCell>
                  </TableRow>
                ))}
                {/* Render empty rows */}
                {Array.from({ length: 10 - mockStaffData.length }).map((_, index) => (
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
