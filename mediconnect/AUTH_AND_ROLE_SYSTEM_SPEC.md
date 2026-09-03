# HealthConnect: Universal Authentication & Role-Based System Architecture
> **Notice**: This document is mirrored from the root repository specification at [AUTH_AND_ROLE_SYSTEM_SPEC.md](file:///c:/Users/AmeySawant/MediConnect/AUTH_AND_ROLE_SYSTEM_SPEC.md).

Please refer to [c:\Users\AmeySawant\MediConnect\AUTH_AND_ROLE_SYSTEM_SPEC.md](file:///c:/Users/AmeySawant/MediConnect/AUTH_AND_ROLE_SYSTEM_SPEC.md) for the complete database schemas, TypeScript data contracts, role definitions, and Expo Router navigation structure.

## Summary of Mobile Routing Structure:
- `app/(auth)/login.tsx`: Universal Login (Email/Phone + Password OR OTP).
- `app/(auth)/register/index.tsx`: Step 1 - Role Picker (Patient, Doctor, Hospital, Ambulance, Blood Bank).
- `app/(auth)/register/account.tsx`: Step 2 - Account Credentials.
- `app/(auth)/register/onboarding.tsx`: Step 3 - Role-Specific Profile Details.
- Role Dashboards:
  - `app/(patient)/dashboard.tsx`
  - `app/(doctor)/dashboard.tsx`
  - `app/(hospital)/dashboard.tsx`
  - `app/(ambulance)/dashboard.tsx`
  - `app/(blood-bank)/dashboard.tsx`
