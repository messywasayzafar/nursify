
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { X, MapPin, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddMembersModal } from './add-members-modal';
import { useToast } from '@/hooks/use-toast';
import { awsPatientService } from '../../../chatservices/aws-patient-service-client';

// Fallback service if awsPatientService is not available
const getPatientService = () => {
  if (typeof awsPatientService !== 'undefined' && awsPatientService) {
    return awsPatientService;
  }
  
  console.warn('⚠️ awsPatientService not available, using fallback service');
  
  // Create a fallback service
  return {
    createPatientGroup: async (groupData: any) => {
      console.log('🔄 Using fallback service for createPatientGroup');
      
      // Fallback to localStorage
      try {
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newGroup = {
          id: groupId,
          name: groupData.name || 'Untitled Group',
          type: groupData.type || 'patient',
          patientId: groupData.patientId,
          createdBy: 'current_user',
          createdAt: now,
          members: [{
            id: `member_${Date.now()}`,
            groupId: groupId,
            userId: 'current_user',
            role: 'creator',
            addedAt: now
          }],
          ...groupData
        };
        
        const existingGroups = JSON.parse(localStorage.getItem('patientGroups') || '[]');
        existingGroups.push(newGroup);
        localStorage.setItem('patientGroups', JSON.stringify(existingGroups));
        
        console.log('✅ Group created via fallback service');
        return { success: true, data: newGroup };
      } catch (error) {
        console.error('❌ Fallback service error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  };
};

interface CreateGroupRequest {
  fullName: string;
  dateOfBirth: string;
  insurance: string;
  contactNumber: string;
  emergencyPersonName: string;
  emergencyContact: string;
  homeAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  companyName?: string;
  createdBy: string;
}
import { useAuth } from '@/components/auth/auth-provider';
import { SimpleAddressMap } from '../../../components/map/SimpleAddressMap';


interface NewPatientGroupModalProps {
  setOpen: (open: boolean) => void;
}

export function NewPatientGroupModal({ setOpen, isOpen }: NewPatientGroupModalProps & { isOpen?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [homeAddressSearch, setHomeAddressSearch] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [createdGroupData, setCreatedGroupData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    insurance: '',
    contactNumber: '',
    emergencyPersonName: '',
    emergencyContact: '',
    homeAddress: '',
    city: '',
    state: '',
    zipCode: '',
    primaryPhysicianName: '',
    lastFaceToFaceDate: '',
    physicianContact: '',
    hhOrderDate: '',
    socProvider: 'sn' as 'sn' | 'ot' | 'pt',
    referralSource: '',
    patientTag: '',
    about: '',
    geofence: null as any,
    coordinates: undefined as { lat: number; lng: number } | undefined
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Save the exact coordinates first
      setFormData(prev => ({
        ...prev,
        coordinates: { lat, lng }
      }));
    
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        setFormData(prev => ({
          ...prev,
          homeAddress: address
        }));
        setHomeAddressSearch(address);
        
        // Extract city and state from address details
        const addressDetails = data.address || {};
        if (addressDetails.city || addressDetails.town || addressDetails.village) {
          const city = addressDetails.city || addressDetails.town || addressDetails.village;
          setFormData(prev => ({
            ...prev,
            city: city
          }));
        }
        
        if (addressDetails.state) {
          setFormData(prev => ({
            ...prev,
            state: addressDetails.state.toLowerCase()
          }));
        }
        
        if (addressDetails.postcode) {
          setFormData(prev => ({
            ...prev,
            zipCode: addressDetails.postcode
          }));
        }
        
        // Address updated silently - no toast notification
      }
    } catch (error) {
      
      // Silent failure - user can enter address manually
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      
      // Validate required fields
      const requiredFields = ['fullName', 'dateOfBirth', 'insurance', 'contactNumber', 'homeAddress', 'city', 'zipCode', 'primaryPhysicianName', 'lastFaceToFaceDate', 'physicianContact', 'hhOrderDate'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { getCurrentUser } = await import('aws-amplify/auth');
      const cognitoUser = await getCurrentUser();
      const userId = cognitoUser.username;

      // Create patient data
      const patientData: CreateGroupRequest = {
        ...formData,
        createdBy: userId
      } as CreateGroupRequest;

      // Create patient group using AWS service
      console.log('🚀 Creating patient group with AWS service:', patientData);
      
      // Get patient service (with fallback)
      const patientService = getPatientService();
      
      const result = await patientService.createPatientGroup({
        name: formData.fullName,
        type: 'patient',
        patientId: `patient_${Date.now()}`,
        createdBy: userId,
        dateOfBirth: formData.dateOfBirth,
        contactNumber: formData.contactNumber,
        homeAddress: formData.homeAddress,
        primaryPhysicianName: formData.primaryPhysicianName,
        insurance: formData.insurance,
        socProvider: formData.socProvider,
        patientTag: formData.patientTag,
        emergencyPersonName: formData.emergencyPersonName,
        emergencyContact: formData.emergencyContact,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        physicianContact: formData.physicianContact,
        lastFaceToFaceDate: formData.lastFaceToFaceDate,
        hhOrderDate: formData.hhOrderDate,
        referralSource: formData.referralSource,
        about: formData.about,
        latitude: formData.coordinates?.lat,
        longitude: formData.coordinates?.lng
      });
      
      console.log('✅ AWS service result:', result);
      
      if (result.success && result.groupId) {
        // Upload files if any
        if (uploadedFiles.length > 0) {
          try {
            const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
            const { fetchAuthSession } = await import('aws-amplify/auth');
            const session = await fetchAuthSession();

            const s3Client = new S3Client({
              region: 'us-east-1',
              credentials: session.credentials
            });

            await Promise.all(uploadedFiles.map(async (file) => {
              const key = `patient-attachments/${result.groupId}/${Date.now()}_${file.name}`;
              const arrayBuffer = await file.arrayBuffer();
              await s3Client.send(new PutObjectCommand({
                Bucket: 'medhexa-groups-media-2024',
                Key: key,
                Body: new Uint8Array(arrayBuffer),
                ContentType: file.type
              }));
            }));
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
          }
        }

        toast({
          title: "Patient Group Created",
          description: `Successfully created patient group for ${formData.fullName}`,
          variant: "default",
        });
        
        // Reset form state
        setUploadedFiles([]);
        setFormData({
          fullName: '',
          dateOfBirth: '',
          insurance: '',
          contactNumber: '',
          emergencyPersonName: '',
          emergencyContact: '',
          homeAddress: '',
          city: '',
          state: '',
          zipCode: '',
          primaryPhysicianName: '',
          lastFaceToFaceDate: '',
          physicianContact: '',
          hhOrderDate: '',
          socProvider: 'sn' as 'sn' | 'ot' | 'pt',
          referralSource: '',
          patientTag: '',
          about: '',
          geofence: null,
          coordinates: undefined
        });
        setHomeAddressSearch('');
        
        // Dispatch event to refresh patient groups
        const event = new CustomEvent('patientGroupCreated', { 
          detail: { 
            patientId: result.groupId,
            createdBy: userId
          } 
        });
        window.dispatchEvent(event);
        
        // Store created group data and open add members modal
        setCreatedGroupData({
          groupId: result.groupId,
          name: formData.fullName,
          address: formData.homeAddress,
          coordinates: formData.coordinates
        });
        setOpen(false);
        setIsAddMembersModalOpen(true);
      } else {
        throw new Error(result.error || 'Failed to create patient group');
      }
      
    } catch (error) {
      console.error('❌ Error creating patient group:', error);
      
      // Fallback to localStorage if AWS service fails
      try {
        console.log('🔄 Falling back to localStorage storage');
        
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newGroup = {
          id: groupId,
          name: formData.fullName,
          type: 'patient',
          patientId: `patient_${Date.now()}`,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          members: [{
            id: `member_${Date.now()}`,
            groupId: groupId,
            userId: userId,
            role: 'creator',
            addedAt: new Date().toISOString()
          }],
          // Patient data
          dateOfBirth: formData.dateOfBirth,
          contactNumber: formData.contactNumber,
          homeAddress: formData.homeAddress,
          primaryPhysicianName: formData.primaryPhysicianName,
          insurance: formData.insurance,
          socProvider: formData.socProvider,
          patientTag: formData.patientTag,
          emergencyPersonName: formData.emergencyPersonName,
          emergencyContact: formData.emergencyContact,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          physicianContact: formData.physicianContact,
          lastFaceToFaceDate: formData.lastFaceToFaceDate,
          hhOrderDate: formData.hhOrderDate,
          referralSource: formData.referralSource,
          about: formData.about,
          coordinates: formData.coordinates
        };
        
        // Save to localStorage
        const existingGroups = JSON.parse(localStorage.getItem('patientGroups') || '[]');
        existingGroups.push(newGroup);
        localStorage.setItem('patientGroups', JSON.stringify(existingGroups));
        
        console.log('✅ Patient group saved to localStorage:', newGroup);
        
        toast({
          title: "Patient Group Created",
          description: `Successfully created patient group for ${formData.fullName}.`,
          variant: "default",
        });
        
        // Dispatch event to refresh the chat list
        window.dispatchEvent(new CustomEvent('patientGroupCreated', {
          detail: { groupId: groupId, group: newGroup }
        }));
        
        setOpen(false);
        
      } catch (fallbackError) {
        console.error('❌ Fallback to localStorage also failed:', fallbackError);
        toast({
          title: "Save Failed",
          description: 'Failed to save patient group. Please try again.',
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Files Selected",
      description: `${newFiles.length} file(s) ready to upload`,
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      {isAddMembersModalOpen && createdGroupData && (
        <AddMembersModal
          isOpen={isAddMembersModalOpen}
          onClose={() => setIsAddMembersModalOpen(false)}
          patientGroupId={createdGroupData.groupId}
          patientGroupName={createdGroupData.name}
          patientAddress={createdGroupData.address}
          patientCoordinates={createdGroupData.coordinates}
          onMembersAdded={() => {
            setIsAddMembersModalOpen(false);
            setCreatedGroupData(null);
          }}
          mode="direct"
        />
      )}
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-primary text-primary-foreground p-4 flex-shrink-0">
          <DialogTitle className="text-center text-xl">
            New Patient Group
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Patient Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Patient Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="full-name">Full Name*</Label>
                  <Input 
                    id="full-name" 
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="dob">Date of Birth*</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="insurance">Insurance*</Label>
                  <Input 
                    id="insurance" 
                    value={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.value)}
                    placeholder="Enter insurance provider"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-number">Contact Number*</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="+92">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+92">+92</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+91">+91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="contact-number" 
                      type="tel" 
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="3322873900"
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="emergency-person">Emergency Person Name</Label>
                  <Input 
                    id="emergency-person" 
                    value={formData.emergencyPersonName}
                    onChange={(e) => handleInputChange('emergencyPersonName', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="emergency-contact">Emergency Person Contact</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="+92">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+92">+92</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+91">+91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="emergency-contact" 
                      type="tel" 
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="3322873900"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label htmlFor="home-address">Home Address*</Label>
                  <Input 
                    id="home-address" 
                    value={formData.homeAddress}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, homeAddress: e.target.value }));
                      setHomeAddressSearch(e.target.value);
                    }}
                    placeholder="Search for home address or click on map to select location"
                    required
                  />
                  <div className="space-y-2">
                    <SimpleAddressMap 
                      searchLocation={homeAddressSearch} 
                      onLocationSelect={(coordinates) => { 
                        // Get address from coordinates using reverse geocoding
                        getAddressFromCoordinates(coordinates.lat, coordinates.lng);
                      }} 
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="city">City*</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="state">State*</Label>
                        <Input 
                          id="state" 
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Enter state"
                          required
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="zip-code">Zip Code*</Label>
                        <Input 
                          id="zip-code" 
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          placeholder="Enter zip code"
                          required
                        />
                    </div>
                </div>
              </div>
            </div>

            {/* Physician Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Physician Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="primary-physician">Primary Physician Name*</Label>
                  <Input 
                    id="primary-physician" 
                    value={formData.primaryPhysicianName}
                    onChange={(e) => handleInputChange('primaryPhysicianName', e.target.value)}
                    placeholder="Enter physician name"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="f2f-date">Last Face to Face Date*</Label>
                  <Input 
                    id="f2f-date" 
                    type="date" 
                    value={formData.lastFaceToFaceDate}
                    onChange={(e) => handleInputChange('lastFaceToFaceDate', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="physician-contact">Contact Number*</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="+92">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+92">+92</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+91">+91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="physician-contact" 
                      type="tel" 
                      value={formData.physicianContact}
                      onChange={(e) => handleInputChange('physicianContact', e.target.value)}
                      placeholder="3322873900"
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="hh-order-date">HH Order Date*</Label>
                  <Input 
                    id="hh-order-date" 
                    type="date" 
                    value={formData.hhOrderDate}
                    onChange={(e) => handleInputChange('hhOrderDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          
            {/* Other Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                    <Label>Who will Do the SOC*</Label>
                    <RadioGroup 
                      value={formData.socProvider}
                      onValueChange={(value) => handleInputChange('socProvider', value)}
                      className="flex gap-4 pt-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sn" id="sn" />
                            <Label htmlFor="sn" className="font-normal">SN</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ot" id="ot" />
                            <Label htmlFor="ot" className="font-normal">OT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pt" id="pt" />
                            <Label htmlFor="pt" className="font-normal">PT</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="referral-source">Referral Source</Label>
                    <Input 
                      id="referral-source" 
                      value={formData.referralSource}
                      onChange={(e) => handleInputChange('referralSource', e.target.value)}
                      placeholder="Enter referral source"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="patient-tag">Patient Tag</Label>
                    <Input 
                      id="patient-tag" 
                      value={formData.patientTag}
                      onChange={(e) => handleInputChange('patientTag', e.target.value)}
                      placeholder="Enter patient tag"
                    />
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="about">About</Label>
                <Textarea 
                  id="about" 
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  placeholder="Enter additional information about the patient"
                  rows={2} 
                />
            </div>
          </div>
          <DialogFooter className="p-4 pt-0 flex-shrink-0 flex flex-col gap-2 w-full border-t bg-gray-50">
            <div className="flex justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attachment
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFiles.length > 0 && (
                    <span className="text-sm text-muted-foreground">{uploadedFiles.length} file(s)</span>
                  )}
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {uploadedFiles.map((file, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                        {file.name}
                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={(e) => {
                    e.preventDefault();
                    handleCancel();
                  }}>Cancel</Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create & Add Members'}
                  </Button>
              </div>
            </div>
          </DialogFooter>

        </form>
      </DialogContent>


    </>
  );
}
