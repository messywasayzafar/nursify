import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { SimpleAddressMap } from '../../../components/map/SimpleAddressMap';
import { toast } from '@/hooks/use-toast';
import { useUserForm } from './hooks/use-user-form';
import type { AddUserModalProps } from './types';

// Popular country codes
const countryCodes = [
  { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
];

export function AddUserModal({ setOpen, onUserAdded }: AddUserModalProps) {
  const [workingAreaSearch, setWorkingAreaSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [selectedGender, setSelectedGender] = useState('');
  const { isSubmitting, selectedImage, selectedCoordinates, setSelectedCoordinates, handleImageChange, submitUserForm } = useUserForm();

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (workingAreaSearch.includes('|')) return;
      if (workingAreaSearch.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(workingAreaSearch)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [workingAreaSearch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const fullName = formData.get('full-name') as string || '';
    const email = formData.get('email') as string || '';
    const phoneNumberRaw = formData.get('phone-number') as string || '';
    // Format phone number in E.164 format: remove all non-digits and add country code
    const cleanedPhone = phoneNumberRaw.replace(/\D/g, '');
    const phoneNumber = cleanedPhone ? `${selectedCountryCode}${cleanedPhone}` : '';
    const homeAddress = formData.get('home-address') as string || '';
    const city = formData.get('city') as string || '';
    const state = formData.get('state') as string || '';
    const zipCode = formData.get('zip') as string || '';
    const designation = formData.get('designation') as string || '';
    const department = formData.get('department') as string || '';
    const gender = selectedGender; // Use state instead of formData
    const birthdate = formData.get('birthdate') as string || '';

    const roles = [];
    if (formData.get('field-staff')) roles.push('field');
    if (formData.get('office-staff')) roles.push('office');
    
    const permissions = [];
    if (formData.get('perm-new-patients')) permissions.push('new-patients');
    if (formData.get('perm-internal-groups')) permissions.push('internal-groups');
    if (formData.get('perm-broadcasting')) permissions.push('broadcasting');
    if (formData.get('perm-billing')) permissions.push('billing');
    if (formData.get('perm-adr-record')) permissions.push('adr-record');
    if (formData.get('perm-order-followup')) permissions.push('order-followup');
    if (formData.get('perm-export-chats')) permissions.push('export-chats');
    if (formData.get('perm-manage-users')) permissions.push('manage-users');
    if (formData.get('perm-report-center')) permissions.push('report-center');

    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    const profileImage = fileInput?.files?.[0];

    const userData = {
      fullName,
      email,
      phoneNumber,
      homeAddress,
      city,
      state,
      zipCode,
      designation,
      department,
      profileImage,
      workingArea: workingAreaSearch || undefined,
      roles: roles.join(',') || 'field',
      permissions: permissions.join(',') || undefined,
      gender: gender || undefined,
      birthdate: birthdate || undefined
    };

    try {
      const success = await submitUserForm(userData);
      if (success) {
        setOpen(false);
        onUserAdded();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">New User</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          <div className="col-span-1 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={selectedImage || "https://picsum.photos/128"} alt="User" data-ai-hint="person" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Camera className="h-4 w-4" />
                  <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageChange(e as any)} />
                </label>
              </div>

            </div>
            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              <Select name="designation" defaultValue="skilled-nurse">
                <SelectTrigger id="designation">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skilled-nurse">Skilled Nurse</SelectItem>
                  <SelectItem value="physical-therapy">Physical Therapy</SelectItem>
                  <SelectItem value="occupational-therapy">Occupational Therapy</SelectItem>
                  <SelectItem value="certified-occupational-therapy-assistant">Certified Occupational Therapy Assistant</SelectItem>
                  <SelectItem value="licensed-practical-nurse">Licensed Practical Nurse</SelectItem>
                  <SelectItem value="physical-therapy-assistant">Physical Therapy Assistant</SelectItem>
                  <SelectItem value="medical-social-worker">Medical Social Worker</SelectItem>
                  <SelectItem value="home-health-aid">Home Health Aid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department" defaultValue="sn">
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sn">SN</SelectItem>
                  <SelectItem value="pt">PT</SelectItem>
                  <SelectItem value="ot">OT</SelectItem>
                  <SelectItem value="lpn">LPN</SelectItem>
                  <SelectItem value="pta">PTA</SelectItem>
                  <SelectItem value="cota">COTA</SelectItem>
                  <SelectItem value="msw">MSW</SelectItem>
                  <SelectItem value="hha">HHA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Roles</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-staff" name="field-staff" />
                  <Label htmlFor="field-staff" className="cursor-pointer">Field Staff</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="office-staff" name="office-staff" />
                  <Label htmlFor="office-staff" className="cursor-pointer">Office Staff</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-new-patients" name="perm-new-patients" />
                  <Label htmlFor="perm-new-patients" className="cursor-pointer text-sm">New Patients Charts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-internal-groups" name="perm-internal-groups" />
                  <Label htmlFor="perm-internal-groups" className="cursor-pointer text-sm">New Internal Groups</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-broadcasting" name="perm-broadcasting" />
                  <Label htmlFor="perm-broadcasting" className="cursor-pointer text-sm">New Broadcasting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-billing" name="perm-billing" />
                  <Label htmlFor="perm-billing" className="cursor-pointer text-sm">Billing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-adr-record" name="perm-adr-record" />
                  <Label htmlFor="perm-adr-record" className="cursor-pointer text-sm">ADR Record</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-order-followup" name="perm-order-followup" />
                  <Label htmlFor="perm-order-followup" className="cursor-pointer text-sm">Order Follow Up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-export-chats" name="perm-export-chats" />
                  <Label htmlFor="perm-export-chats" className="cursor-pointer text-sm">Export Chats with media</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-manage-users" name="perm-manage-users" />
                  <Label htmlFor="perm-manage-users" className="cursor-pointer text-sm">Add/Edit/Delete Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm-report-center" name="perm-report-center" />
                  <Label htmlFor="perm-report-center" className="cursor-pointer text-sm">Report Center</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" name="full-name" placeholder="Enter full name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="Enter email address" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <div className="flex gap-2">
                <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                  <SelectTrigger className="w-[160px]" id="phone-country">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                          <span className="text-xs text-gray-500">{country.country}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input id="phone-number" name="phone-number" type="tel" placeholder="Enter phone number" className="flex-1" data-country-code={selectedCountryCode} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthdate">Date of Birth</Label>
              <Input id="birthdate" name="birthdate" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="working-area">Working Area</Label>
              <div className="relative">
                <Input id="working-area" placeholder="Enter working area" value={workingAreaSearch} onChange={(e) => setWorkingAreaSearch(e.target.value)} />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          const searchValue = `${suggestion.display_name}|${suggestion.lat},${suggestion.lon}`;
                          setWorkingAreaSearch(searchValue);
                          setSuggestions([]);
                        }}
                      >
                        {suggestion.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <SimpleAddressMap 
                  searchLocation={workingAreaSearch} 
                  onLocationSelect={(coordinates) => { 
                    setSelectedCoordinates(coordinates);
                    toast({ 
                      title: "Location Selected", 
                      description: `Pin placed at coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` 
                    }); 
                  }} 
                />
                {selectedCoordinates && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <MapPin className="h-4 w-4" />
                    <span>Pin placed at {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="home-address">Home Address</Label>
              <Input id="home-address" name="home-address" placeholder="Enter home address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="City" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" placeholder="State" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">Zip Code</Label>
                <Input id="zip" name="zip" placeholder="Zip Code" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
            {isSubmitting ? "Creating User..." : "Add User"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
