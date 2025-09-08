
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';

type Ticket = {
  id: string;
  subject: string;
  name: string;
  created: string;
  ticketNo: string;
  category: 'Technical' | 'Billing' | 'Others';
  status: 'Resolved' | 'Open' | 'In-Progress';
};

const mockTickets: Ticket[] = [
  {
    id: 'KH01',
    subject: 'Cannot login account',
    name: 'Matt',
    created: '08/22/2024',
    ticketNo: '0123',
    category: 'Technical',
    status: 'Resolved',
  },
  {
    id: 'MH01',
    subject: 'Billing Discrepancies',
    name: 'Noman',
    created: '08/21/2025',
    ticketNo: '2345',
    category: 'Billing',
    status: 'Open',
  },
];

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
    <p className="text-4xl font-bold">{value}</p>
    <p className="text-sm font-medium text-gray-600">{title}</p>
  </Card>
);

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Technical', 'Billing', 'Others'];

  const filteredTickets = mockTickets.filter(ticket => {
    if (activeTab === 'All') return true;
    return ticket.category === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Open Tickets" value="02" />
        <StatCard title="InProgress Tickets" value="02" />
        <StatCard title="Resolved Tickets" value="13" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Support</h2>
              <div className="flex items-center border rounded-md p-1">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-1 text-sm rounded-md",
                      activeTab === tab ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <Input placeholder="Search Tickets" className="w-64" />
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-cyan-800 hover:bg-cyan-900">
                  <TableHead className="text-white">#</TableHead>
                  <TableHead className="text-white">ID</TableHead>
                  <TableHead className="text-white">Subject</TableHead>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Ticket No.</TableHead>
                  <TableHead className="text-white">Category</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{ticket.name}</TableCell>
                    <TableCell>{ticket.created}</TableCell>
                    <TableCell>{ticket.ticketNo}</TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>{ticket.status}</TableCell>
                  </TableRow>
                ))}
                {Array.from({ length: 10 - filteredTickets.length }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[53px]">
                    <TableCell colSpan={8}></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
