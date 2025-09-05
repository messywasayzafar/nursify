
'use client';

import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

import {
  Calendar,
  Pencil,
  List,
  X,
  Home,
  Cake,
  Phone,
  MapPin,
  CalendarDays,
  Shield,
  Mail,
  FileText,
  Search,
  Maximize,
  ChevronRight,
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
    { name: "8/20 FS - order summary - PN (RN signed)", date: "8/20" },
    { name: "Benefits NQS 0820", date: "" },
    { name: "8/26 HHC orders - PN", date: "" },
    { name: "Benefits WellCare 0903", date: "" },
];

export function EditPatientSheet({ patient, setOpen }: EditPatientSheetProps) {
  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Home /></AvatarFallback>
                </Avatar>
                <div>
                    <SheetTitle className="text-lg font-bold">Forest Flagg</SheetTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>SN</span>
                        <span>PT</span>
                        <span>OT</span>
                        <span>HHA</span>
                        <Badge variant="destructive" className="ml-2">#SOC AUTH HOLD</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Calendar className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><Pencil className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><List className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-5 w-5"/></Button>
            </div>
        </div>
      </SheetHeader>
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="info" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
                <TabsContent value="info" className="m-0">
                    <div className="p-4 space-y-6">
                        {/* Patient Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Patient Details</h3>
                            <div className="space-y-3">
                                {patientDetails.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                                            <detail.icon className="h-5 w-5" />
                                        </div>
                                        <span>{detail.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Send Emails */}
                        <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
                            <Mail className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">Send emails to this group</p>
                                <p className="text-xs text-muted-foreground">Get an email address that posts incoming emails in this group.</p>
                            </div>
                        </div>
                        {/* Referral Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Referral Information</h3>
                            <div className="text-sm space-y-2">
                                <div>
                                    <p className="font-medium">Referral Source</p>
                                    <p className="text-muted-foreground">*Four Chaplains Nursing Care Centre - Email - Jae'la Nelson P: (734) 261-9500 ext. 112</p>
                                </div>
                                <div>
                                    <p className="font-medium">Community Liaison</p>
                                    <p className="text-muted-foreground">Zammad Khan</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted/50">
                                        <FileText className="h-6 w-6 text-destructive" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">PDF</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         {/* Media, Links and Docs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="font-semibold">Media, Links and Docs</h3>
                               <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="bg-card rounded-full h-9 w-9"><Search className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="icon" className="bg-card rounded-full h-9 w-9"><Maximize className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="icon" className="bg-card rounded-full h-9 w-9"><ChevronRight className="h-4 w-4"/></Button>
                               </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map(i => (
                                    <Image
                                        key={i}
                                        src={`https://picsum.photos/200/200?random=${i}`}
                                        alt={`Media ${i}`}
                                        data-ai-hint="document medical"
                                        width={200}
                                        height={200}
                                        className="rounded-md object-cover aspect-square"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="members" className="m-4">Members information goes here.</TabsContent>
                <TabsContent value="vitals" className="m-4">Vitals information goes here.</TabsContent>
                <TabsContent value="settings" className="m-4">Settings information goes here.</TabsContent>
            </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
