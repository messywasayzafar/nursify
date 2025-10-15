export interface AddUserModalProps {
  setOpen: (open: boolean) => void;
  onUserAdded: () => void;
}

export interface GeofenceData {
  center: [number, number];
  radius: number;
  id: string;
}

export interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  homeAddress: string;
  city: string;
  state: string;
  zipCode: string;
  designation: string;
  department: string;
  profileImage?: File;
  workingAreaGeofence?: GeofenceData;
  workingArea?: string;
  permissions?: string;
  gender?: string;
  birthdate?: string;
  roles?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}
