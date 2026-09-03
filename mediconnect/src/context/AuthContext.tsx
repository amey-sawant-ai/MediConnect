import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  User,
  UserRole,
  AnyRoleProfileData,
  BaseRegisterPayload,
  PatientProfileData,
} from '@/types/auth';
import { MOCK_ACCOUNTS } from '@/data/mockUsers';
import { getDashboardRoute } from '@/utils/roleRedirect';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  profile: AnyRoleProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingPhoneForOtp: string | null;
  loginWithPassword: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  requestOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string; devOtpHint?: string }>;
  verifyOtp: (phoneNumber: string, otpCode: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (
    baseData: BaseRegisterPayload,
    profileData: AnyRoleProfileData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  triggerEmergencySos: (incidentType: string) => { success: boolean; dispatchId: string; etaMinutes: number };
  resolvePatientByQrToken: (qrToken: string) => { user: User; profile: PatientProfileData } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with null for unauthenticated state or patient demo
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<AnyRoleProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pendingPhoneForOtp, setPendingPhoneForOtp] = useState<string | null>(null);

  // Default to pre-populating patient for quick demonstration if desired, or let user pick on login
  useEffect(() => {
    // Check if session was preserved
  }, []);

  const loginWithPassword = async (
    identifier: string,
    password: string,
    _rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanId = identifier.trim().toLowerCase();
    // Find matching mock account by email or phone
    const matchedRole = (Object.keys(MOCK_ACCOUNTS) as UserRole[]).find((r) => {
      const record = MOCK_ACCOUNTS[r];
      return (
        record.user.email?.toLowerCase() === cleanId ||
        record.user.phoneNumber.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
      );
    });

    if (!matchedRole) {
      // Fallback: If demo password matches, default to patient or allow password123
      if (password === 'password123' || password === '123456') {
        const fallback = MOCK_ACCOUNTS.patient;
        setUser({
          ...fallback.user,
          email: cleanId.includes('@') ? cleanId : fallback.user.email,
          phoneNumber: cleanId.includes('@') ? fallback.user.phoneNumber : cleanId,
        });
        setRole(fallback.user.role);
        setProfile(fallback.profile);
        setIsLoading(false);
        router.replace(getDashboardRoute(fallback.user.role) as any);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: 'User not found. Try one of the demo credentials below or register.' };
    }

    const account = MOCK_ACCOUNTS[matchedRole];
    if (account.password !== password && password !== 'password123') {
      setIsLoading(false);
      return { success: false, error: 'Incorrect password. (Demo password is "password123")' };
    }

    setUser(account.user);
    setRole(account.user.role);
    setProfile(account.profile);
    setIsLoading(false);

    // Dynamic role redirection
    const targetRoute = getDashboardRoute(account.user.role);
    router.replace(targetRoute as any);
    return { success: true };
  };

  const requestOtp = async (phoneNumber: string): Promise<{ success: boolean; error?: string; devOtpHint?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPendingPhoneForOtp(phoneNumber);
    setIsLoading(false);
    return { success: true, devOtpHint: '123456' };
  };

  const verifyOtp = async (phoneNumber: string, otpCode: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (otpCode !== '123456' && otpCode.length !== 6) {
      setIsLoading(false);
      return { success: false, error: 'Invalid OTP code. Use "123456" for testing.' };
    }

    // Match existing account or create quick session
    const matchedRole = (Object.keys(MOCK_ACCOUNTS) as UserRole[]).find((r) => {
      const record = MOCK_ACCOUNTS[r];
      return record.user.phoneNumber.replace(/\s+/g, '') === phoneNumber.replace(/\s+/g, '');
    }) || 'patient';

    const account = MOCK_ACCOUNTS[matchedRole];
    setUser(account.user);
    setRole(account.user.role);
    setProfile(account.profile);
    setPendingPhoneForOtp(null);
    setIsLoading(false);

    router.replace(getDashboardRoute(account.user.role) as any);
    return { success: true };
  };

  const registerUser = async (
    baseData: BaseRegisterPayload,
    profileData: AnyRoleProfileData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User = {
      id: `usr_${baseData.role}_${Date.now()}`,
      fullName: baseData.fullName,
      email: baseData.email,
      phoneNumber: baseData.phoneNumber,
      role: baseData.role,
      status: baseData.role === 'patient' ? 'active' : 'pending_verification',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setRole(baseData.role);
    setProfile(profileData);
    setIsLoading(false);

    router.replace(getDashboardRoute(baseData.role) as any);
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setRole(null);
    setProfile(null);
    router.replace('/(auth)/login' as any);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const account = MOCK_ACCOUNTS[targetRole];
    setUser(account.user);
    setRole(account.user.role);
    setProfile(account.profile);
    router.replace(getDashboardRoute(targetRole) as any);
  };

  const triggerEmergencySos = (incidentType: string) => {
    const dispatchId = `SOS-${Math.floor(100000 + Math.random() * 900000)}`;
    const etaMinutes = 6;
    return {
      success: true,
      dispatchId,
      etaMinutes,
    };
  };

  const resolvePatientByQrToken = (_qrToken: string): { user: User; profile: PatientProfileData } | null => {
    // If current active session is a patient, return live session data so any edits update dynamically
    if (user && role === 'patient' && profile) {
      return {
        user,
        profile: profile as PatientProfileData,
      };
    }
    const patientAcc = MOCK_ACCOUNTS.patient;
    return {
      user: patientAcc.user,
      profile: patientAcc.profile as PatientProfileData,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        isLoading,
        isAuthenticated: !!user,
        pendingPhoneForOtp,
        loginWithPassword,
        requestOtp,
        verifyOtp,
        registerUser,
        logout,
        switchDemoRole,
        triggerEmergencySos,
        resolvePatientByQrToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
