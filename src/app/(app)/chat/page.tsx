
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockChats, mockMessages } from '@/lib/mock-data';
import type { Chat, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, Send, User, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ChatPage() {
  const [chats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] || null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedChat) return;

    const newMsg: Message = {
      id: `m${messages.length + 1}`,
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <Card className="w-1/3 flex flex-col">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 p-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-accent',
                    selectedChat?.id === chat.id && 'bg-accent font-semibold'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>
                      {chat.type === 'group' ? <Users /> : <User />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <div className="flex items-baseline justify-between">
                      <p className="truncate font-medium">{chat.name}</p>
                      <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {chat.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="flex w-2/3 flex-col">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-4 border-b bg-muted/40 p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                <AvatarFallback>
                  {selectedChat.type === 'group' ? <Users /> : <User />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-medium">{selectedChat.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedChat.type === 'group' ? 'Group Chat' : 'Direct Message'}
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex items-end gap-2',
                      message.sender === 'You' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-xs rounded-lg p-3 md:max-w-md',
                        message.sender === 'You'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                        message.isPatient && 'border-l-4 border-destructive'
                      )}
                    >
                      {message.isPatient && <p className="text-xs font-bold mb-1">From Patient</p>}
                      <p className="text-sm">{message.content}</p>
                      <p className="mt-1 text-right text-xs opacity-70">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t bg-muted/40 p-4">
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  placeholder="Type a message..."
                  className="pr-12"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
