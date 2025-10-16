'use client';

import { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewInternalGroupModalProps {
  setOpen: (open: boolean) => void;
}

export function NewInternalGroupModal({ setOpen }: NewInternalGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { fetchUserAttributes, getCurrentUser } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      const currentUser = await getCurrentUser();
      const currentUserId = currentUser.username;
      
      const companyName = attributes['custom:company_name'] || 
                         attributes['custom:company'] || 
                         attributes['custom:organization'] || 
                         attributes['custom:agency'] || '';
      
      console.log('Filtering users by company:', companyName);
      console.log('Current user ID:', currentUserId);
      
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      const { CognitoIdentityProviderClient, ListUsersCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials,
      });
      
      const result = await client.send(new ListUsersCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
      }));
      
      const cognitoUsers = result.Users || [];
      console.log('Total Cognito users:', cognitoUsers.length);
      
      const filteredUsers = cognitoUsers
        .filter(user => {
          const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
          const userCompany = getAttr('custom:company_name');
          const isCurrentUser = user.Username === currentUserId;
          const match = userCompany === companyName && !isCurrentUser;
          if (match) console.log('Matched user:', getAttr('name'), 'company:', userCompany);
          return match;
        })
        .map(user => {
          const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
          return {
            id: user.Username || '',
            name: getAttr('name'),
            email: getAttr('email'),
            designation: getAttr('custom:designation'),
            avatar: getAttr('picture'),
          };
        });
      
      console.log('Filtered users:', filteredUsers.length);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group name',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const cognitoUser = await getCurrentUser();
      const userId = cognitoUser.username;

      // Create internal group in DynamoDB InternalGroups table
      const { DynamoDBClient, PutItemCommand } = await import('@aws-sdk/client-dynamodb');
      const { fetchAuthSession } = await import('aws-amplify/auth');
      
      const session = await fetchAuthSession();
      const dynamoClient = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });

      const groupId = `internal_${Date.now()}`;
      const allMembers = [...selectedUsers, userId];
      
      await dynamoClient.send(new PutItemCommand({
        TableName: 'InternalGroups',
        Item: {
          groupId: { S: groupId },
          groupName: { S: groupName },
          createdBy: { S: userId },
          createdAt: { S: new Date().toISOString() },
          members: { SS: allMembers }
        }
      }));

      toast({
        title: 'Success',
        description: 'Internal group created successfully',
      });

      setOpen(false);
      window.dispatchEvent(new CustomEvent('internalGroupCreated', { detail: { groupId } }));
    } catch (error) {
      console.error('Error creating internal group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create internal group',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader className="bg-primary text-primary-foreground p-4 flex-shrink-0">
        <DialogTitle className="text-center text-xl">New Internal Group</DialogTitle>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="group-name">Group Name*</Label>
          <Input
            id="group-name"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Select Members*</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-96 border rounded-lg p-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleUserToggle(user.id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {selectedUsers.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedUsers.length} user(s) selected
          </p>
        )}
      </div>

      <DialogFooter className="p-4 border-t">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
