'use client';

import { useState } from 'react';
import { Search, Edit, Plus, Clock, ClipboardList, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isFromPatient?: boolean;
  isFromUser?: boolean;
  avatar?: string;
}

interface PatientDetails {
  name: string;
  physician: string;
  disciplines: string;
  insurance: string;
  startOfCare: string;
  episodeDate: string;
  contact: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: "Hi Susan, could you check on Mr. Smith's PT schedule for next week?",
    sender: 'You',
    timestamp: '9:40 AM',
    isFromUser: true,
  },
  {
    id: '2',
    content: "Sure, I will check and get back to you shortly.",
    sender: 'Susan',
    timestamp: '9:42 AM',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '3',
    content: "I have a question about my medication.",
    sender: 'Patient',
    timestamp: 'Yesterday',
    isFromPatient: true,
  },
];

const mockPatientDetails: PatientDetails = {
  name: 'Maria Garcia',
  physician: 'N/A',
  disciplines: 'N/A',
  insurance: 'N/A',
  startOfCare: 'N/A',
  episodeDate: 'N/A',
  contact: 'N/A',
};

export function PatientChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [patientDetails] = useState<PatientDetails>(mockPatientDetails);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Patient Details Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Patient Name:</span>
                <p className="font-medium">{patientDetails.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Physician Name:</span>
                <p className="font-medium">{patientDetails.physician}</p>
              </div>
              <div>
                <span className="text-gray-500">Disciplines:</span>
                <p className="font-medium">{patientDetails.disciplines}</p>
              </div>
              <div>
                <span className="text-gray-500">Insurance:</span>
                <p className="font-medium">{patientDetails.insurance}</p>
              </div>
              <div>
                <span className="text-gray-500">Start of Care Date:</span>
                <p className="font-medium">{patientDetails.startOfCare}</p>
              </div>
              <div>
                <span className="text-gray-500">Episode Date:</span>
                <p className="font-medium">{patientDetails.episodeDate}</p>
              </div>
              <div>
                <span className="text-gray-500">Contact:</span>
                <p className="font-medium">{patientDetails.contact}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'} ${
                  message.isFromPatient ? 'relative' : ''
                }`}
              >
                {message.isFromPatient && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-full"></div>
                )}
                <div className={`flex items-start gap-3 max-w-[70%] ${message.isFromUser ? 'flex-row-reverse' : ''}`}>
                  {!message.isFromUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback>
                        {message.sender.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${message.isFromUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.isFromUser
                          ? 'bg-green-500 text-white'
                          : message.isFromPatient
                          ? 'bg-gray-100 text-gray-900 border-l-4 border-red-500'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                      {message.isFromUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <span className="text-gray-400">⋮</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Reply</DropdownMenuItem>
                            <DropdownMenuItem>Forward</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button variant="outline" size="icon" type="button">
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button variant="outline" size="icon" type="button">
              <Clock className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" type="button">
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" type="button">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" className="bg-green-500 hover:bg-green-600">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
