
'use client';

import React from 'react';
import Image from 'next/image';
import {
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import {
  Calendar,
  Pencil,
  List,
  X,
  Home,
  Phone,
  User,
  MessageSquare,
  Image as ImageIcon,
  PlusCircle,
  Settings,
  Cake,
  MapPin,
  CalendarDays,
  Shield,
  Mail,
  FileText,
  Download,
} from 'lucide-react';
import type { Chat } from '@/lib/types';

interface EditPatientSheetProps {
  patient: Chat;
  setOpen: (open: boolean) => void;
}

const patientDetails = [
    { icon: Cake, label: "Date of Birth", value: "03/16/1956 (69 yrs)" },
    { icon: Phone, label: "Phone", value: "+1 734-642-7164" },
    { icon: MapPin, label: "Address", value: "8294 Normile St, Detroit, MI 48204, USA" },
    { icon: CalendarDays, label: "Episode", value: "08/31/25 - 10/30/25" },
    { icon: Shield, label: "Insurance", value: "WellCare HMO - 29462822" },
];

const documents = [
    { name: "8/20 FS - order summary - PN (RN signed) -...", date: "8/20 FS - order summary - PN (RN signed) - H&P" },
    { name: "Benefits NQS 0820", date: "PDF" },
    { name: "8/26 HHC orders - PN", date: "PDF" },
    { name: "Benefits WellCare 0903", date: "PDF" },
];

const media = [
    { src: "https://picsum.photos/100/100?random=1", hint: "document" },
    { src: "https://picsum.photos/100/100?random=2", hint: "medical chart" },
    { src: "https://picsum.photos/100/100?random=3", hint: "patient" },
    { src: "https://picsum.photos/100/100?random=4", hint: "prescription" },
]


export function EditPatientSheet({ patient, setOpen }: EditPatientSheetProps) {
  const [showAllDocs, setShowAllDocs] = React.useState(false);

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Home /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <SheetTitle className="text-lg font-bold mb-1">Forest Flagg</SheetTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs px-2 py-0.5">SN</Badge>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">PT</Badge>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">OT</Badge>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">HHA</Badge>
                        </div>
                        <Badge variant="destructive" className="text-xs px-2 py-1 font-semibold">
                            #SOC AUTH HOLD
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Calendar className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4"/>
                </Button>
            </div>
        </div>
      </SheetHeader>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-4 flex-shrink-0">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-auto">
                <TabsContent value="info" className="m-0">
                    <div className="p-4 space-y-6">
                        {/* Patient Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Patient Details</h3>
                            <div className="space-y-3">
                                {patientDetails.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                                            <detail.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{detail.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Referral Information</h3>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Referral Source</h4>
                                <p className="text-sm">*Four Chaplains Nursing Care Centre - Email - Jae'la Nelson P: (734) 261-9500 ext. 112</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Community Liaison</h4>
                                <p className="text-sm">Zammad Khan</p>
                            </div>
                        </div>

                        {/* Media, Links and Docs */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Media, Links and Docs</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {media.map((item, index) => (
                                    <Image key={index} src={item.src} alt="Media" width={100} height={100} className="rounded-md object-cover aspect-square" data-ai-hint={item.hint} />
                                ))}
                            </div>
                        </div>

                        {/* PDFs and Docs */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">PDFs and Docs</h3>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-3 text-sm"
                                onClick={() => setShowAllDocs(!showAllDocs)}
                            >
                                <FileText className="h-5 w-5 text-primary" />
                                <span>{showAllDocs ? 'Hide Documents' : 'View All Documents'}</span>
                            </Button>
                            {showAllDocs && (
                                <div className="space-y-2">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                            <FileText className="h-5 w-5 text-destructive flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                         {/* Actions */}
                        <div className="space-y-3 border-t pt-4">
                             <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                                <PlusCircle className="h-5 w-5 text-primary" />
                                <span>Start New Episode</span>
                            </Button>
                             <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                                <Settings className="h-5 w-5 text-primary" />
                                <span>Group Settings</span>
                            </Button>
                             <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                                <Download className="h-5 w-5 text-primary" />
                                <span>Export Chat</span>
                            </Button>
                        </div>

                        {/* PDFs and Docs */}

                    </div>
                </TabsContent>
                <TabsContent value="members" className="m-4">Members information goes here.</TabsContent>
                <TabsContent value="settings" className="m-4">Settings information goes here.</TabsContent>
            </div>
        </Tabs>
      </div>
    </div>
  );
}
