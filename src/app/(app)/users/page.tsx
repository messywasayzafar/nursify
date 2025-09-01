
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddUserModal } from '@/components/users/add-user-modal';

type User = {
  name: string;
  title: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  city: string;
  created: string;
  status: 'Active' | 'Inactive';
};

const mockUsers: User[] = [
  {
    name: "Noman",
    title: "SN",
    email: "123@gmail.com",
    phone: "123456789",
    gender: "Male",
    address: "1234 Cedar ST",
    city: "Palatine",
    created: "12/25/2024",
    status: 'Active',
  },
  // Add more mock users here to test filtering
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
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/90">
                <TableHead className="text-primary-foreground">Name</TableHead>
                <TableHead className="text-primary-foreground">Title</TableHead>
                <TableHead className="text-primary-foreground">Email</TableHead>
                <TableHead className="text-primary-foreground">Phone</TableHead>
                <TableHead className="text-primary-foreground">Gender</TableHead>
                <TableHead className="text-primary-foreground">Address</TableHead>
                <TableHead className="text-primary-foreground">City</TableHead>
                <TableHead className="text-primary-foreground">Created</TableHead>
                <TableHead className="text-primary-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.title}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.gender}</TableCell>
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
                        <DropdownMenuItem>Set Inactive</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {/* Render empty rows to fill the table */}
              {Array.from({ length: Math.max(0, 10 - filteredUsers.length) }).map((_, index) => (
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select onValueChange={setStatusFilter} defaultValue="All">
              <SelectTrigger className="w-[180px] bg-primary text-primary-foreground">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search Bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm bg-primary text-primary-foreground placeholder:text-primary-foreground/80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">Add User</Button>
                </DialogTrigger>
                <AddUserModal setOpen={setIsAddUserModalOpen} />
            </Dialog>
            <Button className="bg-primary hover:bg-primary/90">Export To Excel</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
