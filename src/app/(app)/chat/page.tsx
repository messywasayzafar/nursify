
'use client';

import { ChatList } from '@/components/chat/chat-list';
import { ChatMessages } from '@/components/chat/chat-messages';
import { mockChats } from '@/lib/mock-data';
import type { Chat } from '@/lib/types';
import { useState } from 'react';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[2]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="col-span-1">
        <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      </div>
      <div className="col-span-1 md:col-span-2">
        <ChatMessages selectedChat={selectedChat} />
      </div>
    </div>
  );
}
