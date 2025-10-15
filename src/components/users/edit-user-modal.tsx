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
import { Camera, MapPin, Shield, CheckCircle2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface EditUserModalProps {
  setOpen: (open: boolean) => void;
  onUserUpdated: () => void;
  userEmail: string;
}

export function EditUserModal({ setOpen, onUserUpdated, userEmail: username }: EditUserModalProps) {
  const [workingAreaSearch, setWorkingAreaSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [initialCoordinates, setInitialCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);

  React.useEffect(() => {
    fetchUserData();
    
    // Cleanup function when component unmounts
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, [username]);

  // Handle click outside to close suggestions
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.suggestions-container')) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (workingAreaSearch.includes('|')) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      if (workingAreaSearch.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(workingAreaSearch)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [workingAreaSearch]);

  const fetchUserData = async () => {
    if (!username || username.trim() === '') {
      console.error('Username is empty');
      toast({ title: 'Error', description: 'User identifier is missing', variant: 'destructive' });
      setLoading(false);
      return;
    }
    
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession({ forceRefresh: false });
      
      if (!session.credentials) {
        toast({ title: 'Error', description: 'Unable to authenticate', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { CognitoIdentityProviderClient, AdminGetUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials,
      });

      const command = new AdminGetUserCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Username: username,
      });

      const response = await client.send(command);
      const getAttr = (name: string) => response.UserAttributes?.find(attr => attr.Name === name)?.Value || '';
      const permissionsStr = getAttr('custom:permissions');
      const permissions = permissionsStr ? permissionsStr.split(',').filter(Boolean) : [];
      
      console.log('Fetched user permissions:', permissions);
      console.log('Setting checked permissions state:', permissions);
      
      // Set the checked permissions state
      setCheckedPermissions(permissions);
      
      setUserData({
        name: getAttr('name'),
        email: getAttr('email'),
        phoneNumber: getAttr('phone_number'),
        homeAddress: getAttr('address'),
        city: getAttr('custom:city'),
        state: getAttr('custom:state'),
        zipCode: getAttr('custom:zip_code'),
        designation: getAttr('custom:designation'),
        department: getAttr('custom:department'),
        gender: getAttr('gender'),
        workingArea: getAttr('custom:geodata'),
        profileImage: getAttr('picture'),
        permissions: permissions,
        parentAgencyId: getAttr('custom:parent_agency_id'),
        parentAgencyName: getAttr('custom:parent_agency_name'),
        location: getAttr('custom:location'),
      });

      // Parse coordinates from geodata
      const geodata = getAttr('custom:geodata');
      if (geodata && geodata.includes(',')) {
        const [lat, lng] = geodata.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log('📍 Parsed coordinates from geodata:', { lat, lng });
          setInitialCoordinates({ lat, lng });
          setSelectedCoordinates({ lat, lng });
        }
      }
      
      setWorkingAreaSearch(getAttr('custom:geodata'));
      setSelectedImage(getAttr('picture'));
      
      toast({ title: 'Success', description: 'User data loaded successfully' });
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to load user data', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      
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
      
      console.log('Updating user with permissions:', permissions);
      
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession({ forceRefresh: true });
      
      if (!session.credentials) {
        toast({ title: 'Error', description: 'Unable to authenticate', variant: 'destructive' });
        return;
      }

      const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const client = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials,
      });

      const attributes = [
        { Name: 'name', Value: formData.get('full-name') as string },
        { Name: 'phone_number', Value: formData.get('phone-number') as string },
        { Name: 'address', Value: formData.get('home-address') as string },
        { Name: 'custom:city', Value: formData.get('city') as string },
        { Name: 'custom:state', Value: formData.get('state') as string },
        { Name: 'custom:zip_code', Value: formData.get('zip') as string },
        { Name: 'custom:designation', Value: formData.get('designation') as string },
        { Name: 'custom:department', Value: formData.get('department') as string },
        { Name: 'custom:geodata', Value: selectedCoordinates ? `${selectedCoordinates.lat},${selectedCoordinates.lng}` : workingAreaSearch },
        { Name: 'custom:permissions', Value: permissions.join(',') },
      ];

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Username: username,
        UserAttributes: attributes,
      });

      await client.send(command);
      
      // Show success toast
      toast({ 
        title: 'Success', 
        description: `User updated successfully with ${permissions.length} permissions` 
      });
      
      // Close modal and cleanup
      setIsSubmitting(false);
      setOpen(false);
      
      // Force cleanup of modal backdrop
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }, 100);
      
      // Refresh user list after modal is closed
      setTimeout(() => {
        onUserUpdated();
      }, 400);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update user', 
        variant: 'destructive' 
      });
      setIsSubmitting(false);
    }
  };

  if (loading || !userData) {
    return (
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Edit User</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-8">Loading...</div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0" onInteractOutside={(e) => e.preventDefault()}>
      <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
        <DialogTitle className="text-center text-2xl">Edit User</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-4 overflow-y-auto flex-1">
          <div className="col-span-1 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              <Select name="designation" defaultValue={userData.designation || 'skilled-nurse'}>
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
              <Select name="department" defaultValue={userData.department || 'sn'}>
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
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-cyan-600" />
                <Label className="text-base font-semibold">Permissions</Label>
              </div>
              
              {/* Permissions Summary */}
              {userData.permissions && userData.permissions.length > 0 && (
                <Card className="p-3 mb-2 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Currently has {userData.permissions.length} permission{userData.permissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userData.permissions.map((perm: string) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
              
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-new-patients" 
                    name="perm-new-patients" 
                    defaultChecked={checkedPermissions.includes('new-patients')}
                  />
                  <Label htmlFor="perm-new-patients" className="cursor-pointer text-sm font-normal">New Patients Charts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-internal-groups" 
                    name="perm-internal-groups" 
                    defaultChecked={checkedPermissions.includes('internal-groups')}
                  />
                  <Label htmlFor="perm-internal-groups" className="cursor-pointer text-sm font-normal">New Internal Groups</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-broadcasting" 
                    name="perm-broadcasting" 
                    defaultChecked={checkedPermissions.includes('broadcasting')}
                  />
                  <Label htmlFor="perm-broadcasting" className="cursor-pointer text-sm font-normal">New Broadcasting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-billing" 
                    name="perm-billing" 
                    defaultChecked={checkedPermissions.includes('billing')}
                  />
                  <Label htmlFor="perm-billing" className="cursor-pointer text-sm font-normal">Billing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-adr-record" 
                    name="perm-adr-record" 
                    defaultChecked={checkedPermissions.includes('adr-record')}
                  />
                  <Label htmlFor="perm-adr-record" className="cursor-pointer text-sm font-normal">ADR Record</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-order-followup" 
                    name="perm-order-followup" 
                    defaultChecked={checkedPermissions.includes('order-followup')}
                  />
                  <Label htmlFor="perm-order-followup" className="cursor-pointer text-sm font-normal">Order Follow Up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-export-chats" 
                    name="perm-export-chats" 
                    defaultChecked={checkedPermissions.includes('export-chats')}
                  />
                  <Label htmlFor="perm-export-chats" className="cursor-pointer text-sm font-normal">Export Chats with media</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-manage-users" 
                    name="perm-manage-users" 
                    defaultChecked={checkedPermissions.includes('manage-users')}
                  />
                  <Label htmlFor="perm-manage-users" className="cursor-pointer text-sm font-normal">Add/Edit/Delete Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="perm-report-center" 
                    name="perm-report-center" 
                    defaultChecked={checkedPermissions.includes('report-center')}
                  />
                  <Label htmlFor="perm-report-center" className="cursor-pointer text-sm font-normal">Report Center</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" name="full-name" defaultValue={userData.name} placeholder="Enter full name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input id="phone-number" name="phone-number" type="tel" defaultValue={userData.phoneNumber} placeholder="Enter phone number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="home-address">Home Address</Label>
              <Input id="home-address" name="home-address" defaultValue={userData.homeAddress} placeholder="Enter home address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={userData.city} placeholder="City" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue={userData.state} placeholder="State" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">Zip Code</Label>
                <Input id="zip" name="zip" defaultValue={userData.zipCode} placeholder="Zip Code" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="working-area">Working Area</Label>
              <div className="relative suggestions-container">
                <Input 
                  id="working-area" 
                  placeholder="Enter working area" 
                  value={workingAreaSearch} 
                  onChange={(e) => setWorkingAreaSearch(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding to allow clicking on suggestions
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          const searchValue = `${suggestion.display_name}|${suggestion.lat},${suggestion.lon}`;
                          setWorkingAreaSearch(searchValue);
                          setSuggestions([]);
                          setShowSuggestions(false);
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
                  initialCoordinates={initialCoordinates}
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

          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 bg-white">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              setOpen(false);
              // Ensure body pointer events are reset
              setTimeout(() => {
                document.body.style.pointerEvents = '';
              }, 100);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Updating...
              </>
            ) : (
              "Update User"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
