'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { uploadData, getUrl } from 'aws-amplify/storage';

interface EditProfileModalProps {
  setOpen: (open: boolean) => void;
}

export function EditProfileModal({ setOpen }: EditProfileModalProps) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { fetchUserAttributes, getCurrentUser } = await import('aws-amplify/auth');
      await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      setFullName(attributes.name || '');
      setEmail(attributes.email || '');
      setPhoneNumber(attributes.phone_number || '');
      setAddress(attributes.address || '');
      setCity(attributes['custom:city'] || '');
      setState(attributes['custom:state'] || '');
      setZipCode(attributes['custom:zip_code'] || '');
      setProfileImage(attributes.picture || '');
    } catch (error) {
      // User not authenticated, set empty values
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setProfileImage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      if (!session.tokens?.accessToken) {
        throw new Error('Not authenticated');
      }
      
      // Use AWS SDK directly
      const { CognitoIdentityProviderClient, UpdateUserAttributesCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      
      const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
      
      const userAttributes = [];
      if (fullName?.trim()) userAttributes.push({ Name: 'name', Value: fullName.trim() });
      if (profileImage?.trim()) userAttributes.push({ Name: 'picture', Value: profileImage.trim() });
      if (phoneNumber?.trim()) userAttributes.push({ Name: 'phone_number', Value: phoneNumber.trim() });
      if (address?.trim()) userAttributes.push({ Name: 'address', Value: address.trim() });
      if (city?.trim()) userAttributes.push({ Name: 'custom:city', Value: city.trim() });
      if (state?.trim()) userAttributes.push({ Name: 'custom:state', Value: state.trim() });
      if (zipCode?.trim()) userAttributes.push({ Name: 'custom:zip_code', Value: zipCode.trim() });
      
      if (userAttributes.length > 0) {
        const command = new UpdateUserAttributesCommand({
          AccessToken: session.tokens.accessToken.toString(),
          UserAttributes: userAttributes
        });
        
        await client.send(command);
      }
      
      alert('Profile updated successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-center mb-6 relative">
          <h2 className="text-xl font-semibold text-center">Profile</h2>
          <button onClick={() => setOpen(false)} className="absolute right-0 text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=face"} alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <label className={`absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${uploadingImage ? 'bg-gray-400' : 'bg-teal-500'} text-white`}>
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingImage(true);
                        try {
                          // Check if user is authenticated
                          const { getCurrentUser } = await import('aws-amplify/auth');
                          await getCurrentUser();
                          
                          // Preview image locally first
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setProfileImage(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                          
                          // Upload to S3 using Amplify Storage
                          const fileName = `profile-images/${Date.now()}-${file.name}`;
                          
                          console.log('Uploading to S3 with key:', fileName);
                          
                          const result = await uploadData({
                            key: fileName,
                            data: file,
                            options: {
                              contentType: file.type
                            }
                          }).result;
                          
                          console.log('Upload result:', result);
                          
                          // Get the uploaded file URL
                          const urlResult = await getUrl({ key: fileName });
                          
                          console.log('Generated URL:', urlResult.url.toString());
                          setProfileImage(urlResult.url.toString());
                          
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert(`Failed to upload image: ${(error as any)?.message || 'Unknown error'}`);
                        } finally {
                          setUploadingImage(false);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <input 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <input 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
                value={email} 
                type="email" 
                disabled 
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <input 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                type="tel" 
                placeholder="555-123-4567" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Home Address</Label>
              <input 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter your address" 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <input 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Anytown" 
                />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <input 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  placeholder="CA" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Zip Code</Label>
                <input 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)} 
                  placeholder="12345" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}