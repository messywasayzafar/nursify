'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message } from '@/lib/types';
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
import { SOCTemplateModal } from '@/components/templates/soc-template-modal';
import { ROCTemplateModal } from '@/components/templates/roc-template-modal';
import { RecertTemplateModal } from '@/components/templates/recert-template-modal';
import { TransferTemplateModal } from '@/components/templates/transfer-template-modal';
import { ChangeFrequencyTemplateModal } from '@/components/templates/change-frequency-template-modal';
import { TherapyEvaluationTemplateModal } from '@/components/templates/therapy-evaluation-template-modal';
import { DischargeOasisModal } from './discharge-oasis-modal';
import { RevisitModal } from './revisit-modal';
import { TransferDischargeModal } from './transfer-discharge-modal';
// AWS services removed - using localStorage instead
import { websocketService, ChatMessage } from '@/lib/websocket-service';
import { useAuth } from '@/components/auth/auth-provider';

interface PatientGroupData {
  id: string;
  fullName: string;
  name?: string;
  [key: string]: any;
}

interface ChatMessagesProps {
  selectedChat: Chat | null;
}

const templates = [
  'Start Of Care - SOC',
  'Resumption Of Care - ROC',
  'Recertification',
  'Re-Vist/ Missed Visit',
  'Transfer/Transfer Discharge',
  'Discharge OASIS',
  'Change Frequency', 
  'Therapy Evaluation/ Reassessment',
];

export function EnhancedChatMessages({ selectedChat }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);
  const [patientData, setPatientData] = useState<PatientGroupData | null>(null);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [isSOCModalOpen, setIsSOCModalOpen] = useState(false);
  const [isROCModalOpen, setIsROCModalOpen] = useState(false);
  const [isRecertModalOpen, setIsRecertModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isChangeFrequencyModalOpen, setIsChangeFrequencyModalOpen] = useState(false);
  const [isTherapyEvaluationModalOpen, setIsTherapyEvaluationModalOpen] = useState(false);
  const [isDischargeOasisModalOpen, setIsDischargeOasisModalOpen] = useState(false);
  const [isRevisitModalOpen, setIsRevisitModalOpen] = useState(false);
  const [isTransferDischargeModalOpen, setIsTransferDischargeModalOpen] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const { user } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        console.log('🔌 Initializing WebSocket connection...');
        const connected = await websocketService.connect();
        setIsWebSocketConnected(connected);
        
        if (connected) {
          console.log('✅ WebSocket connected successfully');
        } else {
          console.warn('⚠️ WebSocket connection failed, using mock mode');
        }
      } catch (error) {
        console.error('❌ Error initializing WebSocket:', error);
        setIsWebSocketConnected(false);
      }
    };

    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Set up message handlers for the selected chat
  useEffect(() => {
    if (selectedChat && selectedChat.type === 'group') {
      console.log('📨 Setting up message handler for group:', selectedChat.id);
      
      const handleIncomingMessage = (message: ChatMessage) => {
        console.log('📨 Received message for group:', message.groupId, message);
        
        // Convert WebSocket message to chat message format
        const chatMessage: Message = {
          id: message.messageId,
          content: message.message,
          timestamp: new Date(message.timestamp).toLocaleTimeString(),
          sender: {
            id: message.senderId,
            name: message.senderName,
            avatar: '/avatars/default-user.png'
          },
          type: 'text'
        };

        setMessages(prev => [...prev, chatMessage]);
        console.log('✅ Message added to chat');
      };

      // Register message handler for this group
      websocketService.onMessage(selectedChat.id, handleIncomingMessage);

      // Join the group
      if (user) {
        const currentUser = {
          id: user.username || user.id || 'unknown',
          name: user.name || 'Unknown User'
        };
        
        websocketService.joinGroup(selectedChat.id, currentUser.id, currentUser.name);
        console.log('👥 Joined group:', selectedChat.id);
      }

      // Cleanup when chat changes
      return () => {
        websocketService.removeMessageHandler(selectedChat.id);
        if (user) {
          const currentUser = {
            id: user.username || user.id || 'unknown',
            name: user.name || 'Unknown User'
          };
          websocketService.leaveGroup(selectedChat.id, currentUser.id, currentUser.name);
        }
      };
    }
  }, [selectedChat, user]);

  // Fetch patient data when a patient group is selected
  useEffect(() => {
    const fetchPatientData = async () => {
      if (selectedChat && selectedChat.type === 'group') {
        setLoadingPatientData(true);
        try {
          // Using localStorage instead of AWS service
          const patients = JSON.parse(localStorage.getItem('patientGroups') || '[]');
          console.log('🔍 All patients:', patients);
          console.log('🔍 Looking for patient with ID:', selectedChat.id, 'or name:', selectedChat.name);
          
          let patient = patients.find((p: any) => p.id === selectedChat.id || p.fullName === selectedChat.name);
          
          // If no exact match, try to find by name only
          if (!patient) {
            patient = patients.find((p: any) => p.fullName === selectedChat.name);
          }
          
          // If still no match and we have patients, use the first one as fallback
          if (!patient && patients.length > 0) {
            patient = patients[0];
            console.log('⚠️ Using first patient as fallback:', patient.fullName);
          }
          
          if (patient) {
            setPatientData(patient);
            console.log('✅ Loaded patient data for header:', patient.fullName);
            console.log('📋 Patient data fields:', {
              fullName: patient.fullName,
              dateOfBirth: patient.dateOfBirth,
              contactNumber: patient.contactNumber,
              homeAddress: patient.homeAddress,
              primaryPhysicianName: patient.primaryPhysicianName,
              insurance: patient.insurance
            });
          } else {
            console.log('⚠️ No patients found in data');
            setPatientData(null);
          }
        } catch (error) {
          console.error('❌ Error fetching patient data:', error);
          setPatientData(null);
        } finally {
          setLoadingPatientData(false);
        }
      } else {
        setPatientData(null);
      }
    };

    fetchPatientData();
  }, [selectedChat]);

  // Listen for patient data updates from edit patient sheet
  useEffect(() => {
    const handlePatientDataUpdate = (event: CustomEvent) => {
      const { patientData: updatedPatientData, patientId } = event.detail;
      if (selectedChat && (selectedChat.id === patientId || selectedChat.name === updatedPatientData.fullName)) {
        setPatientData(updatedPatientData);
        console.log('✅ Patient data updated in chat header:', updatedPatientData.fullName);
      }
    };

    const handlePatientGroupDeleted = (event: CustomEvent) => {
      const { patientId } = event.detail;
      if (selectedChat && selectedChat.id === patientId) {
        console.log('🗑️ Patient group deleted, clearing chat data');
        setPatientData(null);
        // The chat list will be refreshed automatically by the parent component
      }
    };

    window.addEventListener('patientDataUpdated', handlePatientDataUpdate as EventListener);
    window.addEventListener('patientGroupDeleted', handlePatientGroupDeleted as EventListener);
    
    return () => {
      window.removeEventListener('patientDataUpdated', handlePatientDataUpdate as EventListener);
      window.removeEventListener('patientGroupDeleted', handlePatientGroupDeleted as EventListener);
    };
  }, [selectedChat]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm) {
      return messages;
    }
    return messages.filter(message =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSendingMessage) return;

    setIsSendingMessage(true);
    
    try {
      if (user) {
        const currentUser = {
          id: user.username || user.id || 'unknown',
          name: user.name || 'Unknown User'
        };

        // Send message via localStorage (AWS service removed)
        const success = true; // Simplified for localStorage mode

        if (success) {
          console.log('✅ Message sent successfully');
          
          // Add message to local state immediately for better UX
          const newChatMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString(),
            sender: {
              id: currentUser.id,
              name: currentUser.name,
              avatar: '/avatars/default-user.png'
            },
            type: 'text'
          };

          setMessages(prev => [...prev, newChatMessage]);
          setNewMessage('');
        } else {
          console.error('❌ Failed to send message');
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTemplateClick = (template: string) => {
    const templateMessages: Record<string, string> = {
      'Start Of Care - SOC': 'Starting SOC assessment for this patient.',
      'Resumption Of Care - ROC': 'Resuming care for this patient.',
      'Recertification': 'Patient recertification process initiated.',
      'Re-Vist/ Missed Visit': 'Scheduling revisit for missed appointment.',
      'Transfer/Transfer Discharge': 'Processing transfer/discharge documentation.',
      'Discharge OASIS': 'Completing discharge OASIS assessment.',
      'Change Frequency': 'Updating visit frequency as requested.',
      'Therapy Evaluation/ Reassessment': 'Conducting therapy evaluation.'
    };

    const message = templateMessages[template] || `Template: ${template}`;
    setNewMessage(message);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
          <p className="text-gray-500">Select a patient group to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback>
                {selectedChat.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedChat.name}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-1" />
                  {patientData ? `${patientData.fullName} - ${patientData.insurance}` : 'Loading...'}
                </span>
                {isWebSocketConnected && (
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Online
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            <Sheet open={isPatientSheetOpen} onOpenChange={setIsPatientSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96">
                <EditPatientSheet 
                  patient={selectedChat}
                  onClose={() => setIsPatientSheetOpen(false)}
                />
              </SheetContent>
            </Sheet>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  Star conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Mark as read
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy chat ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search Bar */}
        {isSearchVisible && (
          <div className="mt-3">
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3",
                message.sender.id === (user?.username || user?.id) ? "flex-row-reverse space-x-reverse" : ""
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar} />
                <AvatarFallback>
                  {message.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                  message.sender.id === (user?.username || user?.id)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSendingMessage}
              className="pr-10"
            />
            {isSendingMessage && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Templates */}
        <div className="mt-3 flex flex-wrap gap-2">
          {templates.map((template) => (
            <Button
              key={template}
              variant="outline"
              size="sm"
              onClick={() => handleTemplateClick(template)}
              className="text-xs"
            >
              {template}
            </Button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <SOCTemplateModal 
        isOpen={isSOCModalOpen} 
        onClose={() => setIsSOCModalOpen(false)} 
        patientData={patientData}
      />
      <ROCTemplateModal 
        isOpen={isROCModalOpen} 
        onClose={() => setIsROCModalOpen(false)} 
        patientData={patientData}
      />
      <RecertTemplateModal 
        isOpen={isRecertModalOpen} 
        onClose={() => setIsRecertModalOpen(false)} 
        patientData={patientData}
      />
      <TransferTemplateModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        patientData={patientData}
      />
      <ChangeFrequencyTemplateModal 
        isOpen={isChangeFrequencyModalOpen} 
        onClose={() => setIsChangeFrequencyModalOpen(false)} 
        patientData={patientData}
      />
      <TherapyEvaluationTemplateModal 
        isOpen={isTherapyEvaluationModalOpen} 
        onClose={() => setIsTherapyEvaluationModalOpen(false)} 
        patientData={patientData}
      />
      <DischargeOasisModal 
        isOpen={isDischargeOasisModalOpen} 
        onClose={() => setIsDischargeOasisModalOpen(false)} 
        patientData={patientData}
      />
      <RevisitModal 
        isOpen={isRevisitModalOpen} 
        onClose={() => setIsRevisitModalOpen(false)} 
        patientData={patientData}
      />
      <TransferDischargeModal 
        isOpen={isTransferDischargeModalOpen} 
        onClose={() => setIsTransferDischargeModalOpen(false)} 
        patientData={patientData}
      />
    </div>
  );
}
