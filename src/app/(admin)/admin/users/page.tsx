
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddUserModal } from '@/components/users/add-user-modal';
import { SelectWorkingAreaModal } from '@/components/users/select-working-area-modal';
import { SelectPermissionModal } from '@/components/users/select-permission-modal';

type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  created: string;
  status: 'Active' | 'Inactive';
};

const mockUsers: User[] = [
  {
    name: "Noman",
    email: "123@gmail.com",
    phone: "123456789",
    address: "1234 Cedar ST",
    city: "Palatine",
    created: "12/25/2024",
    status: 'Active',
  },
];

export default function UsersPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  const filteredUsers = mockUsers.filter(user => {
    const statusMatch = statusFilter === 'All' || user.status === statusFilter;
    const searchMatch = Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return statusMatch && searchMatch;
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
            <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                <DialogTrigger asChild>
                    <Button>Add New User</Button>
                </DialogTrigger>
                {/* Placeholder for AddUserModal, will be created in next steps */}
                {/* <AddUserModal setOpen={setIsAddUserModalOpen} onUserAdded={() => {}} /> */}
            </Dialog>
            <Input
              placeholder="Search Bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cyan-700 hover:bg-cyan-800">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Phone</TableHead>
                <TableHead className="text-white">Address</TableHead>
                <TableHead className="text-white">City</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.city}</TableCell>
                  <TableCell>{user.created}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Set {user.status === 'Active' ? 'Inactive' : 'Active'}</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {Array.from({ length: Math.max(0, 10 - filteredUsers.length) }).map((_, index) => (
                 <TableRow key={`empty-${index}`} className="h-[53px]">
                    <TableCell colSpan={7}></TableCell>
                 </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select onValueChange={setStatusFilter} defaultValue="All">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Export To Excel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
