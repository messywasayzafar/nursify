'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';

interface DischargeOasisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (message: string) => void;
  groupId?: string;
}

export function DischargeOasisModal({ open, onOpenChange, onSubmit, groupId }: DischargeOasisModalProps) {
  const [dischargeDate, setDischargeDate] = useState('09/12/2025');
  const [dischargeEducation, setDischargeEducation] = useState('');
  const [reasonOfDischarge, setReasonOfDischarge] = useState('');
  const [nonVisitDischarge, setNonVisitDischarge] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    const data: any = {
      dischargeDate: dischargeDate || 'N/A',
      dischargeEducationTo: dischargeEducation || 'N/A',
      reasonOfDischarge: reasonOfDischarge || 'N/A',
      nonVisitDischarge: nonVisitDischarge || 'N/A',
      notes: notes || 'N/A'
    };
    
    const templateData = {
      type: 'DISCHARGE_TEMPLATE',
      data,
      status: 'Discharge'
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
            ':status': { S: 'Discharge' }
          }
        }));
        
        window.dispatchEvent(new CustomEvent('groupStatusUpdated', {
          detail: { groupId: groupId, status: 'Discharge' }
        }));
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error updating group status:', error);
      }
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="bg-primary text-primary-foreground p-4 -m-6 mb-6">
          <DialogTitle className="text-center">Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
           Discharge
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discharge-date">Discharge Date</Label>
              <Input
                id="discharge-date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discharge-education">Discharge education to</Label>
              <Input
                id="discharge-education"
                value={dischargeEducation}
                onChange={(e) => setDischargeEducation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason-discharge">Reason Of Discharge</Label>
            <Input
              id="reason-discharge"
              value={reasonOfDischarge}
              onChange={(e) => setReasonOfDischarge(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Non-Visit Discharge</Label>
            <RadioGroup value={nonVisitDischarge} onValueChange={setNonVisitDischarge}>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}