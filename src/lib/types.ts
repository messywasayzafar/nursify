export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Skilled Nurse' | 'PT' | 'OT' | 'Office Staff';
  status: 'Active' | 'Inactive';
  avatar: string;
}

export interface Patient {
  id: string;
  name: string;
  status: 'Active' | 'Discharged' | 'Transfer';
  tags: string[];
  clinicians: {
    nurse?: string;
    pt?: string;
    ot?: string;
  };
  avatar: string;
}

export interface Alert {
  id: string;
  type: 'Patient Transfer' | 'Recertification Due' | 'Acknowledgment' | 'Staff Birthday';
  title: string;
  date: string;
}

export interface Chat {
    id: string;
    name: string;
    type: 'group' | 'direct' | 'broadcast';
    lastMessage: string;
    timestamp: string;
    avatar: string;
    unreadCount?: number;
    isGroup?: boolean;
    members?: any[];
    createdBy?: string;
    createdAt?: string;
    // Patient data fields
    dateOfBirth?: string;
    contactNumber?: string;
    homeAddress?: string;
    primaryPhysicianName?: string;
    insurance?: string;
    socProvider?: string;
    patientTag?: string;
    emergencyPersonName?: string;
    emergencyContact?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isPatient?: boolean;
    fileUrl?: string;
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}
