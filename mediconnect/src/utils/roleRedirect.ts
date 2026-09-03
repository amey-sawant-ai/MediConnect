import { UserRole } from '@/types/auth';

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

export function getRoleBadgeDetails(role: UserRole): { label: string; color: string; icon: string } {
  switch (role) {
    case 'patient':
      return { label: 'Patient / Citizen', color: '#10B981', icon: 'person' };
    case 'doctor':
      return { label: 'Doctor', color: '#8B5CF6', icon: 'medical' };
    case 'hospital':
      return { label: 'Hospital ER', color: '#0284C7', icon: 'business' };
    case 'ambulance':
      return { label: 'Ambulance Unit', color: '#F59E0B', icon: 'car' };
    case 'blood_bank':
      return { label: 'Blood Bank', color: '#EF4444', icon: 'water' };
    case 'responder':
      return { label: 'Emergency Responder', color: '#DC2626', icon: 'flash' };
    case 'admin':
      return { label: 'System Admin', color: '#334155', icon: 'shield-checkmark' };
    default:
      return { label: 'User', color: '#64748B', icon: 'person' };
  }
}
