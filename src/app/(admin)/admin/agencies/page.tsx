
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddAgencyModal } from '@/components/admin/add-agency-modal';

const mockAgencies = [
  {
    name: 'Kind Hands Home Health',
    location: 'Chicago, IL',
    status: 'Active',
    creationDate: '08/22/2025',
    memberId: 'KH01',
    subscription: 'Monthly',
    totalActivePatient: 56,
  },
  {
    name: 'Michigan Home Health',
    location: 'Detroit, MI',
    status: 'Active',
    creationDate: '09/23/2024',
    memberId: 'MH01',
    subscription: 'Yearly',
    totalActivePatient: 114,
  },
];

export default function AgenciesPage() {
  const [isAddAgencyModalOpen, setIsAddAgencyModalOpen] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <Dialog open={isAddAgencyModalOpen} onOpenChange={setIsAddAgencyModalOpen}>
            <DialogTrigger asChild>
              <Button>Add New Agency</Button>
            </DialogTrigger>
            <AddAgencyModal setOpen={setIsAddAgencyModalOpen} />
          </Dialog>
          <Input placeholder="Search Bar" className="w-64" />
           <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cyan-700 hover:bg-cyan-800">
                <TableHead className="text-white">S. No.</TableHead>
                <TableHead className="text-white">Agencies Names</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Creation Date</TableHead>
                <TableHead className="text-white">Member ID</TableHead>
                <TableHead className="text-white">Subscription</TableHead>
                <TableHead className="text-white">Total Active Patient</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAgencies.map((agency, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{agency.name}</TableCell>
                  <TableCell>{agency.location}</TableCell>
                  <TableCell>{agency.status}</TableCell>
                  <TableCell>{agency.creationDate}</TableCell>
                  <TableCell>{agency.memberId}</TableCell>
                  <TableCell>{agency.subscription}</TableCell>
                  <TableCell>{agency.totalActivePatient}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/agencies/${agency.memberId}`}>View Details</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {Array.from({ length: 10 - mockAgencies.length }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[53px]">
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
        <div className="flex justify-end mt-4">
          <Button variant="secondary" className="bg-cyan-700 text-white hover:bg-cyan-800">Export To Excel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
