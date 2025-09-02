
'use client';

import { useState } from 'react';
import type { Chat } from '@/lib/types';
import { mockChats } from '@/lib/mock-data';
import { ChatList } from '@/components/chat/chat-list';
import { ChatMessages } from '@/components/chat/chat-messages';

export default function ChatPage() {
  const [chats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] || null);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="col-span-1">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>
      <div className="col-span-1 md:col-span-2">
        <ChatMessages selectedChat={selectedChat} />
      </div>
    </div>
  );
}
