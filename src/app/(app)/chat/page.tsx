
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockChats, mockMessages } from '@/lib/mock-data';
import type { Chat, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, Send, User, Users, Paperclip, Smile, Phone, Video, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ChatPage() {
  const [chats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] || null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'groups') return chat.type === 'group';
    if (activeTab === 'unread') return chat.unreadCount && chat.unreadCount > 0;
    // 'support' tab filtering logic would go here if we had support chats
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <Card className="w-1/3 flex flex-col">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
        </Tabs>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 p-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-muted',
                    selectedChat?.id === chat.id && 'bg-primary text-primary-foreground'
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
                    <p className={cn("truncate text-sm", selectedChat?.id === chat.id ? "text-primary-foreground/80" : "text-muted-foreground")}>{chat.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className={cn("text-xs", selectedChat?.id === chat.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{chat.timestamp}</p>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="flex w-2/3 flex-col bg-card rounded-lg border">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-4 border-b p-4">
              <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-green-500">
                <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                <AvatarFallback>
                  {selectedChat.type === 'group' ? <Users /> : <User />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-lg font-bold">{selectedChat.name}</p>
                <p className="text-sm text-green-500 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Active Now
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Phone /></Button>
                <Button variant="ghost" size="icon"><Video /></Button>
                <Button variant="ghost" size="icon"><Info /></Button>
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
                     {message.sender !== 'You' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                            <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                     )}
                    <div
                      className={cn(
                        'max-w-md rounded-lg p-3',
                        message.sender === 'You'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none',
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
                  className="pr-24 bg-background h-12 rounded-full"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <Button type="button" variant="ghost" size="icon"><Paperclip /></Button>
                    <Button type="button" variant="ghost" size="icon"><Smile /></Button>
                    <Button type="submit" size="icon" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 w-9 h-9">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
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
