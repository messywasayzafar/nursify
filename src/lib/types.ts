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
    type: 'group' | 'direct';
    lastMessage: string;
    timestamp: string;
    avatar: string;
    unreadCount?: number;
}

export interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isPatient?: boolean;
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}
