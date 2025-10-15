import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { storageService } from '../services/storage-service';
import { cognitoUserService } from '../services/cognito-user-service';
import { userService } from '../services/user-service';
import type { GeofenceData, UserFormData } from '../types';

export const useUserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

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

  const submitUserForm = async (formData: UserFormData) => {
    setIsSubmitting(true);

    try {
      const { fullName, email, phoneNumber, homeAddress, city, state, zipCode, designation, department, profileImage, workingArea, permissions, gender, birthdate } = formData;

      if (!fullName || !email) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (Full Name and Email).",
          variant: "destructive"
        });
        return;
      }

      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      let profileImageUrl = '';

      // Upload image to S3 if one is selected
      if (profileImage) {
        try {
          console.log('Attempting to upload profile picture...');
          const timestamp = Date.now();
          const fileExtension = profileImage.name.split('.').pop();
          const s3Key = `profile-images/${email}-${timestamp}.${fileExtension}`;

          const uploadResult = await storageService.uploadImage(profileImage, s3Key);
          profileImageUrl = uploadResult.url || '';
          console.log('Profile picture uploaded successfully:', profileImageUrl);
        } catch (error: any) {
          console.error('Error uploading image:', error);
          console.error('Error details:', error.message);
          
          // Show specific error message based on error type
          if (error.message && error.message.includes('permission')) {
            toast({
              title: "Profile Picture Upload Failed",
              description: "AWS permissions issue. User created without profile picture. Contact administrator to fix S3 permissions.",
              variant: "destructive",
              duration: 5000,
            });
          } else {
            toast({
              title: "Profile Picture Upload Failed",
              description: `${error.message || 'Unknown error'}. User created without profile picture.`,
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      }

      // Create user in Cognito
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      const companyName = localStorage.getItem('companyname') || '';
      console.log('Company name from localStorage:', companyName);

      try {
        const cognitoResult = await cognitoUserService.createUser({
          email,
          password: tempPassword,
          firstName,
          lastName,
          phoneNumber: phoneNumber || undefined,
          profileImageUrl: profileImageUrl || undefined,
          homeAddress: homeAddress || undefined,
          city: city || undefined,
          state: state || undefined,
          zipCode: zipCode || undefined,
          designation: designation || undefined,
          department: department || undefined,
          roles: formData.roles || 'field',
          geodata: selectedCoordinates ? `${selectedCoordinates.lat},${selectedCoordinates.lng}` : workingArea || '',
          permissions: permissions || undefined,
          companyName: companyName,
          gender: gender || undefined,
          birthdate: birthdate || undefined
        });

        console.log('Cognito user created:', cognitoResult);
        
        toast({
          title: "Success",
          description: `User ${firstName} ${lastName} created! Temporary password has been sent to ${email}`,
        });
      } catch (cognitoError) {
        console.error('Error creating Cognito user:', cognitoError);
        toast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          variant: "destructive"
        });
        return;
      }

      return true;
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }

    return false; // Error occurred
  };

  return {
    isSubmitting,
    selectedImage,
    selectedCoordinates,
    setSelectedCoordinates,
    handleImageChange,
    submitUserForm
  };
};
