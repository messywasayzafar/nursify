
'use client';

import { useState } from 'react';
import type { Chat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sub-component for the header section
function ChatListHeader() {
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chats</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">New Chat</Button>
          <Button variant="outline" size="sm">New Group</Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8 bg-muted" />
      </div>
    </div>
  );
}

// Sub-component for the filter tabs
function ChatTabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void; }) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="unread">Unread</TabsTrigger>
        <TabsTrigger value="support">Support</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// Sub-component for a single chat item in the list
function ChatListItem({ chat, selectedChat, onSelectChat }: { chat: Chat; selectedChat: Chat | null; onSelectChat: (chat: Chat) => void; }) {
  const isSelected = selectedChat?.id === chat.id;
  return (
    <button
      onClick={() => onSelectChat(chat)}
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-muted',
        isSelected && 'bg-primary text-primary-foreground'
      )}
    >
      <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-green-500">
        <AvatarImage src={chat.avatar} alt={chat.name} />
        <AvatarFallback>
          {chat.type === 'group' ? <Users /> : <User />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <p className="truncate font-semibold">{chat.name}</p>
        <p className={cn("truncate text-sm", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {chat.lastMessage}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className={cn("text-xs", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {chat.timestamp}
        </p>
        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
            {chat.unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
}

export function ChatList({ chats, selectedChat, setSelectedChat }: ChatListProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'groups') return chat.type === 'group';
    if (activeTab === 'unread') return chat.unreadCount && chat.unreadCount > 0;
    // 'support' tab filtering logic would go here
    return true;
  });

  return (
    <Card className="h-full flex flex-col">
      <ChatListHeader />
      <ChatTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-1 p-2">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
