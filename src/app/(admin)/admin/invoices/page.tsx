
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const mockInvoices = [
  {
    invoiceId: 'KH01-01',
    agencyName: 'Kind Hands Home Health',
    subscriptionType: 'Monthly',
    date: '08/29/2024',
    amount: '$200',
    patientCensus: '0 - 50',
    status: 'Paid',
  },
  {
    invoiceId: 'MH01-03',
    agencyName: 'Michigan Home Health',
    subscriptionType: 'Yearly',
    date: '08/31/2025',
    amount: '$400',
    patientCensus: '50 - 100',
    status: 'Unpaid',
  },
];

export default function InvoicesPage() {
  return (
    <Card className="w-full bg-slate-100 border-2 border-gray-300">
      <CardHeader className="flex flex-row items-center justify-end pb-4">
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Subscription type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Date Range" className="w-48" />
          <Input placeholder="Search Bar" className="w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-cyan-800 hover:bg-cyan-900">
                <TableHead className="text-white">#</TableHead>
                <TableHead className="text-white">Invoice ID</TableHead>
                <TableHead className="text-white">Agency Name</TableHead>
                <TableHead className="text-white">Subscription Type</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Patient Census</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice, index) => (
                <TableRow key={index} className="bg-white">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-blue-600 underline">
                    <Link href="#">{invoice.invoiceId}</Link>
                  </TableCell>
                  <TableCell>{invoice.agencyName}</TableCell>
                  <TableCell>{invoice.subscriptionType}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.patientCensus}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-md text-white font-semibold',
                        invoice.status === 'Paid' ? 'bg-green-500' : 'bg-red-500'
                      )}
                    >
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href="#" className="text-blue-600 underline">
                      Download Attached
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {Array.from({ length: 10 - mockInvoices.length }).map((_, index) => (
                <TableRow key={`empty-${index}`} className="h-[53px] bg-gray-300">
                  <TableCell colSpan={9}></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Button className="bg-cyan-800 text-white hover:bg-cyan-900">Export To Excel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
