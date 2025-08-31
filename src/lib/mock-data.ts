import type { User, Patient, Alert, Chat, Message, Notification } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Dr. Emily Carter', email: 'emily.carter@nursify.com', role: 'Admin', status: 'Active', avatar: '/avatars/01.png' },
  { id: '2', name: 'James Rodriguez', email: 'james.rodriguez@nursify.com', role: 'Skilled Nurse', status: 'Active', avatar: '/avatars/02.png' },
  { id: '3', name: 'Susan Miller', email: 'susan.miller@nursify.com', role: 'PT', status: 'Active', avatar: '/avatars/03.png' },
  { id: '4', name: 'Michael Brown', email: 'michael.brown@nursify.com', role: 'OT', status: 'Inactive', avatar: '/avatars/04.png' },
  { id: '5', name: 'Jessica Lee', email: 'jessica.lee@nursify.com', role: 'Office Staff', status: 'Active', avatar: '/avatars/05.png' },
];

export const mockPatients: Patient[] = [
    { id: 'p1', name: 'John Smith', status: 'Active', tags: ['Fall Risk', 'Diabetes'], clinicians: { nurse: 'James Rodriguez' }, avatar: '/avatars/p01.png' },
    { id: 'p2', name: 'Maria Garcia', status: 'Active', tags: ['Post-Op'], clinicians: { nurse: 'James Rodriguez', pt: 'Susan Miller' }, avatar: '/avatars/p02.png' },
    { id: 'p3', name: 'David Johnson', status: 'Discharged', tags: [], clinicians: {}, avatar: '/avatars/p03.png' },
    { id: 'p4', name: 'Linda Williams', status: 'Transfer', tags: ['Wound Care'], clinicians: { ot: 'Michael Brown' }, avatar: '/avatars/p04.png' },
];

export const mockAlerts: Alert[] = [
    { id: 'a1', type: 'Patient Transfer', title: 'Linda Williams transferred to St. Jude Hospital', date: '2 days ago' },
    { id: 'a2', type: 'Recertification Due', title: 'John Smith - Recertification due in 5 days', date: '5 days left' },
    { id: 'a3', type: 'Acknowledgment', title: 'New policy document needs your acknowledgment', date: '1 week ago' },
    { id: 'a4', type: 'Staff Birthday', title: 'It\'s James Rodriguez\'s birthday today!', date: 'Today' },
];

export const mockChats: Chat[] = [
    { id: 'c1', name: 'General', type: 'group', lastMessage: 'Let\'s discuss the new patient intake form.', timestamp: '10:30 AM', avatar: 'https://picsum.photos/50/50?random=1', unreadCount: 2 },
    { id: 'c2', name: 'Susan Miller', type: 'direct', lastMessage: 'Can you check on Mr. Smith\'s PT schedule?', timestamp: '9:45 AM', avatar: 'https://picsum.photos/50/50?random=2' },
    { id: 'c3', name: 'Patient: Maria Garcia', type: 'direct', lastMessage: 'I have a question about my medication.', timestamp: 'Yesterday', avatar: 'https://picsum.photos/50/50?random=3' },
];

export const mockMessages: Message[] = [
    { id: 'm1', sender: 'You', content: 'Hi Susan, could you check on Mr. Smith\'s PT schedule for next week?', timestamp: '9:40 AM' },
    { id: 'm2', sender: 'Susan Miller', content: 'Sure, I will check and get back to you shortly.', timestamp: '9:42 AM' },
    { id: 'm3', sender: 'Patient: Maria Garcia', content: 'I have a question about my medication.', timestamp: 'Yesterday', isPatient: true },
];

export const mockNotifications: Notification[] = [
    { id: 'n1', title: 'New Patient Assigned', description: 'You have been assigned to patient John Smith.', timestamp: '1h ago', read: false },
    { id: 'n2', title: 'Message from Admin', description: 'Please complete the mandatory training by Friday.', timestamp: '3h ago', read: false },
    { id: 'n3', title: 'Patient Discharged', description: 'Patient David Johnson has been discharged.', timestamp: '1d ago', read: true },
];

export const staffForReferral = [
  {
    staffId: 'SN001',
    name: 'Alice Johnson',
    location: '123 Oak Ave, Springfield, IL',
    availability: 'Mon-Fri, 9am-5pm',
    skills: 'Wound care, IV therapy',
    patients: ['P001', 'P002'],
  },
  {
    staffId: 'PT002',
    name: 'Bob Williams',
    location: '456 Maple St, Springfield, IL',
    availability: 'Mon, Wed, Fri, 8am-4pm',
    skills: 'Orthopedic rehab, post-surgical therapy',
    patients: ['P003'],
  },
  {
    staffId: 'OT003',
    name: 'Charlie Brown',
    location: '789 Pine Ln, Chatham, IL',
    availability: 'Tue, Thu, 10am-6pm',
    skills: 'Geriatric care, daily living activities',
    patients: ['P004', 'P005', 'P006'],
  },
];

export const patientForReferral = {
    patientId: 'P007',
    name: 'Diana Miller',
    location: '101 Elm Rd, Springfield, IL',
    needs: 'Post-surgical physical therapy and skilled nursing for wound care',
};
