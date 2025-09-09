
'use client';

import { useState, useMemo } from 'react';
import type { Chat, Message } from '@/lib/types';
import { mockMessages } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Search, ClipboardList, AlertCircle, MoreVertical, Info, UserCheck, Star, Eye, Copy, Stethoscope, Reply, Forward, RefreshCw, Trash2, ArrowUpCircle, Plus, Camera, AlarmClock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { EditPatientSheet } from './edit-patient-sheet';


interface ChatMessagesProps {
  selectedChat: Chat | null;
}

const templates = [
  'Start Of Care - SOC',
  'Resumption Of Care - ROC',
  'Recertification',
  'Transfer',
  'Transfer Discharge',
  'Discharge OASIS',
  'Change Frequency',
  'Therapy Evaluation',
  'Therapy Reassessment',
];

export function ChatMessages({ selectedChat }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);

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

  const handleTemplateSelect = (template: string) => {
    setNewMessage(template);
  };

  if (!selectedChat) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  const messageMenuItems = [
    { label: 'Info', icon: Info },
    { label: 'Ask for Acknowledgement', icon: UserCheck },
    { label: 'Star message', icon: Star },
    { label: 'Visible to Patient', icon: Eye },
    { label: 'Copy', icon: Copy },
    { label: 'Visible to Physician', icon: Stethoscope },
    { label: 'Reply', icon: Reply },
    { label: 'Forward', icon: Forward },
    { label: 'Resend', icon: RefreshCw },
    { label: 'Delete', icon: Trash2 },
  ];

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 border-b p-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
            <p><span className="font-semibold">Patient Name:</span> {selectedChat.name}</p>
            <p><span className="font-semibold">Start of Care Date:</span> 06/14/2025</p>
            <p><span className="font-semibold">Physician Name:</span></p>
            <p><span className="font-semibold">Episode Date:</span> 6/14/2025 - 08/12/2025</p>
            <p><span className="font-semibold">SN, PT, OT</span></p>
            <p><span className="font-semibold">Contacts:</span></p>
            <p><span className="font-semibold">Insurance:</span></p>
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
          <Sheet open={isPatientSheetOpen} onOpenChange={setIsPatientSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline">Edit Patient</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md p-0">
                <EditPatientSheet patient={selectedChat} setOpen={setIsPatientSheetOpen} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2 group',
                message.sender === 'You' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender !== 'You' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                  <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex items-center gap-1">
                {message.sender === 'You' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {messageMenuItems.map((item) => (
                        <DropdownMenuItem key={item.label}>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                {message.sender !== 'You' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {messageMenuItems.map((item) => (
                        <DropdownMenuItem key={item.label}>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t bg-muted/40 p-4">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            placeholder="Type a message..."
            className="pr-48 bg-background h-12 rounded-full pl-12"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                    <Plus />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem>
                    <Camera className="mr-2 h-4 w-4" />
                    <span>Camera</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlarmClock className="mr-2 h-4 w-4" />
                    <span>Reminder</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Live Location</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
                <AlertCircle />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                  <ClipboardList />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {templates.map((template) => (
                  <DropdownMenuItem key={template} onSelect={() => handleTemplateSelect(template)}>
                    {template}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="ghost" size="icon" className="rounded-full"><Paperclip /></Button>
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
