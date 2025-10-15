
'use client';

import {
  Dialog,
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
import React, { useEffect, useState } from 'react';

interface PatientGroupsReportModalProps {
  setOpen: (open: boolean) => void;
}

export function PatientGroupsReportModal({ setOpen }: PatientGroupsReportModalProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async (status?: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      const { DynamoDBClient, ScanCommand } = await import('@aws-sdk/client-dynamodb');
      const dynamoClient = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      
      const scanParams: any = {
        TableName: 'PatientGroups'
      };
      
      if (status && status !== 'all') {
        scanParams.FilterExpression = '#status = :status';
        scanParams.ExpressionAttributeNames = { '#status': 'status' };
        scanParams.ExpressionAttributeValues = { ':status': { S: status } };
      }
      
      const result = await dynamoClient.send(new ScanCommand(scanParams));
      
      let groupData = (result.Items || []).map(item => ({
        groupName: item.fullName?.S || item.name?.S || item.patientName?.S || 'N/A',
        status: item.status?.S || 'N/A',
        insurance: item.insurance?.S || 'N/A',
        phone: item.contactNumber?.S || 'N/A',
        gender: item.gender?.S || 'N/A',
        address: item.homeAddress?.S || 'N/A',
        city: item.city?.S || 'N/A',
        created: item.createdAt?.S ? new Date(item.createdAt.S).toLocaleDateString() : 'N/A',
        createdTimestamp: item.createdAt?.S || '',
        totalMembers: item.members?.L?.length || 0,
      }));
      
      // Filter by date range if provided
      if (start && end) {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        groupData = groupData.filter(group => {
          if (!group.createdTimestamp) return false;
          const groupTime = new Date(group.createdTimestamp).getTime();
          return groupTime >= startTime && groupTime <= endTime;
        });
      }
      
      setGroups(groupData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DialogContent className="max-w-[95vw] p-0 max-h-[90vh] flex flex-col">
       <DialogHeader className="p-4 bg-primary text-primary-foreground flex-shrink-0">
        <DialogTitle className="text-center text-xl">Patient Groups Report</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-grow">
        <div className="p-6 bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-end gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); fetchGroups(value); }}>
                  <SelectTrigger id="status" className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Hospitalized">Hospitalized</SelectItem>
                    <SelectItem value="Discharge">Discharge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[150px]"
                  />
              </div>
              <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[150px]"
                  />
              </div>
              <Button 
                onClick={() => fetchGroups(statusFilter, startDate, endDate)}
                className="mt-5"
              >
                Apply
              </Button>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : groups.map((group, index) => (
                  <TableRow key={index} className="bg-card">
                    <TableCell>{group.groupName}</TableCell>
                    <TableCell>{group.status}</TableCell>
                    <TableCell>{group.insurance}</TableCell>
                    <TableCell>{group.phone}</TableCell>
                    <TableCell>{group.gender}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAddress(group.address)}
                      >
                        See Address
                      </Button>
                    </TableCell>
                    <TableCell>{group.city}</TableCell>
                    <TableCell>{group.created}</TableCell>
                    <TableCell>{group.totalMembers}</TableCell>
                  </TableRow>
                ))}
                {/* Render empty rows */}
                {!loading && Array.from({ length: Math.max(0, 10 - groups.length) }).map((_, index) => (
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
      
      {selectedAddress && (
        <Dialog open={!!selectedAddress} onOpenChange={() => setSelectedAddress(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Address Details</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-lg">{selectedAddress}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DialogContent>
  );
}
