'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, Users, UserPlus2 } from 'lucide-react';
// AWS services removed - using localStorage instead
import { useToast } from '@/hooks/use-toast';

interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedUserId: string;
  invitedUserName: string;
  invitedByUserId: string;
  invitedByUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface ReferralsSectionProps {
  userId: string;
  onInvitationAccepted?: (invitation: Invitation) => void;
  onInvitationDeclined?: (invitation: Invitation) => void;
}

export function ReferralsSection({ 
  userId, 
  onInvitationAccepted, 
  onInvitationDeclined 
}: ReferralsSectionProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingInvitations();
  }, [userId]);

  const loadPendingInvitations = async () => {
    try {
      setLoading(true);
      console.log('🔍 ReferralsSection: Loading pending invitations for user:', userId);
      // Load pending invitations from localStorage (AWS service removed)
      const allInvitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      const pendingInvitations = allInvitations.filter((inv: any) => 
        inv.invitedUserId === userId && inv.status === 'pending'
      );
      console.log('📧 ReferralsSection: Found pending invitations:', pendingInvitations);
      setInvitations(pendingInvitations);
    } catch (error) {
      console.error('❌ ReferralsSection: Failed to load pending invitations:', error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      console.log('🎯 ReferralsSection: Accepting invitation:', invitation);
      
      // Accept the invitation in localStorage (AWS service removed)
      const allInvitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      const invitationIndex = allInvitations.findIndex((inv: any) => inv.id === invitation.id);
      if (invitationIndex !== -1) {
        allInvitations[invitationIndex].status = 'accepted';
        localStorage.setItem('invitations', JSON.stringify(allInvitations));
      }
      const invitationSuccess = true;
      console.log('✅ ReferralsSection: Invitation acceptance result:', invitationSuccess);
      
      if (!invitationSuccess) {
        throw new Error('Failed to accept invitation');
      }

      // Add user to the group in localStorage (AWS service removed)
      try {
        // Get current patient groups from localStorage
        const allPatients = JSON.parse(localStorage.getItem('patientGroups') || '[]');
        console.log('📋 ReferralsSection: All patient groups:', allPatients);
        console.log('🔍 ReferralsSection: Looking for group ID:', invitation.groupId);
        
        const groupIndex = allPatients.findIndex((group: any) => group.id === invitation.groupId);
        console.log('📍 ReferralsSection: Group index found:', groupIndex);
        
        if (groupIndex !== -1) {
          // Add member to the group
          const group = allPatients[groupIndex];
          if (!group.members) {
            group.members = [];
          }
          
          // Check if user is already a member
          const isAlreadyMember = group.members.some((member: any) => member.id === invitation.invitedUserId);
          
          if (!isAlreadyMember) {
            group.members.push({
              id: invitation.invitedUserId,
              name: invitation.invitedUserName,
              role: 'Member',
              status: 'active',
              joinedAt: new Date().toISOString()
            });
            
            // Update localStorage
            localStorage.setItem('patient_groups', JSON.stringify(allPatients));
            console.log(`✅ ReferralsSection: Added member ${invitation.invitedUserName} to group ${invitation.groupName}`);
            
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('memberAdded', {
              detail: {
                groupId: invitation.groupId,
                groupName: invitation.groupName,
                memberId: invitation.invitedUserId,
                memberName: invitation.invitedUserName
              }
            }));
          }
        }
      } catch (groupError) {
        console.error('❌ ReferralsSection: Error adding user to group:', groupError);
      }

      // Remove invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      toast({
        title: "Invitation Accepted",
        description: `You've joined ${invitation.groupName}`,
      });
      
      onInvitationAccepted?.(invitation);
      
    } catch (error) {
      console.error('❌ ReferralsSection: Failed to accept invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive"
      });
    }
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    try {
      console.log('🎯 ReferralsSection: Declining invitation:', invitation);
      // Decline the invitation in localStorage (AWS service removed)
      const allInvitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      const invitationIndex = allInvitations.findIndex((inv: any) => inv.id === invitation.id);
      if (invitationIndex !== -1) {
        allInvitations[invitationIndex].status = 'declined';
        localStorage.setItem('invitations', JSON.stringify(allInvitations));
      }
      const success = true;
      console.log('✅ ReferralsSection: Invitation decline result:', success);
      
      if (success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        toast({
          title: "Invitation Declined",
          description: `You've declined the invitation to ${invitation.groupName}`,
        });
        onInvitationDeclined?.(invitation);
      } else {
        throw new Error('Failed to decline invitation');
      }
    } catch (error) {
      console.error('❌ ReferralsSection: Failed to decline invitation:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <UserPlus2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No pending referrals</p>
        <p className="text-xs text-gray-400 mt-2">You'll see group invitations here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Pending Referrals</h3>
        <Badge variant="secondary">{invitations.length}</Badge>
      </div>

      {invitations.map((invitation) => (
        <Card key={invitation.id} className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {invitation.groupName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{invitation.groupName}</CardTitle>
                  <CardDescription>
                    Invited by {invitation.invitedByUserName}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(invitation.createdAt)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>You've been invited to join this patient group</p>
                <p className="text-xs mt-1">
                  Expires: {formatDate(invitation.expiresAt)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeclineInvitation(invitation)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAcceptInvitation(invitation)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


