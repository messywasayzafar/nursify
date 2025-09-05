
'use client';

import { ChatList } from '@/components/chat/chat-list';
import { ChatMessages } from '@/components/chat/chat-messages';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePageTitle } from '@/components/layout/header';
import { mockChats } from '@/lib/mock-data';
import type { Chat } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { NewPatientGroupModal } from '@/components/chat/new-patient-group-modal';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[2]);
  const { setPageTitle } = usePageTitle();
  const [isNewPatientGroupModalOpen, setIsNewPatientGroupModalOpen] = useState(false);

  useEffect(() => {
    setPageTitle('Chats');
    return () => setPageTitle('');
  }, [setPageTitle]);

  return (
    <div className="flex flex-col flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            <div className="col-span-1 h-full">
                <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
            </div>
            <div className="col-span-1 md:col-span-2 h-full">
                <ChatMessages selectedChat={selectedChat} />
            </div>
        </div>
    </div>
  );
}
