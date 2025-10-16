'use client';

import { useState, useEffect } from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UserPlus, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InternalGroupSheetProps {
  group: any;
  setOpen: (open: boolean) => void;
}

export function InternalGroupSheet({ group, setOpen }: InternalGroupSheetProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [documentFiles, setDocumentFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchFiles();
  }, [group]);

  useEffect(() => {
    if (isAddMemberOpen) {
      fetchAvailableUsers();
    }
  }, [isAddMemberOpen]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      const { DynamoDBClient, GetItemCommand } = await import('@aws-sdk/client-dynamodb');
      const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      
      const result = await client.send(new GetItemCommand({
        TableName: 'InternalGroups',
        Key: { groupId: { S: group.id } }
      }));
      
      const memberIds = result.Item?.members?.SS || [];
      
      const { CognitoIdentityProviderClient, AdminGetUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const cognitoClient = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      
      const memberDetails = await Promise.all(
        memberIds.map(async (userId) => {
          try {
            const userResult = await cognitoClient.send(new AdminGetUserCommand({
              UserPoolId: 'us-east-1_8C0HCUlTs',
              Username: userId
            }));
            
            const getAttr = (name: string) => userResult.UserAttributes?.find(attr => attr.Name === name)?.Value || '';
            return {
              id: userId,
              name: getAttr('name'),
              email: getAttr('email'),
              designation: getAttr('custom:designation'),
              avatar: getAttr('picture')
            };
          } catch {
            return null;
          }
        })
      );
      
      setMembers(memberDetails.filter(Boolean));
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const { fetchUserAttributes, getCurrentUser } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      const currentUser = await getCurrentUser();
      const currentUserId = currentUser.username;
      
      const companyName = attributes['custom:company_name'] || '';
      
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
      const memberIds = members.map(m => m.id);
      
      const filteredUsers = cognitoUsers
        .filter(user => {
          const getAttr = (name: string) => user.Attributes?.find(attr => attr.Name === name)?.Value || '';
          const userCompany = getAttr('custom:company_name');
          const isAlreadyMember = memberIds.includes(user.Username);
          return userCompany === companyName && !isAlreadyMember;
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
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
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
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
      const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      
      const result = await client.send(new GetItemCommand({
        TableName: 'InternalGroups',
        Key: { groupId: { S: group.id } }
      }));
      
      const currentMembers = result.Item?.members?.SS || [];
      const updatedMembers = [...currentMembers, ...selectedUsers];
      
      await client.send(new UpdateItemCommand({
        TableName: 'InternalGroups',
        Key: { groupId: { S: group.id } },
        UpdateExpression: 'SET members = :members',
        ExpressionAttributeValues: {
          ':members': { SS: updatedMembers }
        }
      }));

      toast({
        title: 'Success',
        description: 'Members added successfully',
      });

      setIsAddMemberOpen(false);
      setSelectedUsers([]);
      fetchMembers();
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: 'Error',
        description: 'Failed to add members',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const { awsPatientService } = await import('../../../chatservices/aws-patient-service-client');
      const messages = await awsPatientService.getGroupMessages(group.id);
      
      const media: any[] = [];
      const docs: any[] = [];
      
      messages.forEach((msg: any) => {
        if (msg.fileUrl) {
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fileUrl);
          const file = {
            url: msg.fileUrl,
            timestamp: msg.timestamp,
            sender: msg.senderName
          };
          
          if (isImage) {
            media.push(file);
          } else {
            docs.push(file);
          }
        }
      });
      
      setMediaFiles(media);
      setDocumentFiles(docs);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SheetHeader className="bg-primary text-primary-foreground p-4">
        <SheetTitle className="text-primary-foreground">{group.name}</SheetTitle>
      </SheetHeader>
      
      <Tabs defaultValue="media" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="media" className="flex-1">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4">
              {loadingFiles ? (
                <p className="text-center text-muted-foreground py-8">Loading media...</p>
              ) : mediaFiles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No media files</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img 
                        src={file.url} 
                        alt="media" 
                        className="w-full h-full object-cover rounded cursor-pointer"
                        onClick={() => window.open(file.url, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="files" className="flex-1">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4">
              {loadingFiles ? (
                <p className="text-center text-muted-foreground py-8">Loading files...</p>
              ) : documentFiles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No files</p>
              ) : (
                <div className="space-y-2">
                  {documentFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {file.url.split('/').pop()}
                        </a>
                        <p className="text-xs text-muted-foreground">Sent by {file.sender}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="members" className="flex-1">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Group Members ({members.length})</h3>
                <Button size="sm" variant="outline" onClick={() => setIsAddMemberOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
              
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading members...</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.designation}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="bg-primary text-primary-foreground p-4 flex-shrink-0">
            <DialogTitle className="text-center text-xl">Add Members</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              {loadingUsers ? (
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
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Members'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
