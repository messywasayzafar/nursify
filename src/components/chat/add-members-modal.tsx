'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Search, Filter, MapPin, Users, UserPlus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientCliniciansMap } from '../../../components/map/PatientCliniciansMap';
import { awsPatientService } from '../../../chatservices/aws-patient-service-client';
import { cognitoService } from '../../../chatservices/cognito-service';



interface Member {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  location?: string | { lat: number; lng: number };
  status?: 'available' | 'busy' | 'offline';
  companyName?: string;
  coordinates?: { lat: number; lng: number };
  tags?: string[];
}

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientGroupId: string;
  patientGroupName: string;
  patientAddress?: string;
  patientCoordinates?: { lat: number; lng: number };
  onMembersAdded?: (members: Member[]) => void;
  mode?: 'invitation' | 'direct'; // New prop to control behavior
}

export function AddMembersModal({ 
  isOpen, 
  onClose, 
  patientGroupId, 
  patientGroupName,
  patientAddress = 'Patient Address',
  patientCoordinates,
  onMembersAdded,
  mode = 'invitation' // Default to invitation mode
}: AddMembersModalProps) {
  console.log('📍 AddMembersModal received coordinates:', patientCoordinates);
  console.log('📍 AddMembersModal received address:', patientAddress);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState('clinicians');
  const [companyUsers, setCompanyUsers] = useState<Member[]>([]);
  const [clinicianUsers, setClinicianUsers] = useState<Member[]>([]);
  const [staffUsers, setStaffUsers] = useState<Member[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Combine all user arrays for map display
  const allUsers = [...companyUsers, ...clinicianUsers, ...staffUsers];
  console.log('🗺️ Total users for map:', allUsers.length);
  console.log('🗺️ Users with coordinates:', allUsers.filter(u => u.coordinates).length);

  

  const [groups] = useState([
    {
      id: 'team1',
      name: 'Team Members',
      members: ['Dr. Sarah Johnson', 'Nurse Mike Chen'],
      icon: '👥'
    },
    {
      id: 'sn1',
      name: 'SN Teams',
      members: ['Nurse Lisa Park', 'Dr. Emily Rodriguez'],
      icon: '🏥'
    },
    {
      id: 'ref1',
      name: 'Referrals',
      members: ['Dr. James Wilson'],
      icon: '🤝'
    },
    {
      id: 'marketing1',
      name: 'Marketing Team',
      members: [],
      icon: '📢'
    },
    {
      id: 'insurance1',
      name: 'Insurances',
      members: [],
      icon: '💼'
    }
  ]);

  // Helper functions
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleClinicianMapClick = (clinicianId: string) => {
    const clinician = filteredClinicianUsers.find(c => c.id === clinicianId);
    if (clinician) {
      handleMemberSelect(clinician);
    }
  };

  const handleMemberSelect = (member: Member) => {
    const isSelected = selectedMembers.some(m => m.id === member.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleGroupSelect = (group: any) => {
    // Handle group selection logic
    console.log('Group selected:', group);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  const handleAdmit = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No Members Selected",
        description: "Please select at least one member to add.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const existingResult = await awsPatientService.getGroupMembers(patientGroupId);
      const existingMemberIds = existingResult.success && existingResult.members ? 
        existingResult.members.map((m: any) => m.userId) : [];
      
      const newMembers = selectedMembers.filter(member => !existingMemberIds.includes(member.id));
      
      if (newMembers.length === 0) {
        toast({
          title: "No New Members",
          description: "All selected members are already in the group.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (mode === 'direct') {
        // Direct mode: Add members directly to the group
        const addMemberPromises = newMembers.map(async (member) => {
          try {
            const result = await awsPatientService.addMemberToGroup(patientGroupId, member.id, member.role || 'member');
            
            if (result.success) {
              console.log(`✅ Member ${member.name} added to group successfully`);
              return { success: true, member };
            } else {
              console.error(`❌ Failed to add member ${member.name}:`, result.error);
              throw new Error(result.error || 'Failed to add member');
            }
          } catch (error) {
            console.error(`❌ Error adding member ${member.name}:`, error);
            throw error;
          }
        });

        // Wait for all members to be added
        await Promise.all(addMemberPromises);

        // Call the onMembersAdded callback with the selected members
        if (onMembersAdded) {
          onMembersAdded(selectedMembers);
        }

        toast({
          title: "Members Added Successfully",
          description: `Added ${newMembers.length} members to ${patientGroupName}. They can now participate in the group chat.`,
          variant: "default"
        });

        onClose();
      } else {
        const invitationPromises = newMembers.map(async (member) => {
          const result = await awsPatientService.addMemberToGroup(patientGroupId, member.id, member.role || 'member');
          if (!result.success) throw new Error(result.error);
        });

        // Wait for all invitations to be sent
        await Promise.all(invitationPromises);

        toast({
          title: "Invitations Sent Successfully",
          description: `Sent ${newMembers.length} invitations to join ${patientGroupName}. Users will be added after they accept.`,
          variant: "default"
        });

        onClose();
      }
    } catch (error) {
      console.error('Error in handleAdmit:', error);
      toast({
        title: "Error",
        description: "Failed to add members. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered users for display
  const filteredClinicianUsers = clinicianUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaffUsers = staffUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch company users when modal opens
  const fetchCompanyUsers = async () => {
    setLoadingUsers(true);
    
    try {
      // Get company name from localStorage (set by header)
      const companyName = localStorage.getItem('companyname');
      console.log('🏢 Company name from header:', companyName);
      
      if (!companyName || companyName === 'Agency Name' || companyName.trim() === '') {
        console.log('⚠️ No valid company name found in header');
        toast({
          title: "Company Name Not Found",
          description: "Please ensure your profile has a company name set.",
          variant: "destructive"
        });
        setLoadingUsers(false);
        return;
      }
      
      console.log('🏢 Fetching users for company from header:', companyName);
      
      // Fetch users from Cognito
      const users = await cognitoService.getUsersByCompany(companyName);
      const mappedUsers = users.map((u, index) => {
        const geodata = u.attributes?.['custom:geodata'];
        
        console.log(`User ${u.name} geodata:`, geodata);
        
        let coordinates;
        let workingAreaAddress = 'Not specified';
        
        // Parse geodata: format is either "lat,lng" or "address|lat,lng"
        if (geodata) {
          if (geodata.includes('|')) {
            // Format: "address|lat,lng"
            const [address, coords] = geodata.split('|');
            workingAreaAddress = address || 'Not specified';
            const [lat, lng] = coords.split(',').map(parseFloat);
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng };
            }
          } else if (geodata.includes(',')) {
            // Format: "lat,lng"
            const [lat, lng] = geodata.split(',').map(parseFloat);
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng };
            }
          }
        }
        
        // If no valid coordinates, spread users around patient location
        if (!coordinates) {
          coordinates = patientCoordinates ? {
            lat: patientCoordinates.lat + (Math.random() - 0.5) * 0.1,
            lng: patientCoordinates.lng + (Math.random() - 0.5) * 0.1
          } : { lat: 41.8781 + (Math.random() - 0.5) * 0.1, lng: -87.6298 + (Math.random() - 0.5) * 0.1 };
        }
        
        console.log(`User ${u.name} final coordinates:`, coordinates);
        
        return {
          ...u,
          avatar: '',
          location: workingAreaAddress,
          coordinates,
          tags: []
        };
      });
      
      console.log('✅ Mapped users with coordinates:', mappedUsers.map(u => ({ name: u.name, coordinates: u.coordinates })));
      console.log('✅ Fetched users:', mappedUsers.length);
      
      // Separate users by role
      const clinicians = mappedUsers.filter((user: Member) => 
        user.role?.toLowerCase().includes('doctor') || 
        user.role?.toLowerCase().includes('physician') ||
        user.role?.toLowerCase().includes('nurse') ||
        user.role?.toLowerCase().includes('specialist')
      );
      
      const staff = mappedUsers.filter((user: Member) => 
        !user.role?.toLowerCase().includes('doctor') && 
        !user.role?.toLowerCase().includes('physician') &&
        !user.role?.toLowerCase().includes('nurse') &&
        !user.role?.toLowerCase().includes('specialist')
      );
      
      setClinicianUsers(clinicians);
      setStaffUsers(staff);
      setCompanyUsers(mappedUsers);
      
      console.log('✅ Users loaded - Clinicians:', clinicians.length, 'Staff:', staff.length);
      console.log('🗺️ Sample clinician:', clinicians[0]);
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load existing group members and auto-select them
  useEffect(() => {
    const loadExistingMembers = async () => {
      if (!isOpen) return;
      
      try {
        const result = await awsPatientService.getGroupMembers(patientGroupId);
        if (result.success && result.members) {
          const existingMemberIds = result.members.map((m: any) => m.userId);
          console.log('✅ Existing group members:', existingMemberIds);
          
          // Auto-select existing members after users are loaded
          setTimeout(() => {
            const membersToSelect = [...clinicianUsers, ...staffUsers].filter(user => 
              existingMemberIds.includes(user.id)
            );
            setSelectedMembers(membersToSelect);
            console.log('✅ Auto-selected existing members:', membersToSelect.length);
          }, 500);
        }
      } catch (error) {
        console.error('Error loading existing members:', error);
      }
    };
    
    if (isOpen && (activeTab === 'clinicians' || activeTab === 'staff')) {
      fetchCompanyUsers();
      loadExistingMembers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="bg-primary text-primary-foreground p-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Members to {patientGroupName}
          </DialogTitle>

        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Map Section - Left Side */}
          <div className="flex-1 bg-gray-50 p-4">
            <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
              <PatientCliniciansMap
                patientCoordinates={patientCoordinates}
                patientAddress={patientAddress || 'Patient Address'}
                clinicians={allUsers.filter(member => member.role && (member.role.toLowerCase().includes('nurse') || member.role.toLowerCase().includes('doctor') || member.role.toLowerCase().includes('physician') || member.role.toLowerCase().includes('therapy') || member.role.toLowerCase().includes('therapist') || member.role.toLowerCase().includes('specialist'))).map(member => ({
                  id: member.id,
                  name: member.name,
                  role: member.role,
                  avatar: member.avatar,
                  location: member.location || 'Working Area',
                  status: member.status || 'offline',
                  coordinates: member.coordinates
                }))}
                onClinicianClick={(clinician) => {
                  const member = allUsers.find(m => m.id === clinician.id);
                  if (member && !selectedMembers.find(m => m.id === member.id)) {
                    setSelectedMembers(prev => [...prev, member]);
                  }
                }}
                selectedClinicianId={selectedMembers.length > 0 ? selectedMembers[0].id : undefined}
              />
            </div>
          </div>

          {/* Members Panel - Right Side */}
          <div className="w-96 bg-blue-50 border-l flex flex-col">
            <div className="p-4 border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="clinicians">Clinicians</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                      <TabsTrigger value="groups">Groups</TabsTrigger>
                  </TabsList>
              </Tabs>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="clinicians" className="space-y-2">
                  {loadingUsers ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading clinicians...</p>
                    </div>
                  ) : filteredClinicianUsers.length > 0 ? (
                    filteredClinicianUsers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMembers.some(m => m.id === member.id)
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleMemberSelect(member)}
                      >
                        <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar || undefined} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getInitials(member.name || 'Unknown')}
                            </AvatarFallback>
                      </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status || 'offline')}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          <p className="text-xs text-gray-500 truncate">{member.role}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {typeof member.location === 'string' ? member.location : 
                               member.location ? `${member.location.lat}, ${member.location.lng}` : 'No location'}
                            </p>
                            {member.tags && member.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {member.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedMembers.some(m => m.id === member.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>No clinicians found in this agency</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="staff" className="space-y-2">
                  {loadingUsers ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p>Loading staff...</p>
                    </div>
                  ) : filteredStaffUsers.length > 0 ? (
                    filteredStaffUsers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMembers.some(m => m.id === member.id)
                            ? 'bg-green-100 border-green-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleMemberSelect(member)}
                      >
                        <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar || undefined} />
                            <AvatarFallback className="bg-green-100 text-green-700">
                                {getInitials(member.name || 'Unknown')}
                            </AvatarFallback>
                          </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status || 'offline')}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          <p className="text-xs text-gray-500 truncate">{member.role}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {typeof member.location === 'string' ? member.location : 
                               member.location ? `${member.location.lat}, ${member.location.lng}` : 'No location'}
                            </p>
                          </div>
                        </div>
                        {selectedMembers.some(m => m.id === member.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>No staff members found in this agency</p>
                      <p className="text-xs">Only non-clinical staff from your company will appear here</p>
                      <p className="text-xs mt-1 text-blue-600">Add users to your agency to see them here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="groups" className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors bg-white border-gray-200 hover:bg-gray-50"
                      onClick={() => handleGroupSelect(group)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{group.icon}</div>
                        <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.members.length} members</p>
                      </div>
                      </div>
                  </div>
                ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <Label className="text-sm font-medium mb-2 block">Selected Members</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                      {member.name}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveMember(member.id)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="p-4 border-t bg-white">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAdmit}
                disabled={selectedMembers.length === 0 || isSubmitting}
                className="ml-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'direct' ? 'Adding Members...' : 'Sending Invitations...'}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {mode === 'direct' ? `Add Members (${selectedMembers.length})` : `Send Invitations (${selectedMembers.length})`}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
