'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Search, UserCheck, UserMinus, UserPlus, Users, MessageSquare, Briefcase, ChevronDown, AlertCircle, CheckCircle, Star, Filter, Radio, UserPlus2, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import type { Chat } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { FilterModal } from './filter-modal';
import { BroadcastModal } from './broadcast-modal';
import { ReferralsSection } from './referrals-section';
import { awsPatientService } from '../../../chatservices/aws-patient-service-client';

const sidebarNavItems = [
    { name: 'All Patients', icon: Users, filter: null },
    { name: 'Active patient', icon: UserCheck, filter: 'Active' },
    { name: 'Discharge patient', icon: UserMinus, filter: 'Discharge' },
    { name: 'Transfer patient', icon: UserPlus, filter: 'Transfer' },
    { name: 'Hospitalized patient', icon: UserCheck, filter: 'Hospitalized' },
    { name: 'Pending SOC', icon: UserCheck, filter: 'Pending SOC' },
];


interface ChatListProps {
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

function ChatTypeDropdown({ onFilterChange }: { onFilterChange: (filter: string | null) => void }) {
    const [selectedItem, setSelectedItem] = useState(sidebarNavItems[0]);

    const handleSelect = (item: typeof sidebarNavItems[0]) => {
        setSelectedItem(item);
        onFilterChange(item.filter);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <selectedItem.icon className="h-4 w-4" />
                        {selectedItem.name}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
                {sidebarNavItems.map((item) => (
                    <DropdownMenuItem
                        key={item.name}
                        onClick={() => handleSelect(item)}
                        className={cn(
                            "flex items-center gap-2",
                            selectedItem.name === item.name && "bg-accent"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
    const [patientGroups, setPatientGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Patients');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const selectedChatRef = useRef(selectedChat);
    
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);



    // Fetch patient groups function
        const fetchPatientGroups = async () => {
            try {
                setLoading(true);
                console.log('🏗️ Simple Chat List: Fetching patient groups from AWS...');
                
                // Initialize service on client side
                awsPatientService.initialize();
                
                // Connect to AWS service if not already connected
                if (!awsPatientService.getCurrentUser()) {
                    await awsPatientService.connectWebSocket();
                }
                
                // Get patient groups from AWS
                const userGroups = await awsPatientService.getPatientGroups();
                console.log('📊 Simple Chat List: AWS groups received:', userGroups.length);
                
                // Fetch members and last message for each group
                const groupsWithMembers = await Promise.all(
                    userGroups.map(async (group: any) => {
                        const membersResult = await awsPatientService.getGroupMembers(group.groupId);
                        const messages = await awsPatientService.getGroupMessages(group.groupId);
                        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                        
                        return {
                            ...group,
                            members: membersResult.success ? membersResult.members : [],
                            lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
                            timestamp: group.status || 'Pending SOC'
                        };
                    })
                );
                
                console.log('📊 Simple Chat List: Groups with members:', groupsWithMembers);
                setPatientGroups(groupsWithMembers);
                console.log('✅ Simple Chat List: Patient groups set successfully');
            } catch (error) {
                console.error('❌ Simple Chat List: Error fetching patient groups:', error);
                setPatientGroups([]);
            } finally {
                setLoading(false);
            }
        };

    // Fetch patient groups on component mount
    useEffect(() => {
        fetchPatientGroups();
    }, []);

    // Listen for patient group creation and storage changes
    useEffect(() => {
        const handlePatientGroupCreated = (event) => {
            console.log('📢 Simple Chat List: Received patientGroupCreated event:', event.detail);
            setTimeout(() => fetchPatientGroups(), 1000);
        };

        const handlePatientGroupDeleted = (event) => {
            console.log('📢 Simple Chat List: Received patientGroupDeleted event:', event.detail);
            fetchPatientGroups();
        };

        const handleStorageChange = () => {
            console.log('📢 Simple Chat List: Storage changed, refreshing groups...');
            fetchPatientGroups();
        };

        const handleMemberAdded = (event) => {
            console.log('📢 Simple Chat List: Received memberAdded event:', event.detail);
            setTimeout(() => fetchPatientGroups(), 500);
        };

        const handleMemberRemoved = (event) => {
            console.log('📢 Simple Chat List: Received memberRemoved event:', event.detail);
            fetchPatientGroups();
        };

        window.addEventListener('patientGroupCreated', handlePatientGroupCreated);
        window.addEventListener('patientGroupDeleted', handlePatientGroupDeleted);
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('memberAdded', handleMemberAdded);
        window.addEventListener('memberRemoved', handleMemberRemoved);
        
        return () => {
            window.removeEventListener('patientGroupCreated', handlePatientGroupCreated);
            window.removeEventListener('patientGroupDeleted', handlePatientGroupDeleted);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('memberAdded', handleMemberAdded);
            window.removeEventListener('memberRemoved', handleMemberRemoved);
        };
    }, []);

    // Listen for SOC template submission and group status updates
    useEffect(() => {
        const handleGroupStatusUpdated = (event: CustomEvent) => {
            console.log('🎯 Chat list received groupStatusUpdated event!', event);
            const { groupId, status } = event.detail;
            console.log('Updating group status for:', groupId, 'to:', status);
            setPatientGroups(prev => {
                return prev.map(group => {
                    if (group.groupId === groupId) {
                        console.log('Found matching group, updating status to:', status);
                        return {
                            ...group,
                            status: status
                        };
                    }
                    return group;
                });
            });
        };

        const handleMessageReceived = (event: CustomEvent) => {
            const { groupId, message, timestamp } = event.detail;
            setPatientGroups(prev => prev.map(group => {
                if (group.groupId === groupId) {
                    const isCurrentChat = selectedChatRef.current?.id === groupId;
                    let isSOCTemplate = false;
                    try {
                        if (typeof message === 'string' && message.startsWith('{')) {
                            const parsed = JSON.parse(message);
                            if (parsed.type === 'SOC_TEMPLATE') isSOCTemplate = true;
                        }
                    } catch {}
                    
                    return {
                        ...group,
                        lastMessage: message,
                        unreadCount: isCurrentChat ? 0 : (group.unreadCount || 0) + 1
                    };
                }
                return group;
            }));
        };

        console.log('Adding groupStatusUpdated listener');
        window.addEventListener('groupStatusUpdated', handleGroupStatusUpdated as EventListener);
        window.addEventListener('chatMessageReceived', handleMessageReceived as EventListener);
        return () => {
            window.removeEventListener('groupStatusUpdated', handleGroupStatusUpdated as EventListener);
            window.removeEventListener('chatMessageReceived', handleMessageReceived as EventListener);
        };
    }, []);
    

    
    // Convert patient groups to chat format
    console.log('🔄 Simple Chat List: Converting patient groups to chat format...');
    console.log('🔄 Simple Chat List: Patient groups to convert:', patientGroups?.length || 0);
    console.log('🔄 Simple Chat List: Patient groups data:', patientGroups);
    
    // Safety check: ensure patientGroups is an array and deduplicate by id/groupId
    const safePatientGroups = Array.isArray(patientGroups) 
        ? Array.from(new Map(patientGroups.map(g => [g.groupId || g.id, g])).values())
        : [];
    
    const getMemberTags = (members: any[]) => {
        if (!members || members.length === 0) return [];
        return members
            .map(m => {
                const role = m.role?.toLowerCase() || '';
                if (role.includes('skilled') && role.includes('nurse')) return 'SN';
                if (role.includes('physical') && role.includes('therapy') && !role.includes('assistant')) return 'PT';
                if (role.includes('occupational') && role.includes('therapy') && !role.includes('assistant')) return 'OT';
                if (role.includes('licensed') && role.includes('practical')) return 'LPN';
                if (role.includes('physical') && role.includes('assistant')) return 'PTA';
                if (role.includes('occupational') && role.includes('assistant')) return 'COTA';
                if (role.includes('social') && role.includes('worker')) return 'MSW';
                if (role.includes('health') && role.includes('aid')) return 'HHA';
                return null;
            })
            .filter(Boolean);
    };

    const chats: Chat[] = safePatientGroups.map((group: any) => {
        const patientName = group.fullName || group.name || 'Unknown Group';
        const memberTags = getMemberTags(group.members || []);
        
        return {
            id: group.groupId || group.id,
            name: `Patient Name: ${patientName}`,
            lastMessage: group.lastMessage,
            timestamp: group.status || 'Pending SOC',
            unreadCount: selectedChat?.id === (group.groupId || group.id) ? 0 : (group.unreadCount || 0),
            status: group.status || 'active',
            isGroup: true,
            members: group.members || [],
            memberTags,
            createdBy: group.createdBy,
            createdAt: group.createdAt,
            dateOfBirth: group.dateOfBirth,
            contactNumber: group.contactNumber,
            homeAddress: group.homeAddress,
            primaryPhysicianName: group.primaryPhysicianName,
            insurance: group.insurance,
            socProvider: group.socProvider,
            patientTag: group.patientTag,
            emergencyPersonName: group.emergencyPersonName,
            emergencyContact: group.emergencyContact,
            city: group.city,
            state: group.state,
            zipCode: group.zipCode
        };
    });
    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === null || chat.timestamp === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'inactive': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'inactive': return 'text-red-600';
            default: return 'text-green-600';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Chats</h2>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full max-h-screen overflow-hidden">
             <div className="p-4 border-b">
                <div className="flex items-center justify-end mb-4">
                    <div className="flex items-center gap-2 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 h-10"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                                <Button 
                            variant="outline"
                            className="flex-1 h-10"
                            onClick={() => setIsFilterModalOpen(true)}
                                >
                            <Filter className="h-4 w-4" />
                                </Button>
                                    <Button 
                            variant="outline"
                            className="flex-1 h-10"
                            onClick={() => setIsBroadcastModalOpen(true)}
                                    >
                            <Radio className="h-4 w-4" />
                                    </Button>
                                    <Button 
                            variant="outline"
                            className="flex-1 h-10"
                            onClick={() => {/* TODO: Add knowledge modal functionality */}}
                                    >
                            <BookOpen className="h-4 w-4" />
                                    </Button>
                                    <Button 
                            variant="outline"
                            className="flex-1 h-10"
                            onClick={() => {/* TODO: Add priority message functionality */}}
                                    >
                            <AlertTriangle className="h-4 w-4" />
                                    </Button>
                    </div>
                </div>
                
                {/* Navigation Bar */}
                <div className="mb-4">
                    <div className="bg-gray-200 rounded-lg px-2 py-2 shadow-sm border">
                        <div className="flex justify-between items-center">
                            <button 
                                onClick={() => setActiveTab('Patients')}
                                className={`font-medium text-xs transition-colors px-2 py-1 rounded ${
                                    activeTab === 'Patients' 
                                        ? 'text-gray-900 bg-white shadow-sm' 
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Patients
                            </button>
                            <button 
                                onClick={() => setActiveTab('Internal groups')}
                                className={`font-medium text-xs transition-colors px-2 py-1 rounded ${
                                    activeTab === 'Internal groups' 
                                        ? 'text-gray-900 bg-white shadow-sm' 
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Internal groups
                            </button>
                            <button 
                                onClick={() => setActiveTab('Individual')}
                                className={`font-medium text-xs transition-colors px-2 py-1 rounded ${
                                    activeTab === 'Individual' 
                                        ? 'text-gray-900 bg-white shadow-sm' 
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Individual
                            </button>
                            <button 
                                onClick={() => setActiveTab('Contacts')}
                                className={`font-medium text-xs transition-colors px-2 py-1 rounded ${
                                    activeTab === 'Contacts' 
                                        ? 'text-gray-900 bg-white shadow-sm' 
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Contacts
                            </button>
                        </div>
                    </div>
                </div>
                
                {isSearchVisible && (
                    <div className="mb-4">
                        <Input
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                )}
                
                <ChatTypeDropdown onFilterChange={setStatusFilter} />
            </div>
            
            <ScrollArea className="flex-1 max-h-[calc(100vh-200px)]">
                <div className="p-4 space-y-2">
                    {filteredChats.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No chats found</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {searchTerm ? 'Try adjusting your search terms' : 'Create a new chat to get started'}
                            </p>
                        </div>
                    ) : (
                        filteredChats.map((chat) => (
                            <Card
                                key={chat.id}
                                className={cn(
                                    "p-4 cursor-pointer transition-colors hover:bg-accent",
                                    selectedChat?.id === chat.id && "bg-gray-200 border-gray-400",
                                    chat.unreadCount > 0 && selectedChat?.id !== chat.id && "bg-green-50"
                                )}
                                onClick={() => {
                                    console.log('🖱️ Chat List: Chat clicked:', chat);
                                    console.log('🖱️ Chat List: Chat ID:', chat.id);
                                    console.log('🖱️ Chat List: Chat name:', chat.name);
                                    onSelectChat(chat);
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium truncate">{chat.name}</h3>
                                            <span className={cn(
                                                "text-xs text-white px-2 py-1 rounded",
                                                chat.timestamp === 'Active' ? 'bg-green-500' : 
                                                chat.timestamp === 'Hospitalized' ? 'bg-orange-500' : 
                                                chat.timestamp === 'Transfer' ? 'bg-orange-700' : 
                                                chat.timestamp === 'Discharge' ? 'bg-gray-500' : 'bg-red-500'
                                            )}>
                                                {chat.timestamp || 'Pending SOC'}
                                            </span>
                                        </div>
                                        {chat.memberTags && chat.memberTags.length > 0 && (
                                            <div className="flex gap-1 mt-1">
                                                {chat.memberTags.map((tag, idx) => (
                                                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end mt-2">
                                            {chat.unreadCount > 0 && (
                                                <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            ))
                    )}
                </div>
            </ScrollArea>
            
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <FilterModal 
                    setOpen={setIsFilterModalOpen} 
                />
            </Dialog>
            
            <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
                <BroadcastModal 
                    setOpen={setIsBroadcastModalOpen} 
                />
            </Dialog>
        </div>
    );
}