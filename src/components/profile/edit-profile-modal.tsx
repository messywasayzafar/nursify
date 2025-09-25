'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

interface EditProfileModalProps {
  setOpen: (open: boolean) => void;
}

export function EditProfileModal({ setOpen }: EditProfileModalProps) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = () => {
    if (user) {
      setFullName(user.fullName || user.username);
      setEmail(user.email || user.username);
    }
    
    // Load from localStorage
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const profile = JSON.parse(saved);
      setPhoneNumber(profile.phoneNumber || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setZipCode(profile.zipCode || '');
      setProfileImage(profile.profileImage || '');
    } else {
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

    if (!user) {
      alert('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }

    try {
      const { updateUserAttributes } = await import('aws-amplify/auth');
      
      const attributes: Record<string, string> = {};
      if (fullName?.trim()) attributes.name = fullName.trim();
      if (phoneNumber?.trim()) {
        const formattedPhone = phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+1${phoneNumber.trim().replace(/\D/g, '')}`;
        attributes.phone_number = formattedPhone;
      }
      if (address?.trim()) attributes.address = address.trim();
      if (city?.trim()) attributes['custom:city'] = city.trim();
      if (state?.trim()) attributes['custom:state'] = state.trim();
      if (zipCode?.trim()) attributes['custom:zipCode'] = zipCode.trim();
      
      await updateUserAttributes({ userAttributes: attributes });
      alert('Profile updated in Cognito successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error updating Cognito:', error);
      alert('Failed to update Cognito. Please try again.');
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
                <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-teal-500 text-white">
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
                        try {
                          const { uploadData } = await import('aws-amplify/storage');
                          const key = `profile-images/${user?.username}-${Date.now()}`;
                          const result = await uploadData({
                            key,
                            data: file,
                            options: {
                              accessLevel: 'guest'
                            }
                          }).result;
                          setProfileImage(result.key);
                        } catch (error) {
                          console.error('Upload failed:', error);
                          // Fallback to base64
                          const reader = new FileReader();
                          reader.onload = (e) => setProfileImage(e.target?.result as string);
                          reader.readAsDataURL(file);
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