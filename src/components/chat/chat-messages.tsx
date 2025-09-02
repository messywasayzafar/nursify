
'use client';

import { useState, useMemo } from 'react';
import type { Chat, Message } from '@/lib/types';
import { mockMessages } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Smile, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessagesProps {
  selectedChat: Chat | null;
}

export function ChatMessages({ selectedChat }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const filteredMessages = useMemo(() => {
    if (!searchTerm) {
      return messages;
    }
    return messages.filter((message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

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

  if (!selectedChat) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
        <div className="grid gap-1">
          <p className="font-semibold">Patient: {selectedChat.name}</p>
          <p className="text-sm text-muted-foreground">
            SOC: 06/14/2025 | Episode: 6/14/2025 - 08/12/2025
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSearchVisible ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => setIsSearchVisible(false)}
                autoFocus
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button variant="outline">Edit Patient</Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {filteredMessages.map((message) => (
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
                  'max-w-[80%] sm:max-w-md rounded-lg p-3',
                  message.sender === 'You'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none',
                  message.isPatient && 'border-l-4 border-destructive'
                )}
              >
                {message.isPatient && <p className="text-xs font-bold mb-1">From Patient</p>}
                <p className="text-sm break-words">{message.content}</p>
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
    </div>
  );
}
