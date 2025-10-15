
'use client';

import { ChatList } from '@/components/chat/chat-list';
import { ChatMessages } from '@/components/chat/chat-messages';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePageTitle } from '@/components/layout/header';
import type { Chat } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { NewPatientGroupModal } from '@/components/chat/new-patient-group-modal';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { setPageTitle } = usePageTitle();
  const [isNewPatientGroupModalOpen, setIsNewPatientGroupModalOpen] = useState(false);

  useEffect(() => {
    setPageTitle('Chats');
    return () => setPageTitle('');
  }, [setPageTitle]);

  return (
    <div className="fixed inset-0 top-[12rem] bottom-0 flex">
        <div className="w-1/3 h-full border-r">
            <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
        </div>
        <div className="flex-1 h-full">
            <ChatMessages selectedChat={selectedChat} />
        </div>
    </div>
  );
}
