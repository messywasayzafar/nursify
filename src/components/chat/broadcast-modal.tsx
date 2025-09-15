'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';

interface BroadcastModalProps {
  setOpen: (open: boolean) => void;
}

const members = [
  { name: 'Norman nizam', status: 'Add', added: false },
  { name: 'Nabeel', status: 'Add', added: false },
  { name: 'Alexander', status: 'Add', added: false },
  { name: 'Cliff Cavietto', status: 'Add', added: false },
];

export function BroadcastModal({ setOpen }: BroadcastModalProps) {
  const [broadcastName, setBroadcastName] = useState('Infection control practices');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberStates, setMemberStates] = useState(members);

  const filteredMembers = memberStates.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (index: number) => {
    setMemberStates(prev => prev.map((member, i) => 
      i === index ? { ...member, added: !member.added } : member
    ));
  };

  return (
    <DialogContent className="sm:max-w-md p-0">
      <DialogHeader className="p-4 border-b">
        <DialogTitle className="text-left">New Broadcast</DialogTitle>
      </DialogHeader>
      
      <div className="p-4 space-y-4">
        {/* Broadcast Name */}
        <div className="space-y-2">
          <Label htmlFor="broadcast-name">Broadcast Name</Label>
          <Input
            id="broadcast-name"
            value={broadcastName}
            onChange={(e) => setBroadcastName(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Add Members */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Add Members
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members"
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredMembers.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.name}</span>
              </div>
              <Button 
                size="sm" 
                variant={member.added ? 'default' : 'outline'}
                className="text-xs"
                onClick={() => toggleMember(index)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>

        {/* Added Members */}
        <div className="space-y-2 text-sm">
          {memberStates.filter(member => member.added).map((member, index) => {
            const originalIndex = memberStates.findIndex(m => m.name === member.name);
            return (
              <div key={index} className="flex items-center gap-2">
                <span>{member.name}</span>
                <X 
                  className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                  onClick={() => toggleMember(originalIndex)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <DialogFooter className="p-4 border-t">
        <Button onClick={() => setOpen(false)} className="w-full">
          Done
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}