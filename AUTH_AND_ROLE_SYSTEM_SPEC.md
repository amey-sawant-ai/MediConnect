# HealthConnect: Universal Authentication & Role-Based System Architecture
> **Target Audience**: AI Agents & Full-Stack Developers  
> **Status**: Active Architecture Blueprint  
> **Applicability**: Mobile (React Native / Expo Router SDK 57) & Web (Next.js / Vite / REST / GraphQL APIs)

---

## 1. System Overview & Architectural Principles

HealthConnect uses a **Single Unified Authentication Gate** paired with **Role-Based Dynamic Onboarding** and **Role-Based Dashboard Redirection**.

```
                           +------------------------------------+
                           |        HEALTHCONNECT CLIENT        |
                           +-----------------+------------------+
                                             |
                                [ Universal Auth Gate ]
                                 /                  \
              [ Path A: Login ]                       [ Path B: Register ]
             /                 \                                |
    [Email/Mobile + Pass]  [Mobile + OTP]                 [Step 1: Select Role]
             \                 /                                |
              v               v                  +--------------+--------------+
           [ Central Authenticate ]              | (Patient, Doctor, Hospital, |
                      |                          |  Ambulance, BloodBank, EMT) |
               [ Resolve Role ]                  +--------------+--------------+
                      |                                         |
     +----------------+----------------+                        v
     | Route to Specific Dashboard:    |              [Step 2: Role-Specific   ]
     | - /patient/dashboard            |              [        Profile Form    ]
     | - /doctor/dashboard             |                        |
     | - /hospital/dashboard           |                        v
     | - /ambulance/dashboard          |              [ Create Auth + Profile ]
     | - /blood-bank/dashboard         |                        |
     | - /responder/dashboard          |                        v
     | - /admin/dashboard              |              [ Route to Dashboard     ]
     +---------------------------------+
```

### Core Architectural Rules for AI Agents:
1. **Never create separate login pages per role.** Maintain one single universal login view.
2. **Never place medical, hospital, or vehicle fields on the login screen.** Keep login minimal (Identifier + Secret/OTP).
3. **Roles are resolved post-authentication.** The backend returns the user's role and profile status upon successful credential or OTP verification.
4. **Admins have NO public signup.** Admin accounts are provisioned via internal seed scripts or super-admin invitation only.
5. **Emergency Readiness:** Always provide an **OTP Login** alongside Password login for victims or first-responders who cannot recall passwords during a crisis.

---

## 2. Role Definitions & Permissions Matrix

| Role Enum | Display Name | Public Signup? | Verification Needed? | Landing Route | Description |
|---|---|:---:|:---:|---|---|
| `patient` | Patient / Citizen | Yes | No (Instant) | `/(patient)/dashboard` | General citizens seeking care, tracking ambulances, accessing medical pass. |
| `doctor` | Doctor / Physician | Yes | Yes (License Review) | `/(doctor)/dashboard` | Tele-consultation, triage assistance, patient history access. |
| `hospital` | Hospital / Clinic | Yes | Yes (License & Facility Review) | `/(hospital)/dashboard` | Bed/ICU availability management, ER intake coordination. |
| `ambulance` | Ambulance Service | Yes | Yes (Permit & Fleet Review) | `/(ambulance)/dashboard` | Real-time GPS beaconing, dispatch reception, paramedic telemetry. |
| `blood_bank`| Blood Bank Hub | Yes | Yes (Regulatory License) | `/(blood-bank)/dashboard`| Blood & platelet inventory management, emergency broadcast response. |
| `responder` | Emergency First Responder | Yes | Yes (EMT/Paramedic Badge) | `/(responder)/dashboard` | On-scene triage, AED location beacon, emergency stabilization. |
| `admin` | System Administrator | **NO** | Pre-approved | `/(admin)/dashboard` | Audit logs, platform telemetry, verification approvals, system config. |

---

## 3. Database Schema (PostgreSQL / Supabase / SQLite)

### 3.1 Primary `users` Table (Central Auth Entity)

```sql
CREATE TYPE user_role AS ENUM (
    'patient',
    'doctor',
    'hospital',
    'ambulance',
    'blood_bank',
    'responder',
    'admin'
);

CREATE TYPE user_status AS ENUM (
    'active',
    'pending_verification',
    'suspended',
    'deactivated'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable if user registers exclusively via OTP
    role user_role NOT NULL DEFAULT 'patient',
    status user_status NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 3.2 Role-Specific Profile Tables

#### 1. `patient_profiles`
```sql
CREATE TABLE patient_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL, -- 'male', 'female', 'other', 'prefer_not_to_say'
    blood_group VARCHAR(5) NOT NULL, -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    allergies TEXT[] DEFAULT '{}', -- e.g. ['Penicillin', 'Peanuts', 'Latex']
    existing_conditions TEXT[] DEFAULT '{}', -- e.g. ['Type 2 Diabetes', 'Hypertension']
    current_medications TEXT[] DEFAULT '{}', -- e.g. ['Metformin 500mg', 'Lisinopril 10mg']
    major_surgeries TEXT[] DEFAULT '{}',
    medical_notes TEXT,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_relation VARCHAR(50) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    secondary_contact_name VARCHAR(150),
    secondary_contact_phone VARCHAR(20),
    home_address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    qr_pass_token UUID UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. `doctor_profiles`
```sql
CREATE TABLE doctor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    medical_reg_number VARCHAR(100) UNIQUE NOT NULL,
    qualifications TEXT[] NOT NULL, -- ['MBBS', 'MD - Cardiology']
    specialization VARCHAR(100) NOT NULL,
    years_of_experience INT NOT NULL DEFAULT 0,
    hospital_affiliation_id UUID REFERENCES users(id),
    hospital_affiliation_name VARCHAR(200),
    consultation_available BOOLEAN DEFAULT TRUE,
    verification_document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 3. `hospital_profiles`
```sql
CREATE TABLE hospital_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    registration_license_number VARCHAR(100) UNIQUE NOT NULL,
    hospital_type VARCHAR(50) NOT NULL, -- 'General', 'Trauma Center', 'Specialty', 'Clinic'
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    emergency_hotline VARCHAR(20) NOT NULL,
    has_emergency_department BOOLEAN DEFAULT TRUE,
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    total_icu_beds INT DEFAULT 0,
    available_icu_beds INT DEFAULT 0,
    total_ventilators INT DEFAULT 0,
    available_ventilators INT DEFAULT 0,
    has_operation_theatre BOOLEAN DEFAULT TRUE,
    has_blood_bank BOOLEAN DEFAULT FALSE,
    has_ambulance_service BOOLEAN DEFAULT FALSE,
    specializations TEXT[] DEFAULT '{}',
    license_document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. `ambulance_profiles`
```sql
CREATE TYPE ambulance_type AS ENUM ('BLS', 'ALS', 'Patient_Transport', 'Neonatal');
CREATE TYPE ambulance_status AS ENUM ('available', 'on_emergency_call', 'offline', 'maintenance');

CREATE TABLE ambulance_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(150) NOT NULL,
    ambulance_id_number VARCHAR(50) UNIQUE NOT NULL,
    ambulance_type ambulance_type NOT NULL DEFAULT 'BLS',
    vehicle_registration_number VARCHAR(50) UNIQUE NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    paramedic_name VARCHAR(150),
    paramedic_phone VARCHAR(20),
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    heading_degrees DOUBLE PRECISION,
    status ambulance_status DEFAULT 'available',
    equipment_list TEXT[] DEFAULT '{}', -- e.g. ['AED', 'Oxygen Cylinder', 'Ventilator', 'Stretcher']
    hospital_affiliation_id UUID REFERENCES users(id),
    verification_document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 5. `blood_bank_profiles`
```sql
CREATE TABLE blood_bank_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hotline_number VARCHAR(20) NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '24/7',
    inventory_units JSONB DEFAULT '{
        "A+": 0, "A-": 0, "B+": 0, "B-": 0,
        "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
    }'::jsonb,
    platelets_available BOOLEAN DEFAULT TRUE,
    plasma_available BOOLEAN DEFAULT TRUE,
    verification_document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    last_inventory_sync TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. `responder_profiles`
```sql
CREATE TABLE responder_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    badge_or_responder_id VARCHAR(100) UNIQUE NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    responder_role VARCHAR(100) NOT NULL, -- 'Paramedic', 'Firefighter EMT', 'Disaster Relief Medic'
    certifications TEXT[] NOT NULL, -- ['ACLS', 'BLS', 'PHTLS']
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    is_on_duty BOOLEAN DEFAULT TRUE,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    verification_document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. TypeScript Type Contracts (for Client & Server Code)

```typescript
// ==========================================
// User & Auth Core Types
// ==========================================
export type UserRole =
  | 'patient'
  | 'doctor'
  | 'hospital'
  | 'ambulance'
  | 'blood_bank'
  | 'responder'
  | 'admin';

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

// ==========================================
// Authentication Payloads
// ==========================================
export interface PasswordLoginPayload {
  identifier: string; // Email or Mobile Phone
  password: string;
  rememberMe?: boolean;
}

export interface RequestOtpPayload {
  phoneNumber: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otpCode: string;
}

export interface AuthSessionResponse {
  token: string;
  refreshToken?: string;
  user: User;
  redirectUrl: string; // Automatically computed target route
}

// ==========================================
// Registration Step 1: Base User Account
// ==========================================
export interface BaseRegisterPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  role: Exclude<UserRole, 'admin'>; // Public signup disallows admin
}

// ==========================================
// Registration Step 2: Role Profiles
// ==========================================
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
  address?: {
    street: string;
    city: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface DoctorProfileData {
  medicalRegNumber: string;
  qualifications: string[];
  specialization: string;
  yearsOfExperience: number;
  hospitalAffiliationName?: string;
  consultationAvailable: boolean;
  verificationDocumentUrl: string;
}

export interface HospitalProfileData {
  registrationLicenseNumber: string;
  hospitalType: 'General' | 'Trauma Center' | 'Specialty' | 'Clinic';
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  emergencyHotline: string;
  hasEmergencyDepartment: boolean;
  totalBeds: number;
  totalIcuBeds: number;
  totalVentilators: number;
  hasOperationTheatre: boolean;
  hasBloodBank: boolean;
  hasAmbulanceService: boolean;
  specializations: string[];
  licenseDocumentUrl: string;
}

export interface AmbulanceProfileData {
  organizationName: string;
  ambulanceIdNumber: string;
  ambulanceType: 'BLS' | 'ALS' | 'Patient_Transport' | 'Neonatal';
  vehicleRegistrationNumber: string;
  driverName: string;
  driverPhone: string;
  paramedicName?: string;
  paramedicPhone?: string;
  equipmentList: string[];
  verificationDocumentUrl: string;
}

export interface BloodBankProfileData {
  bankName: string;
  licenseNumber: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  hotlinePhone: string;
  operatingHours: string;
  verificationDocumentUrl: string;
}

export interface ResponderProfileData {
  badgeOrResponderId: string;
  organizationName: string;
  responderRole: string;
  certifications: string[];
  emergencyContactPhone: string;
  verificationDocumentUrl: string;
}
```

---

## 5. UI / UX Design & Component Guidelines

### 5.1 Universal Login Screen (`/auth/login`)

```
+-----------------------------------------------------------+
|                     +---------------+                     |
|                     | 🏥 HealthConnect |                  |
|                     +---------------+                     |
|            Healthcare & Emergency Response                |
|                                                           |
|   +---------------------------------------------------+   |
|   | 📱 Email or Mobile Phone Number                   |   |
|   +---------------------------------------------------+   |
|                                                           |
|   +---------------------------------------------------+   |
|   | 🔒 Password                                   [👁] |   |
|   +---------------------------------------------------+   |
|                                                           |
|   [ ] Remember Me                      Forgot Password?   |
|                                                           |
|   +---------------------------------------------------+   |
|   |                   [ SIGN IN ]                     |   |
|   +---------------------------------------------------+   |
|                                                           |
|                          --- OR ---                       |
|                                                           |
|   +---------------------------------------------------+   |
|   |           [ ⚡ Continue with Fast OTP ]            |   |
|   +---------------------------------------------------+   |
|                                                           |
|   Emergency victim? Quick SOS without login -> [ SOS ]    |
|                                                           |
|   Don't have an account? Create Account                   |
+-----------------------------------------------------------+
```

### 5.2 Role Picker Screen (`/auth/register/select-role`)

When user taps **Create Account**, display high-clarity cards:

```
Who are you registering as?

[ 👤 Patient / Citizen ]
Quick emergency access, personal health QR pass, ambulance booking.

[ 👨‍⚕️ Doctor / Physician ]
Tele-consultation, verified triage advisor, emergency medical guidance.

[ 🏥 Hospital / Medical Center ]
Manage ICU/bed counts, incoming trauma ER dispatch, emergency intake.

[ 🚑 Ambulance Fleet & Crew ]
GPS emergency beaconing, dispatch reception, paramedic telemetry.

[ 🩸 Blood Bank Resource Hub ]
Live inventory counts (A, B, AB, O), emergency donor broadcast response.

[ 🚨 Emergency First Responder ]
On-scene EMT/Paramedic stabilization, AED beacon, rapid intervention.
```

---

## 6. Expo Router / React Native Folder Structure

Organize routes using Expo Router Route Groups `(group)` for role isolation:

```text
mediconnect/
├── app/
│   ├── _layout.tsx              # Root Layout: Theme, Session Provider, Auth Gate
│   ├── index.tsx                # Splash & Initial Auth Resolver (auto-redirect)
│   ├── (auth)/                  # Shared Authentication Gate
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # UNIVERSAL LOGIN (Email/Phone + Pass OR OTP)
│   │   ├── otp-verify.tsx       # OTP Code Verification View
│   │   ├── forgot-password.tsx  # Password Reset
│   │   └── register/
│   │       ├── index.tsx        # STEP 1: Select Role
│   │       ├── account.tsx      # STEP 2: Name, Phone, Email, Password
│   │       └── onboarding/      # STEP 3: Role-specific profile forms
│   │           ├── patient.tsx
│   │           ├── doctor.tsx
│   │           ├── hospital.tsx
│   │           ├── ambulance.tsx
│   │           ├── blood-bank.tsx
│   │           └── responder.tsx
│   ├── (patient)/               # Role 1: Citizen / Patient
│   │   ├── _layout.tsx          # Patient Tab Bar (Home, SOS, Beds, Blood, QR)
│   │   └── dashboard.tsx
│   ├── (doctor)/                # Role 2: Doctor
│   │   ├── _layout.tsx
│   │   └── dashboard.tsx
│   ├── (hospital)/              # Role 3: Hospital Admin
│   │   ├── _layout.tsx
│   │   └── dashboard.tsx
│   ├── (ambulance)/             # Role 4: Ambulance Driver / EMT
│   │   ├── _layout.tsx
│   │   └── dashboard.tsx
│   ├── (blood-bank)/            # Role 5: Blood Bank Manager
│   │   ├── _layout.tsx
│   │   └── dashboard.tsx
│   ├── (responder)/             # Role 6: Field Responder
│   │   ├── _layout.tsx
│   │   └── dashboard.tsx
│   └── (admin)/                 # Role 7: Super Admin
│       ├── _layout.tsx
│       └── dashboard.tsx
└── src/
    ├── api/                     # Auth & Profile API clients
    ├── context/
    │   └── AuthContext.tsx      # Global User & Session State
    ├── components/
    │   ├── ui/                  # Reusable Design System (Input, Button, Cards)
    │   └── auth/                # LoginForm, RoleCard, OtpInput
    └── utils/
        └── roleRedirect.ts      # Computes target route from UserRole
```

---

## 7. Role Redirection Logic (Guard & Router)

```typescript
// src/utils/roleRedirect.ts
import { UserRole } from '../types';

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'patient':
      return '/(patient)/dashboard';
    case 'doctor':
      return '/(doctor)/dashboard';
    case 'hospital':
      return '/(hospital)/dashboard';
    case 'ambulance':
      return '/(ambulance)/dashboard';
    case 'blood_bank':
      return '/(blood-bank)/dashboard';
    case 'responder':
      return '/(responder)/dashboard';
    case 'admin':
      return '/(admin)/dashboard';
    default:
      return '/(auth)/login';
  }
}
```

---

## 8. Emergency Mode & Critical Overrides

1. **SOS Without Login**:
   - The landing page and login page must contain a prominent **"Emergency SOS"** button.
   - If clicked, emergency coordinates and incident type can be broadcast immediately to the nearest dispatcher without forcing the user through login first.
2. **Offline Medical Pass**:
   - Patient medical QR profiles must be cached locally in encrypted storage (`AsyncStorage` or `expo-secure-store`) so that first-responders can scan the QR code even when there is zero cellular reception.
3. **Paramedic Override**:
   - When a verified `ambulance` or `responder` scans a patient's QR pass, the application temporarily elevates read privileges for blood group, severe allergies, and ICE contacts without requiring the patient to unlock their phone.

---

## 9. AI Developer Implementation Checklist

When generating code for this system, follow this order:
- [ ] Implement `src/types/auth.ts` using the TypeScript contracts defined in Section 4.
- [ ] Implement `src/context/AuthContext.tsx` handling login, OTP, session storage, and role redirection.
- [ ] Build the Universal Login screen (`app/(auth)/login.tsx`) with toggle between Password and OTP modes.
- [ ] Build the Role Selection screen (`app/(auth)/register/index.tsx`) showing the 6 public account options.
- [ ] Implement the role-specific onboarding screens (`app/(auth)/register/onboarding/*.tsx`).
- [ ] Configure Route Protection in `app/_layout.tsx` so unauthenticated users are kept in `(auth)` and authenticated users cannot access dashboards belonging to other roles.
