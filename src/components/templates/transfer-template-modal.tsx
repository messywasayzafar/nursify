'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransferTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (message: string) => void;
  groupId?: string;
}

export function TransferTemplateModal({ isOpen, onClose, onSubmit, groupId }: TransferTemplateModalProps) {
  const [activeTab, setActiveTab] = useState('transfer');
  const [formData, setFormData] = useState({
    transferDate: '09/12/2025',
    facilityName: '',
    reasonOfTransfer: '',
    physicianNotified: 'Yes',
    notes: ''
  });

  const handleSubmit = async () => {
    const data: any = {
      transferDate: formData.transferDate || 'N/A',
      facilityName: formData.facilityName || 'N/A',
      reasonOfTransfer: formData.reasonOfTransfer || 'N/A',
      physicianNotified: formData.physicianNotified || 'N/A',
      notes: formData.notes || 'N/A'
    };
    
    const templateData = {
      type: activeTab === 'transfer' ? 'TRANSFER_TEMPLATE' : 'TRANSFERDISCHARGE_TEMPLATE',
      data,
      status: activeTab === 'transfer' ? 'Hospitalized' : 'Discharge'
    };
    
    const message = JSON.stringify(templateData);
    
    if (onSubmit) {
      await onSubmit(message);
    }
    
    if (groupId) {
      try {
        const { DynamoDBClient, UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
        const { fetchAuthSession } = await import('aws-amplify/auth');
        
        const session = await fetchAuthSession();
        const dynamoClient = new DynamoDBClient({
          region: 'us-east-1',
          credentials: session.credentials
        });
        
        const statusToSet = activeTab === 'transfer' ? 'Hospitalized' : 'Discharge';
        
        await dynamoClient.send(new UpdateItemCommand({
          TableName: 'PatientGroups',
          Key: {
            groupId: { S: groupId }
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
          detail: { groupId: groupId, status: statusToSet }
        }));
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error updating group status:', error);
      }
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-slate-200" hideClose>
        <DialogHeader className="sr-only">
          <DialogTitle>Transfer Template</DialogTitle>
        </DialogHeader>
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
              className={cn("text-xs font-semibold", activeTab === 'transfer' && "bg-gray-300")}
              onClick={() => setActiveTab('transfer')}
            >
              Transfer
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("text-xs", activeTab === 'transferDischarge' && "bg-gray-300")}
              onClick={() => setActiveTab('transferDischarge')}
            >
              Transfer Discharge
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transferDate" className="text-sm font-medium">Transfer Date</Label>
              <Input
                id="transferDate"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="facilityName" className="text-sm font-medium">Facility Name</Label>
              <Input
                id="facilityName"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reasonOfTransfer" className="text-sm font-medium">Reason Of Transfer</Label>
              <Input
                id="reasonOfTransfer"
                value={formData.reasonOfTransfer}
                onChange={(e) => setFormData({ ...formData, reasonOfTransfer: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Physician Notified</Label>
              <RadioGroup 
                value={formData.physicianNotified} 
                onValueChange={(value) => setFormData({ ...formData, physicianNotified: value })}
                className="flex gap-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="yes" />
                  <Label htmlFor="yes" className="text-sm">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="no" />
                  <Label htmlFor="no" className="text-sm">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

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