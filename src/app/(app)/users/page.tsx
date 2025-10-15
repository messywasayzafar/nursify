
'use client';

import { useState } from 'react';
import * as React from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AddUserModal } from '@/components/users/add-user-modal';
import { EditUserModal } from '@/components/users/edit-user-modal';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  username: string;
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
    username: "noman123"
  },
  // Add more mock users here to test filtering
];

export default function UsersPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const handleUserAdded = () => {
    setIsAddUserModalOpen(false);
    setTimeout(() => fetchUsers(), 500);
  }

  const fetchUsers = async () => {
    console.log('fetchUsers started');
    setLoading(true);
    setError(null);
    
    try {
      // Get company name from localStorage
      let companyName = localStorage.getItem('companyname') || '';
      console.log('Company name from localStorage:', companyName);
      
      // If no company name, try to get it from current user attributes
      if (!companyName) {
        try {
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          companyName = attributes['custom:company_name'] || '';
          if (companyName) {
            localStorage.setItem('companyname', companyName);
            console.log('Company name fetched from user attributes:', companyName);
          }
        } catch (attrError) {
          console.log('Could not fetch user attributes:', attrError);
        }
      }
      
      const { fetchAuthSession } = await import('aws-amplify/auth');
      
      // Try to get credentials with force refresh
      let session = await fetchAuthSession({ forceRefresh: false });
      
      // If no credentials, try force refresh
      if (!session.credentials) {
        console.log('No credentials on first attempt, trying force refresh...');
        session = await fetchAuthSession({ forceRefresh: true });
      }
      
      if (!session.credentials) {
        console.log('No credentials available after refresh');
        setError('Unable to authenticate. Please try refreshing the page or logging in again.');
        setLoading(false);
        return;
      }

      console.log('Got credentials from session');

      const { CognitoIdentityProviderClient, ListUsersCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials,
      });

      const command = new ListUsersCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
      });

      console.log('Sending ListUsers command...');
      const response = await client.send(command);
      const cognitoUsers = response.Users || [];
      console.log('ListUsers response received');
      
      console.log(`Found ${cognitoUsers.length} total users in Cognito`);
      
      // If no company name, show all users
      let filteredUsers;
      if (!companyName) {
        console.log('No company filter - showing all users');
        filteredUsers = cognitoUsers.map(user => {
          const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
          return {
            name: getAttr('name'),
            title: getAttr('custom:designation'),
            email: getAttr('email'),
            phone: getAttr('phone_number'),
            gender: getAttr('gender'),
            address: getAttr('address'),
            city: getAttr('custom:city'),
            created: user.UserCreateDate?.toLocaleDateString() || '',
            status: (user.Enabled === false || user.UserStatus === 'UNCONFIRMED') ? 'Inactive' : 'Active' as 'Active' | 'Inactive',
            username: user.Username || '',
          };
        });
      } else {
        console.log(`Filtering by company: "${companyName}"`);
        filteredUsers = cognitoUsers
          .filter(user => {
            const companyAttr = user.Attributes?.find(attr => attr.Name === 'custom:company_name');
            const userCompany = companyAttr?.Value || '';
            console.log(`User ${user.Username}: company="${userCompany}", expected="${companyName}"`);
            return userCompany === companyName;
          })
          .map(user => {
            const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
            return {
              name: getAttr('name'),
              title: getAttr('custom:designation'),
              email: getAttr('email'),
              phone: getAttr('phone_number'),
              gender: getAttr('gender'),
              address: getAttr('address'),
              city: getAttr('custom:city'),
              created: user.UserCreateDate?.toLocaleDateString() || '',
              status: (user.Enabled === false || user.UserStatus === 'UNCONFIRMED') ? 'Inactive' : 'Active' as 'Active' | 'Inactive',
              username: user.Username || '',
            };
          });
      }

      console.log(`Found ${filteredUsers.length} users${companyName ? ` for company "${companyName}"` : ''}`);
      console.log('Filtered users:', filteredUsers);
      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      console.error('Error details:', error?.name, error?.message);
      
      // Set user-friendly error messages
      if (error?.name === 'AccessDeniedException') {
        setError('Access denied. Please check your permissions or contact an administrator.');
        console.error('Access denied - check IAM permissions for ListUsers');
      } else if (error?.name === 'NotAuthorizedException') {
        setError('Authentication failed. Please try logging out and logging back in.');
        console.error('Not authorized - user may need to re-authenticate');
      } else if (error?.name === 'CredentialsError' || error?.message?.includes('credentials')) {
        setError('Authentication credentials expired. Please refresh the page or log in again.');
        console.error('Credentials error - user may need to re-authenticate');
      } else {
        setError('Failed to load users. Please try refreshing the page.');
      }
    } finally {
      console.log('fetchUsers completed, loading set to false');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const loadUsers = async () => {
      console.log('=== LOAD USERS EFFECT ===');
      console.log('loadUsers called:', { authLoading, authUser: !!authUser });
      
      if (authLoading) {
        console.log('Skipping - auth still loading');
        return;
      }
      
      if (!authUser) {
        console.log('Skipping - no auth user');
        setLoading(false);
        return;
      }
      
      console.log('Auth user present, proceeding to fetch users');
      
      // Wait for credentials to be available
      const { fetchAuthSession } = await import('aws-amplify/auth');
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Credential check attempt ${attempts}/${maxAttempts}`);
        
        try {
          const session = await fetchAuthSession({ forceRefresh: attempts > 2 });
          console.log('Session check:', { 
            hasTokens: !!session.tokens, 
            hasCredentials: !!session.credentials,
            attempt: attempts
          });
          
          if (session.credentials) {
            console.log('✓ Credentials ready, calling fetchUsers()');
            await fetchUsers();
            break;
          } else {
            console.log('✗ No credentials yet');
          }
        } catch (error) {
          console.error('Error getting session:', error);
        }
        
        if (attempts < maxAttempts) {
          console.log(`Waiting 800ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          console.error('✗ No credentials after all attempts');
          setError('Unable to authenticate. Please click the Refresh button or try logging in again.');
          setLoading(false);
        }
      }
    };
    
    console.log('=== useEffect triggered ===', { authLoading, hasAuthUser: !!authUser });
    loadUsers();
  }, [authLoading, authUser]);
  
  React.useEffect(() => {
    console.log('Users state updated:', users.length, 'users');
  }, [users]);

  const handleSetInactive = async (email: string) => {
    try {
      setActionLoading(email);
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession({ forceRefresh: true });
      const credentials = session.credentials;

      if (!credentials) {
        toast({
          title: 'Error',
          description: 'No credentials available',
          variant: 'destructive',
        });
        return;
      }

      const { CognitoIdentityProviderClient, AdminDisableUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials,
      });

      const command = new AdminDisableUserCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Username: email,
      });

      await client.send(command);
      toast({
        title: 'Success',
        description: 'User has been set to inactive',
      });
      await fetchUsers();
    } catch (error: any) {
      console.error('Error disabling user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetActive = async (email: string) => {
    try {
      setActionLoading(email);
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession({ forceRefresh: true });
      const credentials = session.credentials;

      if (!credentials) {
        toast({
          title: 'Error',
          description: 'No credentials available',
          variant: 'destructive',
        });
        return;
      }

      const { CognitoIdentityProviderClient, AdminEnableUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials,
      });

      const command = new AdminEnableUserCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Username: email,
      });

      console.log('Enabling user:', email);
      const response = await client.send(command);
      console.log('Enable user response:', response);
      toast({
        title: 'Success',
        description: 'User has been activated',
      });
      await fetchUsers();
    } catch (error: any) {
      console.error('Error enabling user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to enable user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (email: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) return;

    try {
      setActionLoading(email);
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession({ forceRefresh: true });
      const credentials = session.credentials;

      if (!credentials) {
        toast({
          title: 'Error',
          description: 'No credentials available',
          variant: 'destructive',
        });
        return;
      }

      const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials,
      });

      const command = new AdminDeleteUserCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Username: email,
      });

      await client.send(command);
      toast({
        title: 'Success',
        description: `User ${userName} has been deleted`,
      });
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      console.log('Exporting users to Excel:', filteredUsers);
      
      if (!filteredUsers || filteredUsers.length === 0) {
        toast({
          title: "No Users to Export",
          description: "There are no users to export. Please add some users first.",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for export
      const exportData = filteredUsers.map(user => ({
        'Name': user.name || '',
        'Title': user.title || '',
        'Email': user.email || '',
        'Phone': user.phone || '',
        'Gender': user.gender || '',
        'Address': user.address || '',
        'City': user.city || '',
        'Created': user.created || '',
        'Status': user.status || '',
        'Username': user.username || ''
      }));

      console.log('Export data prepared:', exportData);

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `users_${timestamp}.xlsx`;
      
      XLSX.writeFile(workbook, filename);
      
      console.log('Excel file exported successfully');
      
      toast({
        title: "Export Successful",
        description: `Exported ${filteredUsers.length} users to ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users to Excel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
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
                <TableHead className="text-primary-foreground">Status</TableHead>
                <TableHead className="text-primary-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authLoading || loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>{authLoading ? 'Authenticating...' : 'Loading users...'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="text-red-600 space-y-3">
                      <p className="font-medium text-lg">⚠️ Error Loading Users</p>
                      <p className="text-sm">{error}</p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={fetchUsers} 
                          variant="outline" 
                          size="sm"
                          className="bg-cyan-700 text-white hover:bg-cyan-800"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline" 
                          size="sm"
                        >
                          Reload Page
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="space-y-3 text-muted-foreground">
                      <p className="font-medium">No users found</p>
                      <p className="text-sm">
                        {users.length === 0 ? (
                          <>
                            No users loaded yet. 
                            <Button 
                              onClick={fetchUsers} 
                              variant="link" 
                              size="sm"
                              className="text-cyan-700"
                            >
                              Click here to refresh
                            </Button>
                          </>
                        ) : (
                          'Try adjusting your search or filter criteria.'
                        )}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
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
                        <Badge 
                          variant={user.status === 'Active' ? 'default' : 'secondary'}
                          className={user.status === 'Active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}
                        >
                          {user.status === 'Active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === user.username}
                            >
                              <span className="sr-only">Open menu</span>
                              {actionLoading === user.username ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { 
                              if (!user.username) {
                                toast({
                                  title: 'Error',
                                  description: 'User username is missing',
                                  variant: 'destructive',
                                });
                                return;
                              }
                              setSelectedUserEmail(user.username); 
                              setIsEditUserModalOpen(true); 
                            }}>
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'Active' ? (
                              <DropdownMenuItem 
                                onClick={() => handleSetInactive(user.username)}
                                className="text-orange-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Set Inactive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleSetActive(user.username)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Set Active
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.username, user.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
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
                        <TableCell></TableCell>
                     </TableRow>
                  ))}
                </>
              )}
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
            <Button 
              onClick={() => {
                setError(null);
                fetchUsers();
              }} 
              disabled={loading || authLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || authLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">Add User</Button>
                </DialogTrigger>
                <AddUserModal setOpen={setIsAddUserModalOpen} onUserAdded={handleUserAdded} />
            </Dialog>
            <Dialog 
              open={isEditUserModalOpen} 
              onOpenChange={(open) => {
                setIsEditUserModalOpen(open);
                if (!open) {
                  setSelectedUserEmail('');
                  // Force cleanup of modal backdrop
                  document.body.style.pointerEvents = '';
                }
              }}
            >
              {selectedUserEmail && (
                <EditUserModal 
                  key={selectedUserEmail} 
                  setOpen={setIsEditUserModalOpen} 
                  onUserUpdated={fetchUsers} 
                  userEmail={selectedUserEmail} 
                />
              )}
            </Dialog>
            <Button 
              onClick={exportToExcel} 
              disabled={exportLoading || filteredUsers.length === 0}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export To Excel'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
