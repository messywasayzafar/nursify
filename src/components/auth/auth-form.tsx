"use client";
import { Amplify } from 'aws-amplify';
import awsExports from '../../../amplifyconfiguration.json';

// Force reconfigure to clear cache
Amplify.configure(awsExports, { ssr: false });
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { ChangePasswordForm } from './change-password-form';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().min(1, 'Department is required'),
  role: z.string().min(1, 'Role is required'),
  companyName: z.string().min(1, 'Company name is required'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [countrySearch, setCountrySearch] = useState('');
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [tempPasswordEmail, setTempPasswordEmail] = useState('');

  const countries = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+30', name: 'Greece', flag: '🇬🇷' },
    { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: '+32', name: 'Belgium', flag: '🇧🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+36', name: 'Hungary', flag: '🇭🇺' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+40', name: 'Romania', flag: '🇷🇴' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: '+48', name: 'Poland', flag: '🇵🇱' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+51', name: 'Peru', flag: '🇵🇪' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+53', name: 'Cuba', flag: '🇨🇺' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+90', name: 'Turkey', flag: '🇹🇷' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
    { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
    { code: '+98', name: 'Iran', flag: '🇮🇷' },
    { code: '+212', name: 'Morocco', flag: '🇲🇦' },
    { code: '+213', name: 'Algeria', flag: '🇩🇿' },
    { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
    { code: '+218', name: 'Libya', flag: '🇱🇾' },
    { code: '+220', name: 'Gambia', flag: '🇬🇲' },
    { code: '+221', name: 'Senegal', flag: '🇸🇳' },
    { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
    { code: '+223', name: 'Mali', flag: '🇲🇱' },
    { code: '+224', name: 'Guinea', flag: '🇬🇳' },
    { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
    { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+227', name: 'Niger', flag: '🇳🇪' },
    { code: '+228', name: 'Togo', flag: '🇹🇬' },
    { code: '+229', name: 'Benin', flag: '🇧🇯' },
    { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
    { code: '+231', name: 'Liberia', flag: '🇱🇷' },
    { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+233', name: 'Ghana', flag: '🇬🇭' },
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+235', name: 'Chad', flag: '🇹🇩' },
    { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
    { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
    { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
    { code: '+239', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+241', name: 'Gabon', flag: '🇬🇦' },
    { code: '+242', name: 'Republic of the Congo', flag: '🇨🇬' },
    { code: '+243', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
    { code: '+244', name: 'Angola', flag: '🇦🇴' },
    { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+246', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
    { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
    { code: '+249', name: 'Sudan', flag: '🇸🇩' },
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
    { code: '+252', name: 'Somalia', flag: '🇸🇴' },
    { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: '+257', name: 'Burundi', flag: '🇧🇮' },
    { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
    { code: '+260', name: 'Zambia', flag: '🇿🇲' },
    { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
    { code: '+262', name: 'Réunion', flag: '🇷🇪' },
    { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+264', name: 'Namibia', flag: '🇳🇦' },
    { code: '+265', name: 'Malawi', flag: '🇲🇼' },
    { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
    { code: '+267', name: 'Botswana', flag: '🇧🇼' },
    { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
    { code: '+269', name: 'Comoros', flag: '🇰🇲' },
    { code: '+290', name: 'Saint Helena', flag: '🇸🇭' },
    { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
    { code: '+297', name: 'Aruba', flag: '🇦🇼' },
    { code: '+298', name: 'Faroe Islands', flag: '🇫🇴' },
    { code: '+299', name: 'Greenland', flag: '🇬🇱' },
    { code: '+350', name: 'Gibraltar', flag: '🇬🇮' },
    { code: '+351', name: 'Portugal', flag: '🇵🇹' },
    { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
    { code: '+353', name: 'Ireland', flag: '🇮🇪' },
    { code: '+354', name: 'Iceland', flag: '🇮🇸' },
    { code: '+355', name: 'Albania', flag: '🇦🇱' },
    { code: '+356', name: 'Malta', flag: '🇲🇹' },
    { code: '+357', name: 'Cyprus', flag: '🇨🇾' },
    { code: '+358', name: 'Finland', flag: '🇫🇮' },
    { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
    { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', name: 'Latvia', flag: '🇱🇻' },
    { code: '+372', name: 'Estonia', flag: '🇪🇪' },
    { code: '+373', name: 'Moldova', flag: '🇲🇩' },
    { code: '+374', name: 'Armenia', flag: '🇦🇲' },
    { code: '+375', name: 'Belarus', flag: '🇧🇾' },
    { code: '+376', name: 'Andorra', flag: '🇦🇩' },
    { code: '+377', name: 'Monaco', flag: '🇲🇨' },
    { code: '+378', name: 'San Marino', flag: '🇸🇲' },
    { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
    { code: '+381', name: 'Serbia', flag: '🇷🇸' },
    { code: '+382', name: 'Montenegro', flag: '🇲🇪' },
    { code: '+383', name: 'Kosovo', flag: '🇽🇰' },
    { code: '+385', name: 'Croatia', flag: '🇭🇷' },
    { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
    { code: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: '+389', name: 'North Macedonia', flag: '🇲🇰' },
    { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
    { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
    { code: '+423', name: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+500', name: 'Falkland Islands', flag: '🇫🇰' },
    { code: '+501', name: 'Belize', flag: '🇧🇿' },
    { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+504', name: 'Honduras', flag: '🇭🇳' },
    { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', name: 'Panama', flag: '🇵🇦' },
    { code: '+508', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
    { code: '+509', name: 'Haiti', flag: '🇭🇹' },
    { code: '+590', name: 'Guadeloupe', flag: '🇬🇵' },
    { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+592', name: 'Guyana', flag: '🇬🇾' },
    { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+594', name: 'French Guiana', flag: '🇬🇫' },
    { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+596', name: 'Martinique', flag: '🇲🇶' },
    { code: '+597', name: 'Suriname', flag: '🇸🇷' },
    { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+599', name: 'Netherlands Antilles', flag: '🇧🇶' },
    { code: '+670', name: 'East Timor', flag: '🇹🇱' },
    { code: '+672', name: 'Antarctica', flag: '🇦🇶' },
    { code: '+673', name: 'Brunei', flag: '🇧🇳' },
    { code: '+674', name: 'Nauru', flag: '🇳🇷' },
    { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
    { code: '+676', name: 'Tonga', flag: '🇹🇴' },
    { code: '+677', name: 'Solomon Islands', flag: '🇸🇧' },
    { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
    { code: '+679', name: 'Fiji', flag: '🇫🇯' },
    { code: '+680', name: 'Palau', flag: '🇵🇼' },
    { code: '+681', name: 'Wallis and Futuna', flag: '🇼🇫' },
    { code: '+682', name: 'Cook Islands', flag: '🇨🇰' },
    { code: '+683', name: 'Niue', flag: '🇳🇺' },
    { code: '+684', name: 'American Samoa', flag: '🇦🇸' },
    { code: '+685', name: 'Samoa', flag: '🇼🇸' },
    { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
    { code: '+687', name: 'New Caledonia', flag: '🇳🇨' },
    { code: '+688', name: 'Tuvalu', flag: '🇹🇻' },
    { code: '+689', name: 'French Polynesia', flag: '🇵🇫' },
    { code: '+690', name: 'Tokelau', flag: '🇹🇰' },
    { code: '+691', name: 'Micronesia', flag: '🇫🇲' },
    { code: '+692', name: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+850', name: 'North Korea', flag: '🇰🇵' },
    { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
    { code: '+853', name: 'Macau', flag: '🇲🇴' },
    { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
    { code: '+856', name: 'Laos', flag: '🇱🇦' },
    { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
    { code: '+886', name: 'Taiwan', flag: '🇹🇼' },
    { code: '+960', name: 'Maldives', flag: '🇲🇻' },
    { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
    { code: '+962', name: 'Jordan', flag: '🇯🇴' },
    { code: '+963', name: 'Syria', flag: '🇸🇾' },
    { code: '+964', name: 'Iraq', flag: '🇮🇶' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+967', name: 'Yemen', flag: '🇾🇪' },
    { code: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: '+970', name: 'Palestine', flag: '🇵🇸' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+972', name: 'Israel', flag: '🇮🇱' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
    { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
    { code: '+977', name: 'Nepal', flag: '🇳🇵' },
    { code: '+992', name: 'Tajikistan', flag: '🇹🇯' },
    { code: '+993', name: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+995', name: 'Georgia', flag: '🇬🇪' },
    { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+998', name: 'Uzbekistan', flag: '🇺🇿' }
  ];

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      designation: 'skilled-nurse',
      department: 'sn',
      role: 'field'
    }
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    try {
      const { signUp } = await import('aws-amplify/auth');
      // Only send a valid image URL, never a base64 string
      let pictureUrl = profileImage;
      if (!pictureUrl || pictureUrl.startsWith('data:image')) {
        pictureUrl = "https://via.placeholder.com/100";
      }
      await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.fullName,
            phone_number: countryCode + data.phoneNumber,
            address: data.address,
            picture: pictureUrl,
            'custom:role': data.role,
            'custom:state': data.state,
            'custom:city': data.city,
            'custom:zipCode': data.zipCode,
            'custom:designation': data.designation,
            'custom:department': data.department,
            'custom:company_name': data.companyName
          }
        }
      });

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResendCode = async () => {
    try {
      const { resendSignUpCode } = await import('aws-amplify/auth');
      await resendSignUpCode({ username: userEmail });
      setError('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter verification code');
      return;
    }
    try {
      const { confirmSignUp } = await import('aws-amplify/auth');
      await confirmSignUp({ username: userEmail, confirmationCode: verificationCode });
      setNeedsVerification(false);
      setShowCodeInput(false);
      setError('Email verified! Please try signing in again.');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    }
  };

  const onSubmitLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      // Sign out any existing user first
      const { signOut, signIn } = await import('aws-amplify/auth');
      try {
        await signOut();
      } catch (signOutError) {
        // Ignore sign out errors if no user is signed in
      }
      
      const result = await signIn({
        username: data.email.toLowerCase().trim(),
        password: data.password
      });
      if (result.isSignedIn) {
        await refreshUser();
        onSuccess?.();
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setUserEmail(data.email.toLowerCase().trim());
        setNeedsVerification(true);
        setError('Your email is not verified. Please check your email or resend verification code.');
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // User needs to change their temporary password
        setTempPasswordEmail(data.email.toLowerCase().trim());
        setNeedsPasswordChange(true);
        setError('');
      } else {
        setError(`Sign in incomplete: ${result.nextStep?.signInStep || 'Unknown step'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { confirmSignIn } = await import('aws-amplify/auth');
      const result = await confirmSignIn({
        challengeResponse: newPassword
      });
      
      if (result.isSignedIn) {
        setNeedsPasswordChange(false);
        await refreshUser();
        onSuccess?.();
      } else {
        setError(`Password change incomplete: ${result.nextStep?.signInStep || 'Unknown step'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'register') {
    return (
      <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
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
                      // Preview image locally first
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setProfileImage(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                      
                      // Upload to S3 using Amplify Storage
                      const { uploadData } = await import('aws-amplify/storage');
                      
                      const fileName = `profile-images/${Date.now()}-${file.name}`;
                      
                      const result = await uploadData({
                        key: fileName,
                        data: file,
                        options: {
                          contentType: file.type
                        }
                      }).result;
                      
                      // Get the uploaded file URL
                      const { getUrl } = await import('aws-amplify/storage');
                      const urlResult = await getUrl({ key: fileName });
                      
                      setProfileImage(urlResult.url.toString());
                      
                    } finally {
                      setUploadingImage(false);
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Upload Photo</p>
        </div>
        
        <div>
          <Label>Full Name</Label>
          <Input {...registerForm.register('fullName')} placeholder="Enter full name" />
          {registerForm.formState.errors.fullName && <p className="text-red-500 text-sm">{registerForm.formState.errors.fullName.message}</p>}
        </div>

        <div>
          <Label>Email Address</Label>
          <Input {...registerForm.register('email')} type="email" placeholder="Enter email address" />
          {registerForm.formState.errors.email && <p className="text-red-500 text-sm">{registerForm.formState.errors.email.message}</p>}
        </div>

        <div>
          <Label>Password</Label>
          <Input {...registerForm.register('password')} type="password" placeholder="Enter password" />
          {registerForm.formState.errors.password && <p className="text-red-500 text-sm">{registerForm.formState.errors.password.message}</p>}
        </div>

        <div>
          <Label>Phone Number</Label>
          <div className="flex">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="🇺🇸 +1" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto w-80">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCountrySearch(e.target.value);
                    }}
                    className="h-8"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                {filteredCountries.map((country, index) => (
                  <SelectItem key={`${index}-${country.name}`} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.code}</span>
                      <span className="text-xs text-gray-500 truncate">{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              {...registerForm.register('phoneNumber')} 
              placeholder="Enter phone number" 
              className="flex-1 ml-2"
              type="tel"
            />
          </div>
          {registerForm.formState.errors.phoneNumber && <p className="text-red-500 text-sm">{registerForm.formState.errors.phoneNumber.message}</p>}
        </div>

        <div>
          <Label>Home Address</Label>
          <Input {...registerForm.register('address')} placeholder="Enter home address" />
          {registerForm.formState.errors.address && <p className="text-red-500 text-sm">{registerForm.formState.errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>City</Label>
            <Input {...registerForm.register('city')} placeholder="Enter city" />
            {registerForm.formState.errors.city && <p className="text-red-500 text-sm">{registerForm.formState.errors.city.message}</p>}
          </div>
          <div>
            <Label>State</Label>
            <Input {...registerForm.register('state')} placeholder="Enter state" />
            {registerForm.formState.errors.state && <p className="text-red-500 text-sm">{registerForm.formState.errors.state.message}</p>}
          </div>
          <div>
            <Label>Zip Code</Label>
            <Input {...registerForm.register('zipCode')} placeholder="Zip Code" />
            {registerForm.formState.errors.zipCode && <p className="text-red-500 text-sm">{registerForm.formState.errors.zipCode.message}</p>}
          </div>
        </div>

        <div>
          <Label>Designation</Label>
          <Select onValueChange={(value) => registerForm.setValue('designation', value)} defaultValue="skilled-nurse">
            <SelectTrigger className="border-teal-300">
              <SelectValue placeholder="Skilled Nurse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skilled-nurse">Skilled Nurse</SelectItem>
              <SelectItem value="registered-nurse">Registered Nurse</SelectItem>
              <SelectItem value="licensed-practical-nurse">Licensed Practical Nurse</SelectItem>
              <SelectItem value="physical-therapist">Physical Therapist</SelectItem>
              <SelectItem value="occupational-therapist">Occupational Therapist</SelectItem>
            </SelectContent>
          </Select>
          {registerForm.formState.errors.designation && <p className="text-red-500 text-sm">{registerForm.formState.errors.designation.message}</p>}
        </div>

        <div>
          <Label>Department</Label>
          <Select onValueChange={(value) => registerForm.setValue('department', value)} defaultValue="sn">
            <SelectTrigger>
              <SelectValue placeholder="SN" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sn">SN</SelectItem>
              <SelectItem value="pt">PT</SelectItem>
              <SelectItem value="ot">OT</SelectItem>
              <SelectItem value="st">ST</SelectItem>
              <SelectItem value="msw">MSW</SelectItem>
            </SelectContent>
          </Select>
          {registerForm.formState.errors.department && <p className="text-red-500 text-sm">{registerForm.formState.errors.department.message}</p>}
        </div>

        <div>
          <Label>Company Name</Label>
          <Input {...registerForm.register('companyName')} placeholder="Enter company name" />
          {registerForm.formState.errors.companyName && <p className="text-red-500 text-sm">{registerForm.formState.errors.companyName.message}</p>}
        </div>

        <div>
          <Label>Roles</Label>
          <div className="flex gap-2 mt-2">
            <Button 
              type="button" 
              variant={registerForm.watch('role') === 'field' ? 'default' : 'outline'} 
              onClick={() => registerForm.setValue('role', 'field')}
            >
              Field Staff
            </Button>
            <Button 
              type="button" 
              variant={registerForm.watch('role') === 'office' ? 'default' : 'outline'} 
              onClick={() => registerForm.setValue('role', 'office')}
            >
              Office Staff
            </Button>
          </div>
          {registerForm.formState.errors.role && <p className="text-red-500 text-sm">{registerForm.formState.errors.role.message}</p>}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1">Cancel</Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-teal-500 hover:bg-teal-600">
            {loading ? 'Adding...' : 'Add User'}
          </Button>
        </div>
      </form>
    );
  }

  // Show password change form if needed
  if (needsPasswordChange) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Signing in as: <strong>{tempPasswordEmail}</strong>
          </p>
        </div>
        <ChangePasswordForm 
          onPasswordChanged={handlePasswordChange}
          loading={loading}
          error={error}
        />
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            setNeedsPasswordChange(false);
            setError('');
            loginForm.reset();
          }}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...loginForm.register('email')}
          placeholder="Enter your email"
        />
        {loginForm.formState.errors.email && <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
        <Input
          id="password"
            type={showPassword ? "text" : "password"}
          {...loginForm.register('password')}
          placeholder="Enter your password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {loginForm.formState.errors.password && <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {needsVerification && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button type="button" onClick={handleResendCode} variant="outline" className="flex-1">
              Resend Code
            </Button>
            <Button type="button" onClick={() => setShowCodeInput(!showCodeInput)} variant="outline" className="flex-1">
              Enter Code
            </Button>
          </div>
          {showCodeInput && (
            <div className="space-y-2">
              <Input
                placeholder="Enter 6-digit verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <Button type="button" onClick={handleVerifyCode} className="w-full">
                Verify Email
              </Button>
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Loading...' : 'Sign In'}
      </Button>
    </form>
  );
}