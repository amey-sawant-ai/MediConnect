// HealthConnect Auth & Role Data Contracts
// Specification: AUTH_AND_ROLE_SYSTEM_SPEC.md

export type UserRole =
  | 'patient'
  | 'doctor'
  | 'hospital'
  | 'ambulance'
  | 'blood_bank';

export type UserStatus = 'active' | 'pending_verification' | 'suspended' | 'deactivated';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// -------------------------------------------------------------
// Role-Specific Profile Models
// -------------------------------------------------------------

export interface PatientProfileData {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  existingConditions: string[];
  currentMedications: string[];
  majorSurgeries?: string[];
  medicalNotes?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phoneNumber: string;
  };
  secondaryContact?: {
    name: string;
    phoneNumber: string;
  };
  homeAddress?: string;
  city?: string;
  postalCode?: string;
  qrPassToken: string;
}

export interface DoctorProfileData {
  medicalRegNumber: string;
  qualifications: string[];
  specialization: string;
  yearsOfExperience: number;
  hospitalAffiliationName?: string;
  consultationAvailable: boolean;
  consultationFee?: number;
  isVerified: boolean;
}

export interface HospitalProfileData {
  registrationLicenseNumber: string;
  hospitalType: 'General' | 'Trauma Center' | 'Specialty' | 'Clinic';
  address: string;
  city: string;
  postalCode: string;
  emergencyHotline: string;
  hasEmergencyDepartment: boolean;
  totalBeds: number;
  availableBeds: number;
  totalIcuBeds: number;
  availableIcuBeds: number;
  totalVentilators: number;
  availableVentilators: number;
  hasOperationTheatre: boolean;
  hasBloodBank: boolean;
  hasAmbulanceService: boolean;
  specializations: string[];
  isVerified: boolean;
}

export type AmbulanceStatus = 'available' | 'on_emergency_call' | 'offline' | 'maintenance';
export type AmbulanceType = 'BLS' | 'ALS' | 'Patient_Transport' | 'Neonatal';

export interface AmbulanceProfileData {
  organizationName: string;
  ambulanceIdNumber: string;
  ambulanceType: AmbulanceType;
  vehicleRegistrationNumber: string;
  driverName: string;
  driverPhone: string;
  paramedicName?: string;
  paramedicPhone?: string;
  equipmentList: string[];
  status: AmbulanceStatus;
  isVerified: boolean;
}

export interface BloodBankProfileData {
  bankName: string;
  licenseNumber: string;
  address: string;
  city: string;
  postalCode: string;
  hotlinePhone: string;
  operatingHours: string;
  inventoryUnits: {
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'AB+': number;
    'AB-': number;
    'O+': number;
    'O-': number;
  };
  plateletsAvailable: boolean;
  plasmaAvailable: boolean;
  isVerified: boolean;
}

// -------------------------------------------------------------
// Auth Payloads & Responses
// -------------------------------------------------------------

export interface PasswordLoginPayload {
  identifier: string; // Email or Phone
  password: string;
  rememberMe?: boolean;
}

export interface OtpLoginPayload {
  phoneNumber: string;
  otpCode: string;
}

export interface BaseRegisterPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  role: UserRole;
}

export type AnyRoleProfileData =
  | PatientProfileData
  | DoctorProfileData
  | HospitalProfileData
  | AmbulanceProfileData
  | BloodBankProfileData;

export interface AuthSession {
  token: string;
  user: User;
  profile?: AnyRoleProfileData;
  redirectUrl: string;
}
