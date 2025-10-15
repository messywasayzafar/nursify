
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
import { DischargeTemplateModal } from '@/components/templates/discharge-template-modal';
import { awsPatientService } from '../../../chatservices/aws-patient-service-client';

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
  'Evaluation/ Reassessment',
];

export function ChatMessages({ selectedChat }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'You', content: 'This is my sent message', timestamp: '10:00 AM' },
    { id: '2', sender: 'John Doe', content: 'This is a received message', timestamp: '10:01 AM' },
    { id: '3', sender: 'You', content: 'Another sent message', timestamp: '10:02 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');



  // WebSocket connection state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load messages and patient data when chat is selected
  useEffect(() => {
    const loadChatData = async () => {
      if (selectedChat) {
        try {
          setLoadingPatientData(true);
          awsPatientService.initialize();
          const groupMessages = await awsPatientService.getGroupMessages(selectedChat.id);
          const currentUserId = awsPatientService.getCurrentUser();
          
          // Convert AWS messages to local format
          const convertedMessages: Message[] = groupMessages.map((msg: any) => {
            const isFromMe = String(msg.senderId) === String(currentUserId);
            const displayName = isFromMe ? 'You' : (msg.senderName && msg.senderName !== 'You' ? msg.senderName : 'Other User');
            return {
              id: msg.id,
              sender: displayName,
              content: msg.content,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fileUrl: msg.fileUrl,
              isDeleted: msg.content === 'Deleted By User'
            };
          });
          setMessages(convertedMessages);
          
          // Load patient data from the selected chat
          // The selectedChat should contain the patient information
          if (selectedChat) {
            const patientInfo: PatientGroupData = {
              id: selectedChat.id,
              fullName: selectedChat.name || 'Unknown Patient',
              name: selectedChat.name,
              // Use the patient data from the selected chat
              dateOfBirth: selectedChat.dateOfBirth || 'N/A',
              contactNumber: selectedChat.contactNumber || 'N/A',
              homeAddress: selectedChat.homeAddress || 'N/A',
              primaryPhysicianName: selectedChat.primaryPhysicianName || 'N/A',
              insurance: selectedChat.insurance || 'N/A',
              socProvider: selectedChat.socProvider || 'N/A',
              patientTag: selectedChat.patientTag || 'N/A',
              emergencyPersonName: selectedChat.emergencyPersonName || 'N/A',
              emergencyContact: selectedChat.emergencyContact || 'N/A',
              city: selectedChat.city || 'N/A',
              state: selectedChat.state || 'N/A',
              zipCode: selectedChat.zipCode || 'N/A'
            };
            setPatientData(patientInfo);
          }
          
        } catch (error) {
          console.error('Error loading chat data:', error);
          setMessages([]);
          setPatientData(null);
        } finally {
          setLoadingPatientData(false);
        }
      } else {
        setMessages([]);
        setPatientData(null);
      }
    };

    loadChatData();
  }, [selectedChat]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!selectedChat) return;
    
    // Initialize AWS service to get current user
    awsPatientService.initialize();

    const wsUrl = process.env.NEXT_PUBLIC_WS_ENDPOINT;
    const userId = awsPatientService.getCurrentUser();
    
    if (!userId) {
      return;
    }

    if (!wsUrl || wsUrl === 'wss://your-websocket-url.com') {
      setIsConnected(false);
      return;
    }


    
    try {
      const websocket = new WebSocket(`${wsUrl}?userId=${userId}&groupId=${selectedChat.id}`);

      websocket.onopen = () => {
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.action === 'message') {
            const isFromMe = String(data.senderId) === String(userId);
            const displayName = isFromMe ? 'You' : (data.senderName && data.senderName !== 'You' ? data.senderName : 'Other User');
            
            const newMessage: Message = {
              id: data.messageId || `msg_${Date.now()}`,
              sender: displayName,
              content: data.message || data.content || '',
              timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fileUrl: data.fileUrl || data.fileURL || data.file_url || undefined
            };
            
            // Dispatch event for chat list to update (for all groups)
            setTimeout(() => {
              console.log('WebSocket dispatching event for groupId:', data.groupId, 'message:', data.message || data.content);
              window.dispatchEvent(new CustomEvent('chatMessageReceived', {
                detail: { groupId: data.groupId, message: data.message || data.content || '', timestamp: newMessage.timestamp }
              }));
            }, 100);
            
            // Add message to state only if it's for current chat
            if (data.groupId === selectedChat.id) {
              setMessages(prev => {
                const exists = prev.some(m => m.id === newMessage.id);
                if (exists) return prev;
                return [...prev, newMessage];
              });
            }
          } else if (data.action === 'deleteMessage' || data.action === 'messageDeleted') {
            if (data.groupId === selectedChat.id) {
              setMessages(prev => prev.map(msg => 
                msg.id === data.messageId ? { ...msg, content: 'Deleted By User', isDeleted: true } : msg
              ));
            }
          }
        } catch (error) {}
      };

      websocket.onerror = (error) => {
        setIsConnected(false);
      };

      websocket.onclose = (event) => {
        setIsConnected(false);
      };

      setWs(websocket);

      return () => websocket.close();
    } catch (error) {
      setIsConnected(false);
    }
  }, [selectedChat]);
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
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch patient data when a patient group is selected
  useEffect(() => {
    const fetchPatientData = async () => {
      if (selectedChat && selectedChat.type === 'group') {
        setLoadingPatientData(true);
        try {
          // Using localStorage instead of AWS service
          const patients = JSON.parse(localStorage.getItem('patientGroups') || '[]');
          
          let patient = patients.find((p: any) => p.id === selectedChat.id || p.fullName === selectedChat.name);
          
          // If no exact match, try to find by name only
          if (!patient) {
            patient = patients.find((p: any) => p.fullName === selectedChat.name);
          }
          
          // If still no match and we have patients, use the first one as fallback
          if (!patient && patients.length > 0) {
            patient = patients[0];
          }
          
          if (patient) {
            setPatientData(patient);
          } else {
            setPatientData(null);
          }
        } catch (error) {
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
      }
    };

    const handlePatientGroupDeleted = (event: CustomEvent) => {
      const { patientId } = event.detail;
      if (selectedChat && selectedChat.id === patientId) {
        setPatientData(null);
      }
    };

    const handleMessageDeleted = (event: CustomEvent) => {
      const { groupId, messageId } = event.detail;
      if (selectedChat && selectedChat.id === groupId) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, content: 'Deleted By User', isDeleted: true } : msg
        ));
      }
    };

    window.addEventListener('patientDataUpdated', handlePatientDataUpdate as EventListener);
    window.addEventListener('patientGroupDeleted', handlePatientGroupDeleted as EventListener);
    window.addEventListener('messageDeleted', handleMessageDeleted as EventListener);
    
    return () => {
      window.removeEventListener('patientDataUpdated', handlePatientDataUpdate as EventListener);
      window.removeEventListener('patientGroupDeleted', handlePatientGroupDeleted as EventListener);
      window.removeEventListener('messageDeleted', handleMessageDeleted as EventListener);
    };
  }, [selectedChat]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm) {
      return messages;
    }
    return messages.filter((message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat) return;
    
    if (selectedFile) {
      await handleSendFile();
      return;
    }
    
    if (newMessage.trim() === '') return;

    const userId = awsPatientService.getCurrentUser();
    if (!userId) return;

    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Get current user's name from Cognito
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
        
        // Send via WebSocket for real-time delivery
        const messageData = {
          action: 'sendMessage',
          groupId: selectedChat.id,
          senderId: userId,
          senderName: userName,
          message: newMessage,
          timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(messageData));
        setNewMessage('');
        // Don't add message locally - WebSocket will send it back
      } else {
        // Fallback to AWS service if WebSocket not available
        const result = await awsPatientService.sendMessage(selectedChat.id, newMessage);
        
        if (result.success) {
          const newMsg: Message = {
            id: `m${Date.now()}`,
            sender: 'You',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages([...messages, newMsg]);
          setNewMessage('');
        }
      }
    } catch (error) {}
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    e.target.value = '';
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedChat) return;

    setIsUploadingFile(true);
    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const { fetchAuthSession } = await import('aws-amplify/auth');
      
      const session = await fetchAuthSession();
      const s3Client = new S3Client({
        region: 'us-east-1',
        credentials: session.credentials
      });

      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const s3Key = `patient-attachments/${selectedChat.id}/${fileName}`;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await s3Client.send(new PutObjectCommand({
        Bucket: 'medhexa-groups-media-2024',
        Key: s3Key,
        Body: buffer,
        ContentType: selectedFile.type
      }));

      const fileUrl = `https://medhexa-groups-media-2024.s3.us-east-1.amazonaws.com/${s3Key}`;
      
      // Add message locally immediately
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedFile.name);
      const messageContent = newMessage.trim() || (isImage ? '' : `📎 ${selectedFile.name}`);
      const localMessage: Message = {
        id: `msg_${timestamp}`,
        sender: 'You',
        content: messageContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileUrl: fileUrl
      };
      setMessages(prev => [...prev, localMessage]);
      
      // Send file message via WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
        
        const messageData = {
          action: 'sendMessage',
          groupId: selectedChat.id,
          senderId: awsPatientService.getCurrentUser(),
          senderName: userName,
          message: messageContent,
          fileUrl: fileUrl,
          fileName: selectedFile.name,
          timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(messageData));
        
        // Update chat list
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('chatMessageReceived', {
            detail: { groupId: selectedChat.id, message: messageContent, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          }));
        }, 0);
      }
      
      setSelectedFile(null);
      setNewMessage('');
    } catch (error: any) {
      alert(`Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat) return;
    
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { DynamoDBClient, UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
      
      const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
        }
      });
      
      await client.send(new UpdateItemCommand({
        TableName: 'ChatMessages',
        Key: { messageId: { S: messageId } },
        UpdateExpression: 'SET message = :msg, isDeleted = :del',
        ExpressionAttributeValues: {
          ':msg': { S: 'Deleted By User' },
          ':del': { BOOL: true }
        }
      }));
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: 'Deleted By User', isDeleted: true } : msg
      ));
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: 'deleteMessage',
          groupId: selectedChat.id,
          messageId: messageId
        }));
      }
      
      window.dispatchEvent(new CustomEvent('messageDeleted', {
        detail: { groupId: selectedChat.id, messageId: messageId }
      }));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleTemplateSelect = (template: string) => {
    if (template === 'Start Of Care - SOC') {
      setIsSOCModalOpen(true);
    } else if (template === 'Resumption Of Care - ROC') {
      setIsROCModalOpen(true);
    } else if (template === 'Recertification') {
      setIsRecertModalOpen(true);
    } else if (template === 'Transfer/Transfer Discharge') {
      setIsTransferDischargeModalOpen(true);
    } else if (template === 'Change Frequency') {
      setIsChangeFrequencyModalOpen(true);
    } else if (template === 'Evaluation/ Reassessment') {
      setIsTherapyEvaluationModalOpen(true);
    } else if (template === 'Discharge OASIS') {
      setIsDischargeOasisModalOpen(true);
    } else if (template === 'Discharge') {
      setIsDischargeModalOpen(true);
    } else if (template === 'Re-Vist/ Missed Visit') {
      setIsRevisitModalOpen(true);
    } else {
      setNewMessage(template);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Medhexa</h1>
          <p className="text-lg text-muted-foreground">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const getMessageMenuItems = (isSender: boolean) => {
    const items = [
      { label: 'Info', icon: Info },
      { label: 'Ask for Acknowledgement', icon: UserCheck },
      { label: 'Star message', icon: Star },
      { label: 'Visible to Patient', icon: Eye },
      { label: 'Copy', icon: Copy },
      { label: 'Reply', icon: Reply },
      { label: 'Forward', icon: Forward },
    ];
    if (isSender) {
      items.push({ label: 'Resend', icon: RefreshCw });
      items.push({ label: 'Delete', icon: Trash2 });
    }
    return items;
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 border-b p-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
          {loadingPatientData ? (
            <div className="col-span-2 text-center py-4 text-muted-foreground">
              Loading patient data...
            </div>
          ) : patientData ? (
            <>
              <p><span className="font-semibold">{patientData.fullName}</span></p>
              <p><span className="font-semibold">Date of Birth:</span> {patientData.dateOfBirth || 'N/A'}</p>
              <p><span className="font-semibold">Contact:</span> {patientData.contactNumber || 'N/A'}</p>
              <p><span className="font-semibold">Home Address:</span> {patientData.homeAddress || 'N/A'}</p>
              <p><span className="font-semibold">Physician Name:</span> {patientData.primaryPhysicianName || 'N/A'}</p>
              <p><span className="font-semibold">Insurance:</span> {patientData.insurance || 'N/A'}</p>
              <p><span className="font-semibold">SOC Provider:</span> {patientData.socProvider?.toUpperCase() || 'N/A'}</p>
              <p><span className="font-semibold">Patient Tag:</span> {patientData.patientTag || 'N/A'}</p>
            </>
          ) : (
            <>
              <p><span className="font-semibold">Patient Name:</span> {selectedChat?.name || 'Unknown'}</p>
              <p><span className="font-semibold">Start of Care Date:</span> N/A</p>
              <p><span className="font-semibold">Physician Name:</span> N/A</p>
              <p><span className="font-semibold">Episode Date:</span> N/A</p>
              <p><span className="font-semibold">Disciplines:</span> N/A</p>
              <p><span className="font-semibold">Contact:</span> N/A</p>
              <p><span className="font-semibold">Insurance:</span> N/A</p>
            </>
          )}
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
                <EditPatientSheet 
                  patient={patientData || selectedChat} 
                  setOpen={setIsPatientSheetOpen} 
                />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {filteredMessages.map((message) => {
            return (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2 group',
                message.sender === 'You' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender !== 'You' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChat.avatar || undefined} alt={selectedChat.name} />
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
                      {getMessageMenuItems(true).map((item) => (
                        <DropdownMenuItem 
                          key={item.label}
                          onClick={() => item.label === 'Delete' && handleDeleteMessage(message.id)}
                        >
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
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none',
                    message.isPatient && 'border-l-4 border-destructive'
                  )}
                >
                  {message.sender !== 'You' && <p className="text-xs font-semibold mb-1">{message.sender}</p>}
                  {message.isPatient && <p className="text-xs font-bold mb-1">From Patient</p>}
                  {(() => {
                    const isImage = message.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileUrl);
                    let templateData = null;
                    let templateType = null;
                    try {
                      if (message.content && message.content.startsWith('{')) {
                        const parsed = JSON.parse(message.content);
                        if (parsed.type === 'SOC_TEMPLATE' || parsed.type === 'ROC_TEMPLATE' || parsed.type === 'RECERT_TEMPLATE' || parsed.type === 'REVISIT_TEMPLATE' || parsed.type === 'MISSEDVISIT_TEMPLATE' || parsed.type === 'TRANSFER_TEMPLATE' || parsed.type === 'TRANSFERDISCHARGE_TEMPLATE' || parsed.type === 'CHANGEFREQUENCY_TEMPLATE' || parsed.type === 'ADDDELETEDISCIPLINE_TEMPLATE' || parsed.type === 'EVALUATION_TEMPLATE' || parsed.type === 'REASSESSMENT_TEMPLATE' || parsed.type === 'DISCHARGE_TEMPLATE') {
                          templateData = parsed;
                          templateType = parsed.type;
                        }
                      }
                    } catch {}
                    
                    return (
                      <>
                        {!templateData && message.content && !message.isDeleted && <p className="text-sm break-words mb-2 whitespace-pre-wrap">{message.content}</p>}
                        {message.isDeleted && <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded"><em>{message.content}</em></p>}
                        {templateData && templateType === 'SOC_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-teal-500">
                            <h3 className="text-teal-600 text-base font-semibold mb-4">SOC Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">SOC Date :</span><span className="font-semibold">{templateData.data.socDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time In :</span><span className="font-semibold">{templateData.data.timeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time Out :</span><span className="font-semibold">{templateData.data.timeOut}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Completed By :</span><span className="font-semibold">{templateData.data.completedBy}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Frequency :</span><span className="font-semibold">{templateData.data.frequency}</span></div>
                              <div><span className="font-medium">Assistance Needed :</span><br/><span className="font-semibold">{templateData.data.assistanceNeeded}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Visit Date :</span><span className="font-semibold">{templateData.data.nextVisitDate}</span></div>
                              {templateData.data.pt && <div className="flex justify-between"><span className="font-medium">PT :</span><span className="font-semibold">{templateData.data.pt}</span></div>}
                              {templateData.data.ot && <div className="flex justify-between"><span className="font-medium">OT :</span><span className="font-semibold">{templateData.data.ot}</span></div>}
                              {templateData.data.st && <div className="flex justify-between"><span className="font-medium">ST :</span><span className="font-semibold">{templateData.data.st}</span></div>}
                              {templateData.data.hha && <div className="flex justify-between"><span className="font-medium">HHA :</span><span className="font-semibold">{templateData.data.hha}</span></div>}
                              {templateData.data.hhaFrequency && <div className="flex justify-between"><span className="font-medium">HHA Frequency :</span><span className="font-semibold">{templateData.data.hhaFrequency}</span></div>}
                              {templateData.data.msw && <div className="flex justify-between"><span className="font-medium">MSW :</span><span className="font-semibold">{templateData.data.msw}</span></div>}
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'ROC_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-blue-500">
                            <h3 className="text-blue-600 text-base font-semibold mb-4">ROC Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">ROC Date :</span><span className="font-semibold">{templateData.data.rocDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time In :</span><span className="font-semibold">{templateData.data.timeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time Out :</span><span className="font-semibold">{templateData.data.timeOut}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Completed By :</span><span className="font-semibold">{templateData.data.completedBy}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Frequency :</span><span className="font-semibold">{templateData.data.frequency}</span></div>
                              <div><span className="font-medium">Assistance Needed :</span><br/><span className="font-semibold">{templateData.data.assistanceNeeded}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Facility Name :</span><span className="font-semibold">{templateData.data.facilityName}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Facility Discharge Date :</span><span className="font-semibold">{templateData.data.facilityDischargeDate}</span></div>
                              {templateData.data.pt && <div className="flex justify-between"><span className="font-medium">PT :</span><span className="font-semibold">{templateData.data.pt}</span></div>}
                              {templateData.data.ot && <div className="flex justify-between"><span className="font-medium">OT :</span><span className="font-semibold">{templateData.data.ot}</span></div>}
                              {templateData.data.st && <div className="flex justify-between"><span className="font-medium">ST :</span><span className="font-semibold">{templateData.data.st}</span></div>}
                              {templateData.data.hha && <div className="flex justify-between"><span className="font-medium">HHA :</span><span className="font-semibold">{templateData.data.hha}</span></div>}
                              {templateData.data.hhaFrequency && <div className="flex justify-between"><span className="font-medium">HHA Frequency :</span><span className="font-semibold">{templateData.data.hhaFrequency}</span></div>}
                              {templateData.data.msw && <div className="flex justify-between"><span className="font-medium">MSW :</span><span className="font-semibold">{templateData.data.msw}</span></div>}
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'RECERT_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-purple-500">
                            <h3 className="text-purple-600 text-base font-semibold mb-4">RECERT Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">RECERT Date :</span><span className="font-semibold">{templateData.data.recertDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time In :</span><span className="font-semibold">{templateData.data.timeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time Out :</span><span className="font-semibold">{templateData.data.timeOut}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Completed By :</span><span className="font-semibold">{templateData.data.completedBy}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Frequency :</span><span className="font-semibold">{templateData.data.frequency}</span></div>
                              <div><span className="font-medium">Assistance Needed :</span><br/><span className="font-semibold">{templateData.data.assistanceNeeded}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Hospital Discharge Date :</span><span className="font-semibold">{templateData.data.hospitalDischargeDate}</span></div>
                              {templateData.data.pt && <div className="flex justify-between"><span className="font-medium">PT :</span><span className="font-semibold">{templateData.data.pt}</span></div>}
                              {templateData.data.ot && <div className="flex justify-between"><span className="font-medium">OT :</span><span className="font-semibold">{templateData.data.ot}</span></div>}
                              {templateData.data.st && <div className="flex justify-between"><span className="font-medium">ST :</span><span className="font-semibold">{templateData.data.st}</span></div>}
                              {templateData.data.hha && <div className="flex justify-between"><span className="font-medium">HHA :</span><span className="font-semibold">{templateData.data.hha}</span></div>}
                              {templateData.data.hhaFrequency && <div className="flex justify-between"><span className="font-medium">HHA Frequency :</span><span className="font-semibold">{templateData.data.hhaFrequency}</span></div>}
                              {templateData.data.msw && <div className="flex justify-between"><span className="font-medium">MSW :</span><span className="font-semibold">{templateData.data.msw}</span></div>}
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'REVISIT_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                            <h3 className="text-green-600 text-base font-semibold mb-4">Re-Visit Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Visit Date :</span><span className="font-semibold">{templateData.data.visitDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time In :</span><span className="font-semibold">{templateData.data.timeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time Out :</span><span className="font-semibold">{templateData.data.timeOut}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Visit Date :</span><span className="font-semibold">{templateData.data.nextVisitDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Time In :</span><span className="font-semibold">{templateData.data.nextTimeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Time Out :</span><span className="font-semibold">{templateData.data.nextTimeOut}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'MISSEDVISIT_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-red-500">
                            <h3 className="text-red-600 text-base font-semibold mb-4">Missed Visit Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Missed Visit Date :</span><span className="font-semibold">{templateData.data.missedVisitDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Reason :</span><span className="font-semibold">{templateData.data.reason}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Visit Date :</span><span className="font-semibold">{templateData.data.nextVisitDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Time In :</span><span className="font-semibold">{templateData.data.nextTimeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Next Time Out :</span><span className="font-semibold">{templateData.data.nextTimeOut}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'TRANSFER_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-700">
                            <h3 className="text-orange-700 text-base font-semibold mb-4">Transfer Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Transfer Date :</span><span className="font-semibold">{templateData.data.transferDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Facility Name :</span><span className="font-semibold">{templateData.data.facilityName}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Reason Of Transfer :</span><span className="font-semibold">{templateData.data.reasonOfTransfer}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Physician Notified :</span><span className="font-semibold">{templateData.data.physicianNotified}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'TRANSFERDISCHARGE_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-700">
                            <h3 className="text-orange-700 text-base font-semibold mb-4">Transfer Discharge Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Transfer Date :</span><span className="font-semibold">{templateData.data.transferDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Facility Name :</span><span className="font-semibold">{templateData.data.facilityName}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Reason Of Transfer :</span><span className="font-semibold">{templateData.data.reasonOfTransfer}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Physician Notified :</span><span className="font-semibold">{templateData.data.physicianNotified}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'CHANGEFREQUENCY_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-indigo-500">
                            <h3 className="text-indigo-600 text-base font-semibold mb-4">Change Frequency Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Discipline :</span><span className="font-semibold">{templateData.data.discipline}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Change Frequency :</span><span className="font-semibold">{templateData.data.changeFrequency}</span></div>
                              <div className="flex justify-between"><span className="font-medium">New Frequency Date :</span><span className="font-semibold">{templateData.data.newFrequencyDate}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'ADDDELETEDISCIPLINE_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-pink-500">
                            <h3 className="text-pink-600 text-base font-semibold mb-4">Add/Delete Discipline Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Disciplines :</span><span className="font-semibold">{templateData.data.disciplines}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'EVALUATION_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-cyan-500">
                            <h3 className="text-cyan-600 text-base font-semibold mb-4">Evaluation Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Evaluation Date :</span><span className="font-semibold">{templateData.data.evaluationDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time In :</span><span className="font-semibold">{templateData.data.timeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time Out :</span><span className="font-semibold">{templateData.data.timeOut}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Completed By :</span><span className="font-semibold">{templateData.data.completedBy}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Frequency :</span><span className="font-semibold">{templateData.data.frequency}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Assistance Needed :</span><span className="font-semibold">{templateData.data.assistanceNeeded}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'REASSESSMENT_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-lime-500">
                            <h3 className="text-lime-600 text-base font-semibold mb-4">Reassessment Evaluation Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Evaluation Date :</span><span className="font-semibold">{templateData.data.evaluationDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time In :</span><span className="font-semibold">{templateData.data.timeIn}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Time Out :</span><span className="font-semibold">{templateData.data.timeOut}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Completed By :</span><span className="font-semibold">{templateData.data.completedBy}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Frequency :</span><span className="font-semibold">{templateData.data.frequency}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Assistance Needed :</span><span className="font-semibold">{templateData.data.assistanceNeeded}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {templateData && templateType === 'DISCHARGE_TEMPLATE' && (
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-500">
                            <h3 className="text-gray-700 text-base font-semibold mb-4">Discharge Form Details:</h3>
                            <div className="space-y-2 text-sm text-black">
                              <div className="flex justify-between"><span className="font-medium">Discharge Date :</span><span className="font-semibold">{templateData.data.dischargeDate}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Discharge Education To :</span><span className="font-semibold">{templateData.data.dischargeEducationTo}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Reason Of Discharge :</span><span className="font-semibold">{templateData.data.reasonOfDischarge}</span></div>
                              <div className="flex justify-between"><span className="font-medium">Non-Visit Discharge :</span><span className="font-semibold">{templateData.data.nonVisitDischarge}</span></div>
                              <div className="bg-blue-100 p-3 rounded mt-4">
                                <div className="font-medium mb-2 text-black">Notes :</div>
                                <div className="italic text-black">{templateData.data.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {isImage && (
                          <div className="my-2">
                            <img 
                              src={message.fileUrl} 
                              alt="attachment" 
                              className="max-w-full w-auto h-auto max-h-64 rounded cursor-pointer border border-gray-300" 
                              onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                          </div>
                        )}
                        {message.fileUrl && !isImage && (
                          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline block">{message.content || 'Download file'}</a>
                        )}
                      </>
                    );
                  })()}
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
                      {getMessageMenuItems(false).map((item) => (
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
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t bg-muted/40 p-4">
        {selectedFile && (
          <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 flex-1">{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-blue-600 hover:text-red-600 font-bold">
              ×
            </button>
          </div>
        )}
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
            <label htmlFor="file-upload">
              <Button type="button" variant="ghost" size="icon" className="rounded-full" asChild>
                <span><Paperclip /></span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={isUploadingFile}
            />
            <Button type="submit" size="icon" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 w-9 h-9">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
      
      <SOCTemplateModal 
        isOpen={isSOCModalOpen} 
        onClose={() => setIsSOCModalOpen(false)}
        onSubmit={async (message) => {
          // console.log('SOC Template onSubmit called with message:', message);
          if (!selectedChat) {
            console.log('No selected chat');
            return;
          }
          if (!ws) {
            // console.log('No WebSocket');
            return;
          }
          if (ws.readyState !== WebSocket.OPEN) {
            // console.log('WebSocket not open, state:', ws.readyState);
            return;
          }
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) {
            console.log('No userId');
            return;
          }
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
          
          // Update group status in DynamoDB
          console.log('Updating group status for:', selectedChat.id);
          try {
            const { DynamoDBClient, UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
            const { fetchAuthSession } = await import('aws-amplify/auth');
            
            const session = await fetchAuthSession();
            const dynamoClient = new DynamoDBClient({
              region: 'us-east-1',
              credentials: session.credentials
            });
            
            // console.log('Sending DynamoDB update...');
            const result = await dynamoClient.send(new UpdateItemCommand({
              TableName: 'PatientGroups',
              Key: {
                groupId: { S: selectedChat.id }
              },
              UpdateExpression: 'SET #status = :status',
              ExpressionAttributeNames: {
                '#status': 'status'
              },
              ExpressionAttributeValues: {
                ':status': { S: 'Active' }
              }
            }));
            // console.log('DynamoDB update successful:', result);
            
            // Trigger refresh of patient groups
            window.dispatchEvent(new CustomEvent('groupStatusUpdated', {
              detail: { groupId: selectedChat.id, status: 'Active' }
            }));
            window.dispatchEvent(new Event('storage'));
          } catch (error) {
            // console.error('Error updating group status:', error);
          }
        }}
      />
      
      <ROCTemplateModal 
        isOpen={isROCModalOpen} 
        onClose={() => setIsROCModalOpen(false)}
        groupId={selectedChat?.id}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <RecertTemplateModal 
        isOpen={isRecertModalOpen} 
        onClose={() => setIsRecertModalOpen(false)}
        groupId={selectedChat?.id}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <TransferTemplateModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)}
        groupId={selectedChat?.id}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <ChangeFrequencyTemplateModal 
        isOpen={isChangeFrequencyModalOpen} 
        onClose={() => setIsChangeFrequencyModalOpen(false)}
        groupId={selectedChat?.id}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <TherapyEvaluationTemplateModal 
        isOpen={isTherapyEvaluationModalOpen} 
        onClose={() => setIsTherapyEvaluationModalOpen(false)}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <DischargeOasisModal 
        open={isDischargeOasisModalOpen} 
        onOpenChange={setIsDischargeOasisModalOpen}
        groupId={selectedChat?.id}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <RevisitModal 
        open={isRevisitModalOpen} 
        onOpenChange={setIsRevisitModalOpen}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
        }}
      />
      
      <DischargeTemplateModal 
        isOpen={isDischargeModalOpen} 
        onClose={() => setIsDischargeModalOpen(false)}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
          
          try {
            const { DynamoDBClient, UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
            const { fetchAuthSession } = await import('aws-amplify/auth');
            
            const session = await fetchAuthSession();
            const dynamoClient = new DynamoDBClient({
              region: 'us-east-1',
              credentials: session.credentials
            });
            
            await dynamoClient.send(new UpdateItemCommand({
              TableName: 'PatientGroups',
              Key: {
                groupId: { S: selectedChat.id }
              },
              UpdateExpression: 'SET #status = :status',
              ExpressionAttributeNames: {
                '#status': 'status'
              },
              ExpressionAttributeValues: {
                ':status': { S: 'Discharge' }
              }
            }));
            
            window.dispatchEvent(new CustomEvent('groupStatusUpdated', {
              detail: { groupId: selectedChat.id, status: 'Discharge' }
            }));
            window.dispatchEvent(new Event('storage'));
          } catch (error) {
            // console.error('Error updating group status:', error);
          }
        }}
      />
      
      <TransferDischargeModal 
        open={isTransferDischargeModalOpen} 
        onOpenChange={setIsTransferDischargeModalOpen}
        onSubmit={async (message) => {
          if (!selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;
          
          const userId = awsPatientService.getCurrentUser();
          if (!userId) return;
          
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          const userName = attributes.name || attributes.email?.split('@')[0] || 'User';
          
          const messageData = {
            action: 'sendMessage',
            groupId: selectedChat.id,
            senderId: userId,
            senderName: userName,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify(messageData));
          
          try {
            const parsed = JSON.parse(message);
            const statusToSet = parsed.status || 'Transfer';
            
            const { DynamoDBClient, UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
            const { fetchAuthSession } = await import('aws-amplify/auth');
            
            const session = await fetchAuthSession();
            const dynamoClient = new DynamoDBClient({
              region: 'us-east-1',
              credentials: session.credentials
            });
            
            await dynamoClient.send(new UpdateItemCommand({
              TableName: 'PatientGroups',
              Key: {
                groupId: { S: selectedChat.id }
              },
              UpdateExpression: 'SET #status = :status',
              ExpressionAttributeNames: {
                '#status': 'status'
              },
              ExpressionAttributeValues: {
                ':status': { S: statusToSet }
              }
            }));
            
            window.dispatchEvent(new CustomEvent('groupStatusUpdated', {
              detail: { groupId: selectedChat.id, status: statusToSet }
            }));
            window.dispatchEvent(new Event('storage'));
          } catch (error) {
            // console.error('Error updating group status:', error);
          }
        }}
      />
    </div>
  );
}
