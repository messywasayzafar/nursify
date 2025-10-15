'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChangeFrequencyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (message: string) => void;
  groupId?: string;
}

export function ChangeFrequencyTemplateModal({ isOpen, onClose, onSubmit, groupId }: ChangeFrequencyTemplateModalProps) {
  const [activeTab, setActiveTab] = useState('frequency');
  const [newFrequencyDate, setNewFrequencyDate] = useState<Date>();
  const [formData, setFormData] = useState({
    discipline: 'Skilled Nurse',
    changeFrequency: '1w9',
    notes: ''
  });
  const [socDisciplines, setSocDisciplines] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && groupId) {
      setSocDisciplines(['PT', 'OT', 'ST', 'MSW', 'HHA']);
      setSelectedDisciplines([]);
      
      // Fetch SOC template disciplines from messages
      const fetchSOCDisciplines = async () => {
        try {
          const awsPatientService = (await import('../../../chatservices/aws-patient-service-client')).awsPatientService;
          awsPatientService.initialize();
          const messages = await awsPatientService.getGroupMessages(groupId);
          
          console.log('Fetched messages:', messages);
          
          for (const msg of messages) {
            try {
              const content = msg.content || msg.message;
              if (content && content.startsWith('{')) {
                const parsed = JSON.parse(content);
                console.log('Parsed message:', parsed);
                if (parsed.type === 'SOC_TEMPLATE') {
                  const checkedDisciplines = [];
                  if (parsed.data.pt) checkedDisciplines.push('PT');
                  if (parsed.data.ot) checkedDisciplines.push('OT');
                  if (parsed.data.st) checkedDisciplines.push('ST');
                  if (parsed.data.msw) checkedDisciplines.push('MSW');
                  if (parsed.data.hha) checkedDisciplines.push('HHA');
                  console.log('Found checked SOC disciplines:', checkedDisciplines);
                  setSelectedDisciplines(checkedDisciplines);
                  break;
                }
              }
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          }
        } catch (error) {
          console.error('Error fetching SOC disciplines:', error);
        }
      };
      fetchSOCDisciplines();
    }
  }, [isOpen, groupId]);

  const handleDisciplineToggle = (discipline: string, checked: boolean) => {
    setSelectedDisciplines(prev => 
      checked ? [...prev, discipline] : prev.filter(d => d !== discipline)
    );
  };

  const handleSubmit = async () => {
    const data: any = {
      notes: formData.notes || 'N/A'
    };
    
    if (activeTab === 'frequency') {
      data.discipline = formData.discipline;
      data.changeFrequency = formData.changeFrequency;
      data.newFrequencyDate = newFrequencyDate ? format(newFrequencyDate, "MM/dd/yyyy") : 'N/A';
    } else {
      data.disciplines = selectedDisciplines.join(', ') || 'N/A';
    }
    
    const templateData = {
      type: activeTab === 'frequency' ? 'CHANGEFREQUENCY_TEMPLATE' : 'ADDDELETEDISCIPLINE_TEMPLATE',
      data
    };
    
    const message = JSON.stringify(templateData);
    
    if (onSubmit) {
      await onSubmit(message);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-slate-200" hideClose>
        <div className="bg-teal-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-teal-700 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("text-xs font-semibold", activeTab === 'frequency' && "bg-gray-300")}
              onClick={() => setActiveTab('frequency')}
            >
              Frequency Changed
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("text-xs", activeTab === 'discipline' && "bg-gray-300")}
              onClick={() => setActiveTab('discipline')}
            >
              Add/Delete Discipline
            </Button>
          </div>
          
          {activeTab === 'frequency' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discipline" className="text-sm font-medium">Discipline</Label>
                  <Select value={formData.discipline} onValueChange={(value) => setFormData({ ...formData, discipline: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skilled Nurse">Skilled Nurse</SelectItem>
                      <SelectItem value="LPN">LPN</SelectItem>
                      <SelectItem value="Physical Therapist">Physical Therapist</SelectItem>
                      <SelectItem value="MSW">MSW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="changeFrequency" className="text-sm font-medium">Change Frequency</Label>
                  <Input
                    id="changeFrequency"
                    value={formData.changeFrequency}
                    onChange={(e) => setFormData({ ...formData, changeFrequency: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">New Frequency Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 max-w-xs",
                        !newFrequencyDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newFrequencyDate ? format(newFrequencyDate, "MM/dd/yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newFrequencyDate}
                      onSelect={setNewFrequencyDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
          
          {activeTab === 'discipline' && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Disciplines</Label>
              <div className="space-y-2">
                {socDisciplines.map((discipline) => (
                  <div key={discipline} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`discipline-${discipline}`}
                      checked={selectedDisciplines.includes(discipline)}
                      onCheckedChange={(checked) => handleDisciplineToggle(discipline, checked as boolean)}
                    />
                    <Label htmlFor={`discipline-${discipline}`} className="cursor-pointer">{discipline}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 min-h-[60px]"
              placeholder="Enter notes..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white px-6">
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}