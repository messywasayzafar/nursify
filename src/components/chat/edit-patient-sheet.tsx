
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddMembersModal } from './add-members-modal';
import { awsPatientService } from '../../../chatservices/aws-patient-service-client';

const getPatientService = () => {
  return {
    addMemberToGroup: async (groupId: string, userId: string, role: string) => {
      return awsPatientService.addMemberToGroup(groupId, userId, role);
    }
  };
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Calendar,
  Pencil,
  List,
  X,
  Home,
  Phone,
  User,
  MessageSquare,
  Image as ImageIcon,
  PlusCircle,
  Settings,
  Cake,
  MapPin,
  CalendarDays,
  Shield,
  Mail,
  FileText,
  Download,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { Chat } from '@/lib/types';
// AWS services removed - using localStorage instead

interface EditPatientSheetProps {
  patient: Chat | PatientGroupData;
  setOpen: (open: boolean) => void;
}

// This will be replaced with dynamic data from patient object

// No sample members - will load real members from patient group data
const sampleMembers: any[] = [];

const documents = [
    { name: "8/20 FS - order summary - PN (RN signed) -...", date: "8/20 FS - order summary - PN (RN signed) - H&P" },
    { name: "Benefits NQS 0820", date: "PDF" },
    { name: "8/26 HHC orders - PN", date: "PDF" },
    { name: "Benefits WellCare 0903", date: "PDF" },
];




export function EditPatientSheet({ patient, setOpen }: EditPatientSheetProps) {
  const [showAllDocs, setShowAllDocs] = React.useState(false);
  const [showAllPictures, setShowAllPictures] = React.useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<any>(patient);

  // Load full patient data from AWS on mount
  useEffect(() => {
    const loadFullPatientData = async () => {
      try {
        const groups = await awsPatientService.getPatientGroups();
        const fullGroup = groups.find((g: any) => g.groupId === patient.id || g.id === patient.id);
        
        if (fullGroup) {
          setPatientData(fullGroup);
        } else {
          setPatientData(patient);
        }
      } catch (error) {
        setPatientData(patient);
      }
    };
    
    loadFullPatientData();
  }, [patient]);

  // Load media from S3
  useEffect(() => {
    const loadMedia = async () => {
      const groupId = patientData?.groupId || patientData?.id;
      if (!groupId) return;

      try {
        const { S3Client, ListObjectsV2Command, GetObjectCommand } = await import('@aws-sdk/client-s3');
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
        const { fetchAuthSession } = await import('aws-amplify/auth');
        
        const session = await fetchAuthSession();

        const s3Client = new S3Client({
          region: 'us-east-1',
          credentials: session.credentials
        });

        const result = await s3Client.send(new ListObjectsV2Command({
          Bucket: 'medhexa-groups-media-2024',
          Prefix: `patient-attachments/${groupId}/`
        }));

        if (result.Contents) {
          const allItems = await Promise.all(
            result.Contents.map(async (item) => {
              const url = await getSignedUrl(s3Client, new GetObjectCommand({
                Bucket: 'medhexa-groups-media-2024',
                Key: item.Key
              }), { expiresIn: 3600 });
              
              const fileName = item.Key?.split('/').pop() || 'file';
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
              
              return {
                src: url,
                name: fileName,
                isImage
              };
            })
          );
          
          setMedia(allItems.filter(item => item.isImage));
          setDocuments(allItems.filter(item => !item.isImage));
        }
      } catch (error) {
        console.error('Failed to load media:', error);
      }
    };

    loadMedia();
  }, [patientData]);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [media, setMedia] = useState<Array<{ src: string; name: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ src: string; name: string }>>([]);

  // Get current user ID
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const { getCurrentUser } = await import('aws-amplify/auth');
        const user = await getCurrentUser();
        const userId = user.username;
        
        setCurrentUserId(userId);
      } catch (error) {
        setCurrentUserId('');
      }
    };

    getCurrentUserId();
  }, [patientData]);

  // Load real members from AWS DynamoDB
  useEffect(() => {
    const loadMembers = async () => {
      const groupId = patientData?.groupId || patientData?.id;
      if (!groupId) return;
      
      try {
        const result = await awsPatientService.getGroupMembers(groupId);
        
        if (result.success && result.members) {
          const creatorId = patientData.createdBy;
          
          const allMembers = result.members.map((member: any) => ({
            ...member,
            isCreator: member.userId === creatorId,
            role: member.userId === creatorId ? 'Admin' : (member.role || 'Member'),
            department: member.userId === creatorId ? 'Administrator' : (member.department || 'Staff'),
            status: 'accepted',
            invitationStatus: 'accepted',
            avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
            email: member.email || '',
            phone: member.phone || '',
            lastActive: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Unknown'
          }));
          
          setMembers(allMembers);
        }
      } catch (error) {
        setMembers([]);
      }
    };
    
    loadMembers();
  }, [patientData]);



  // Check if patient is PatientGroupData or Chat
  const isPatientGroupData = (patient: Chat | PatientGroupData): patient is PatientGroupData => {
    return 'groupId' in patient || 'dateOfBirth' in patient;
  };

  // Get patient details based on data type
  const getPatientDetails = () => {
    if (isPatientGroupData(patientData)) {
      
      return [
        { icon: Cake, label: "Date of Birth", value: patientData.dateOfBirth || 'N/A' },
        { icon: Phone, label: "Phone", value: patientData.contactNumber || 'N/A' },
        { icon: MapPin, label: "Address", value: patientData.homeAddress || 'N/A' },
        { icon: CalendarDays, label: "HH Order Date", value: patientData.hhOrderDate || 'N/A' },
        { icon: Shield, label: "Insurance", value: patientData.insurance || 'N/A' },
        { icon: User, label: "Physician", value: patientData.primaryPhysicianName || 'N/A' },
        { icon: FileText, label: "SOC Provider", value: patientData.socProvider?.toUpperCase() || 'N/A' },
        { icon: Mail, label: "Patient Tag", value: patientData.patientTag || 'N/A' },
      ];
    } else {
      return [
        { icon: Cake, label: "Date of Birth", value: "N/A" },
        { icon: Phone, label: "Phone", value: "N/A" },
        { icon: MapPin, label: "Address", value: "N/A" },
        { icon: CalendarDays, label: "Episode", value: "N/A" },
        { icon: Shield, label: "Insurance", value: "N/A" },
      ];
    }
  };

  const patientDetails = getPatientDetails();

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
      
      const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
        }
      });
      
      const docClient = DynamoDBDocumentClient.from(client);
      
      await docClient.send(new DeleteCommand({
        TableName: 'GroupMembers',
        Key: { memberId }
      }));
      
      setMembers(members.filter(member => member.id !== memberId));
      
      window.dispatchEvent(new CustomEvent('memberRemoved', {
        detail: { groupId: patientData.id, memberId }
      }));
      
    } catch (error) {
      alert('Failed to remove member. Please try again.');
    }
  };

  const handleMembersAdded = async (newMembers: any[]) => {
    try {
      const addMemberPromises = newMembers.map(async (member) => {
        const patientService = getPatientService();
        const result = await patientService.addMemberToGroup(
          patientData.id, 
          member.id, 
          member.role || 'member'
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to add member');
        }
        return { success: true, member };
      });

      await Promise.all(addMemberPromises);
      
      const result = await awsPatientService.getGroupMembers(patientData.id);
      
      if (result.success && result.members) {
        const creatorId = patientData.createdBy;
        
        const allMembers = result.members.map((member: any) => ({
          ...member,
          isCreator: member.userId === creatorId,
          role: member.userId === creatorId ? 'Admin' : (member.role || 'Member'),
          department: member.userId === creatorId ? 'Administrator' : (member.department || 'Staff'),
          status: 'accepted',
          invitationStatus: 'accepted',
          avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
          email: member.email || '',
          phone: member.phone || '',
          lastActive: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Unknown'
        }));
        
        setMembers(allMembers);
      }
      
      window.dispatchEvent(new CustomEvent('memberAdded', { 
        detail: { groupId: patientData.id } 
      }));
      
    } catch (error) {
      alert('Failed to add members to group. Please try again.');
    }
  };

  const handleSavePatient = async () => {
    if (!isPatientGroupData(patientData)) return;
    
    setLoading(true);
    try {
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent('patientDataUpdated', {
        detail: { patientId: patientData.id, patientData }
      }));
    } catch (error) {
      alert('Failed to update patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    const groupId = patientData.groupId || patientData.id;
    setIsDeleting(true);
    
    try {
      await awsPatientService.deletePatientGroup(groupId);
      
      try {
        const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
        const { fetchAuthSession } = await import('aws-amplify/auth');
        
        const session = await fetchAuthSession();
        const s3Client = new S3Client({
          region: 'us-east-1',
          credentials: session.credentials
        });

        const listResult = await s3Client.send(new ListObjectsV2Command({
          Bucket: 'medhexa-groups-media-2024',
          Prefix: `patient-attachments/${groupId}/`
        }));

        if (listResult.Contents && listResult.Contents.length > 0) {
          await s3Client.send(new DeleteObjectsCommand({
            Bucket: 'medhexa-groups-media-2024',
            Delete: {
              Objects: listResult.Contents.map(item => ({ Key: item.Key }))
            }
          }));
        }
      } catch (s3Error) {
        console.error('Failed to delete S3 media:', s3Error);
      }
      
      setOpen(false);
      window.location.reload();
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const getPatientCoordinates = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Home /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <SheetTitle className="text-lg font-bold mb-1">
                      {patientData?.name || patientData?.fullName || 'Unknown'}
                    </SheetTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {isPatientGroupData(patientData) && patientData.socProvider && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {patientData.socProvider.toUpperCase()}
                            </Badge>
                          )}
                          {isPatientGroupData(patientData) && patientData.patientTag && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {patientData.patientTag}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="destructive" className="text-xs px-2 py-1 font-semibold">
                            {isPatientGroupData(patientData) ? 'ACTIVE' : 'GROUP'}
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Calendar className="h-4 w-4"/>
                </Button>
                {isPatientGroupData(patientData) && (
                  <>
                    {isEditing ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={handleSavePatient}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4"/>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="h-4 w-4"/>
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4"/>
                      </Button>
                    )}
                  </>
                )}
            </div>
        </div>
      </SheetHeader>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-4 flex-shrink-0">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-auto">
                <TabsContent value="info" className="m-0">
                    <div className="p-4 space-y-6">
                        {/* Patient Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Patient Details</h3>
                            <div className="space-y-3">
                                {patientDetails.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                                            <detail.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{detail.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Referral Information</h3>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Referral Source</h4>
                                <p className="text-sm">*Four Chaplains Nursing Care Centre - Email - Jae'la Nelson P: (734) 261-9500 ext. 112</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Community Liaison</h4>
                                <p className="text-sm">Zammad Khan</p>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Pictures</h3>
                            {media.length > 0 ? (
                              <>
                                <div className="grid grid-cols-4 gap-2">
                                    {(showAllPictures ? media : media.slice(0, 4)).map((item, index) => (
                                      <div key={index} className="relative group cursor-pointer" onClick={() => window.open(item.src, '_blank')}>
                                        <Image src={item.src} alt={item.name} width={100} height={100} className="rounded-md object-cover aspect-square" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                          <p className="text-white text-xs text-center px-1">{item.name}</p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                {media.length > 4 && (
                                  <Button 
                                    variant="ghost" 
                                    className="w-full justify-start gap-3 text-sm"
                                    onClick={() => setShowAllPictures(!showAllPictures)}
                                  >
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                    <span>{showAllPictures ? 'Show Less' : `View All Pictures (${media.length})`}</span>
                                  </Button>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">No pictures</p>
                            )}
                        </div>

                        {/* Documents */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-3 text-sm"
                                onClick={() => setShowAllDocs(!showAllDocs)}
                            >
                                <FileText className="h-5 w-5 text-primary" />
                                <span>View All Documents</span>
                            </Button>
                            {showAllDocs && (
                                <div className="space-y-2">
                                    {documents.length > 0 ? (
                                      documents.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => window.open(doc.src, '_blank')}>
                                            <FileText className="h-5 w-5 text-destructive flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{doc.name}</p>
                                            </div>
                                            <Download className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No documents</p>
                                    )}
                                </div>
                            )}
                        </div>

                         {/* Actions */}
                        <div className="space-y-3 border-t pt-4">
                             <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                                <PlusCircle className="h-5 w-5 text-primary" />
                                <span>Start New Episode</span>
                            </Button>
                             <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                                <Download className="h-5 w-5 text-primary" />
                                <span>Export Chat</span>
                            </Button>
                        </div>

                        {/* PDFs and Docs */}

                    </div>
                </TabsContent>
                <TabsContent value="members" className="m-0">
                  <div className="p-4 space-y-4">
                    {/* Header with search and add button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Members</h3>
                        <Badge variant="secondary" className="ml-2">
                          {filteredMembers.length} members
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setIsAddMembersModalOpen(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Member
                      </Button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search members..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Members List */}
                    <ScrollArea className="h-96">
                      <div className="flex flex-col gap-4">
                        {filteredMembers.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar || undefined} alt={member.name} />
                              <AvatarFallback className="text-lg font-semibold">{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{member.name}</p>
                                {member.isCreator && (
                                  <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                    Admin
                                  </Badge>
                                )}
                                {member.invitationStatus === 'pending' && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {member.role} • {member.department}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {member.invitationStatus === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700"
                                  title="Invitation pending"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                              {member.invitationStatus === 'accepted' && !member.isCreator && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredMembers.length === 0 && (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No members found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Debug: Total members: {members.length}, Filtered: {filteredMembers.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="m-0">
                  <div className="p-4 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Group Settings</h3>
                      
                      <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                        <Settings className="h-5 w-5 text-primary" />
                        <span>Notification Settings</span>
                      </Button>
                      
                      <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                        <Download className="h-5 w-5 text-primary" />
                        <span>Export Chat History</span>
                      </Button>
                    </div>

          
                    <div className="space-y-4 border-t pt-4">
                      {patientData?.createdBy === currentUserId && (
                        <>
                          <Button 
                            variant="destructive" 
                            className="w-full justify-start gap-3"
                            onClick={() => {
                              console.log('Delete button clicked');
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                            <span>Delete Group</span>
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            This action cannot be undone.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
            </div>
        </Tabs>
      </div>
      
      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        patientGroupId={patientData?.groupId || patientData?.id || patient.id}
        patientGroupName={patientData?.name || patientData?.fullName || patient.name}
        patientAddress={patientData?.homeAddress || 'Patient Address'}
        patientCoordinates={patientData?.latitude && patientData?.longitude ? { lat: patientData.latitude, lng: patientData.longitude } : undefined}
        onMembersAdded={handleMembersAdded}
        mode="direct" // Use direct mode for edit patient section
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Group
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
             This action cannot be undone.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm font-medium text-destructive">
                {patientData?.name || patientData?.fullName || patient.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All patient data, messages, and associated information will be permanently deleted.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePatient}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
