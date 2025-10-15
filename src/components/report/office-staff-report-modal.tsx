
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { useEffect, useState } from 'react';

interface OfficeStaffReportModalProps {
  setOpen: (open: boolean) => void;
}

export function OfficeStaffReportModal({ setOpen }: OfficeStaffReportModalProps) {
  const [staffData, setStaffData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOfficeStaff();
  }, []);

  const fetchOfficeStaff = async (status?: string) => {
    try {
      setLoading(true);
      
      let companyName = localStorage.getItem('companyname') || '';
      
      if (!companyName) {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        companyName = attributes['custom:company_name'] || '';
        if (companyName) {
          localStorage.setItem('companyname', companyName);
        }
      }
      
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession({ forceRefresh: false });
      
      if (!session.credentials) {
        console.error('No credentials available');
        setLoading(false);
        return;
      }
      
      const { CognitoIdentityProviderClient, ListUsersCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials,
      });
      
      const result = await client.send(new ListUsersCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
      }));
      
      const cognitoUsers = result.Users || [];
      
      const staff = cognitoUsers
        .filter(user => {
          const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
          const userRoles = getAttr('custom:roles');
          const userCompany = getAttr('custom:company_name');
          return userRoles.includes('office') && (!companyName || userCompany === companyName);
        })
        .map(user => {
          const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
          const userStatus = (user.Enabled === false || user.UserStatus === 'UNCONFIRMED') ? 'Inactive' : 'Active';
          return {
            name: getAttr('name'),
            status: userStatus,
            phone: getAttr('phone_number'),
            email: getAttr('email'),
            address: getAttr('address'),
            city: getAttr('custom:city'),
            created: user.UserCreateDate?.toLocaleDateString() || 'N/A',
          };
        })
        .filter(s => !status || status === 'all' || s.status === status);
      
      setStaffData(staff);
    } catch (error) {
      console.error('Error fetching office staff:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-6xl p-0 max-h-[90vh] flex flex-col">
       <DialogHeader className="p-4 bg-primary text-primary-foreground flex-shrink-0">
        <DialogTitle className="text-center text-xl">Office Staff Report</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-grow">
        <div className="p-6 bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-end gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); fetchOfficeStaff(value); }}>
                  <SelectTrigger id="status" className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
                  <TableHead className="text-primary-foreground">Phone</TableHead>
                  <TableHead className="text-primary-foreground">Email</TableHead>
                  <TableHead className="text-primary-foreground">Address</TableHead>
                  <TableHead className="text-primary-foreground">City</TableHead>
                  <TableHead className="text-primary-foreground">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : staffData.map((staff, index) => (
                  <TableRow key={index} className="bg-card">
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.status}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.address}</TableCell>
                    <TableCell>{staff.city}</TableCell>
                    <TableCell>{staff.created}</TableCell>
                  </TableRow>
                ))}
                {!loading && Array.from({ length: Math.max(0, 10 - staffData.length) }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[53px] bg-card hover:bg-muted/50">
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
