import '@/global.css';
import { Platform } from 'react-native';

export const HealthcareColors = {
  emergencyRed: '#EF4444',
  emergencyDark: '#DC2626',
  emergencyLight: '#FEE2E2',
  medicalBlue: '#0284C7',
  medicalDark: '#0369A1',
  medicalLight: '#E0F2FE',
  ambulanceAmber: '#F59E0B',
  amberLight: '#FEF3C7',
  healthGreen: '#10B981',
  greenLight: '#D1FAE5',
  purpleDoctor: '#8B5CF6',
  purpleLight: '#EDE9FE',
  bloodCrimson: '#B91C1C',
  bloodLight: '#FFE4E6',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate500: '#64748B',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',
};

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2E8F0',
    border: '#E2E8F0',
    card: '#FFFFFF',
    primary: HealthcareColors.emergencyRed,
    secondary: HealthcareColors.medicalBlue,
    tint: HealthcareColors.emergencyRed,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: '#0B1120',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    border: '#1E293B',
    card: '#131D31',
    primary: HealthcareColors.emergencyRed,
    secondary: HealthcareColors.medicalBlue,
    tint: HealthcareColors.emergencyRed,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
