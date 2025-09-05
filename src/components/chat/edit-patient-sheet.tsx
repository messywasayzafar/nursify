
'use client';

import React from 'react';
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
} from 'lucide-react';
import type { Chat } from '@/lib/types';

interface EditPatientSheetProps {
  patient: Chat;
  setOpen: (open: boolean) => void;
}

const physicianDetails = [
    { name: "Rumana Yunus - PCP", number: "(+1) 313-982-8100" },
    { name: "Mario DeMeireles - Attending", number: "(+1) 313-359-0801" },
];

const caregiverDetails = [
    { name: "Chanila Hines - Daughter", number: "(+1) 313-999-1917" },
    { name: "Maggie Duncan - Mother", number: "(+1) 313-934-5328" },
];

const pharmacyDetails = [
    { name: "OneCare LTC", number: "(+1) 248-663-2273" },
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
                        {/* Physician Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Physician Details</h3>
                            <div className="space-y-3">
                                {physicianDetails.map((detail, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Physician Name</p>
                                                <p>{detail.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Physician Number</p>
                                                <p>{detail.number}</p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Caregiver Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Caregiver Details</h3>
                            <div className="space-y-3">
                                {caregiverDetails.map((detail, index) => (
                                     <React.Fragment key={index}>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Caregiver Name</p>
                                                <p>{detail.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Caregiver Number</p>
                                                <p>{detail.number}</p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Pharmacy Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Pharmacy Details</h3>
                            <div className="space-y-3">
                                {pharmacyDetails.map((detail, index) => (
                                     <React.Fragment key={index}>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Pharmacy Name</p>
                                                <p>{detail.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Pharmacy Number</p>
                                                <p>{detail.number}</p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Export Settings */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Export Settings</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    <span>Export Chat</span>
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    <span>Export Media</span>
                                </Button>
                            </div>
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
