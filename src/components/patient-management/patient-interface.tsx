'use client';

import { useState } from 'react';
import { Search, Users, ChevronDown, Info, RotateCcw, Star, Radio, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigationTabs = [
  { id: 'patients', label: 'Patients', active: true },
  { id: 'internal-groups', label: 'Internal groups', active: false },
  { id: 'individual', label: 'Individual', active: false },
  { id: 'contacts', label: 'Contacts', active: false },
];

const actionIcons = [
  { icon: Info, label: 'Information' },
  { icon: RotateCcw, label: 'Refresh' },
  { icon: Star, label: 'Favorites' },
  { icon: Radio, label: 'Broadcast' },
  { icon: Filter, label: 'Filter' },
];

const patientGroups = [
  {
    id: 1,
    name: 'Dummy 1',
    services: ['SN', 'PT', 'OT'],
    episodeDate: '01/01/2025 - 03/01/2025',
    status: 'Pending SOC',
    statusColor: 'bg-red-500',
    selected: true,
    avatar: 'D1'
  },
  {
    id: 2,
    name: 'Dummy 2',
    services: ['SN', 'PT'],
    episodeDate: '02/01/2025 - 04/01/2025',
    status: null,
    statusColor: null,
    selected: false,
    avatar: 'D2'
  },
  {
    id: 3,
    name: 'Dummy 3',
    services: ['OT', 'SLP'],
    episodeDate: '03/01/2025 - 05/01/2025',
    status: null,
    statusColor: null,
    selected: false,
    avatar: 'D3'
  },
  {
    id: 4,
    name: 'Dummy 4',
    services: ['SN', 'PT', 'OT', 'SLP'],
    episodeDate: '04/01/2025 - 06/01/2025',
    status: 'Pending SOC',
    statusColor: 'bg-red-500',
    selected: false,
    avatar: 'D4'
  },
  {
    id: 5,
    name: 'Dummy 5',
    services: ['PT', 'OT'],
    episodeDate: '05/01/2025 - 07/01/2025',
    status: null,
    statusColor: null,
    selected: false,
    avatar: 'D5'
  },
  {
    id: 6,
    name: 'Dummy 6',
    services: ['SN', 'SLP'],
    episodeDate: '06/01/2025 - 08/01/2025',
    status: 'Pending SOC',
    statusColor: 'bg-red-500',
    selected: false,
    avatar: 'N'
  },
];

export function PatientInterface() {
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedFilter, setSelectedFilter] = useState('All Patients');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patientGroups.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab.active || activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {actionIcons.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title={action.label}
            >
              <action.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="p-4 space-y-4">
        {/* Patient Filter Dropdown */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{selectedFilter}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedFilter('All Patients')}>
                All Patients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('Active Patients')}>
                Active Patients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('Pending Patients')}>
                Pending Patients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Patients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="px-4 pb-4">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  patient.selected ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 bg-gray-600">
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        {patient.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Patient Name: {patient.name}
                        </h3>
                        {patient.status && (
                          <Badge className={`${patient.statusColor} text-white text-xs`}>
                            {patient.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Services:</span> {patient.services.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Episode Date:</span> {patient.episodeDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
