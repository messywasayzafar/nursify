
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, UserCheck, UserMinus, UserPlus, Users, MessageSquare, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import type { Chat } from '@/lib/types';
import { mockChats } from '@/lib/mock-data';

const sidebarNavItems = [
    { name: 'Active patient', icon: UserCheck },
    { name: 'Discharge patient', icon: UserMinus },
    { name: 'Transfer patient', icon: UserPlus },
    { name: 'Internal groups', icon: Users },
    { name: 'Individual', icon: MessageSquare },
    { name: 'Contacts', icon: Briefcase },
];

const patients = [
    { name: 'Dummy 1', disciplines: 'SN, PT, OT', episodeDate: '01/01/2025 - 03/01/2025', status: 'Pending SOC' },
    { name: 'Dummy 2', disciplines: 'SN, PT, OT', episodeDate: '01/15/2025 - 03/15/2025', status: null },
    { name: 'Dummy 3', disciplines: 'SN, PT, OT', episodeDate: '02/01/2025 - 04/01/2025', status: null },
    { name: 'Dummy 4', disciplines: 'SN, PT, OT', episodeDate: '02/10/2025 - 04/10/2025', status: 'Pending SOC' },
    { name: 'Dummy 5', disciplines: 'SN, PT, OT', episodeDate: '03/05/2025 - 05/05/2025', status: null },
    { name: 'Dummy 6', disciplines: 'SN, PT, OT', episodeDate: '03/20/2025 - 05/20/2025', status: 'Pending SOC' },
];

interface ChatListProps {
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <div className="bg-muted/40 p-2 space-y-2 flex flex-col items-center">
            {sidebarNavItems.map((item, index) => (
                <Button
                    key={item.name}
                    variant={activeIndex === index ? 'secondary' : 'ghost'}
                    className="w-full h-auto py-2 flex flex-col items-center justify-center"
                    onClick={() => setActiveIndex(index)}
                >
                    <div className={cn(
                        "rounded-full h-6 w-6 flex items-center justify-center mb-1",
                        activeIndex === index ? 'bg-primary text-primary-foreground' : 'bg-gray-300'
                    )}>
                        <item.icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs text-center">{item.name}</span>
                </Button>
            ))}
        </div>
    );
}

function PatientList({ selectedChat, onSelectChat }: ChatListProps) {
    const [selectedIndex, setSelectedIndex] = useState(2);
    
    // Using mockChats for demonstration as patients array doesn't map to chat objects
    const chats = mockChats;

    const handleSelect = (chat: Chat, index: number) => {
        onSelectChat(chat);
        setSelectedIndex(index);
    }
    
    return (
        <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search Patients" className="pl-8" />
                </div>
            </div>
            <ScrollArea className="h-0 flex-grow">
                <div className="p-2 space-y-2">
                    {patients.map((patient, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                "w-full text-left p-3 rounded-md border",
                                selectedIndex === index ? "bg-primary text-primary-foreground" : "bg-card"
                            )}
                        >
                            <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2">
                                <div className="flex-grow">
                                    <p className="font-semibold">Patient Name: {patient.name}</p>
                                    <p className="text-sm">SN, PT, OT: {patient.disciplines}</p>
                                    <p className="text-sm">Episode Date: {patient.episodeDate}</p>
                                </div>
                                {patient.status && (
                                    <div className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded shrink-0 mt-1 sm:mt-0">
                                        {patient.status}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

export function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
    return (
        <Card className="h-full flex flex-row p-0 overflow-hidden">
            <Sidebar />
            <PatientList selectedChat={selectedChat} onSelectChat={onSelectChat} />
        </Card>
    );
}
