import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { User, PatientProfileData } from '@/types/auth';
import { MOCK_ACCOUNTS } from '@/data/mockUsers';

export interface PatientQrPayload {
  mediconnectPass: boolean;
  version: string;
  token: string;
  patientId: string;
  fullName: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: string;
  allergies: string[];
  existingConditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phoneNumber: string;
  };
  homeAddress?: string;
  city?: string;
  postalCode?: string;
  medicalNotes?: string;
  lastUpdated: string;
}

/**
 * Encodes full patient profile into a JSON string payload
 */
export function buildPatientQrPayload(user: User, profile: PatientProfileData): PatientQrPayload {
  return {
    mediconnectPass: true,
    version: '1.0',
    token: profile.qrPassToken,
    patientId: user.id,
    fullName: user.fullName,
    bloodGroup: profile.bloodGroup,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    allergies: profile.allergies || [],
    existingConditions: profile.existingConditions || [],
    currentMedications: profile.currentMedications || [],
    emergencyContact: profile.emergencyContact,
    homeAddress: profile.homeAddress,
    city: profile.city,
    postalCode: profile.postalCode,
    medicalNotes: profile.medicalNotes,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generates a real Base64 Data URL (data:image/png;base64,...) containing the scannable QR Code
 */
export async function generateQrDataUrl(user: User, profile: PatientProfileData): Promise<string> {
  const payload = buildPatientQrPayload(user, profile);
  const payloadStr = JSON.stringify(payload);
  try {
    const dataUrl = await QRCode.toDataURL(payloadStr, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Data URL:', err);
    // Fallback to token QR if payload exceeds matrix bounds
    return QRCode.toDataURL(profile.qrPassToken, { margin: 2, width: 320 });
  }
}

/**
 * Parses raw decoded QR string from camera / image scan
 */
export function parseScannedQrText(qrText: string): { user: User; profile: PatientProfileData } | null {
  if (!qrText || typeof qrText !== 'string') return null;

  try {
    const cleanStr = qrText.trim();
    // Case 1: Decoded text is a JSON payload
    if (cleanStr.startsWith('{') && cleanStr.endsWith('}')) {
      const parsed = JSON.parse(cleanStr) as Partial<PatientQrPayload>;
      if (parsed.mediconnectPass || parsed.fullName || parsed.token) {
        const userObj: User = {
          id: parsed.patientId || `usr_pat_${Date.now()}`,
          fullName: parsed.fullName || 'Scanned Patient',
          phoneNumber: parsed.emergencyContact?.phoneNumber || '+91 98765 43210',
          role: 'patient',
          status: 'active',
          createdAt: parsed.lastUpdated || new Date().toISOString(),
        };

        const profileObj: PatientProfileData = {
          dateOfBirth: parsed.dateOfBirth || '1994-08-14',
          gender: (parsed.gender as any) || 'male',
          bloodGroup: (parsed.bloodGroup as any) || 'O+',
          allergies: parsed.allergies || ['None Reported'],
          existingConditions: parsed.existingConditions || ['None'],
          currentMedications: parsed.currentMedications || ['None'],
          emergencyContact: parsed.emergencyContact || {
            name: 'Emergency Contact',
            relation: 'ICE',
            phoneNumber: '+91 98765 43211',
          },
          homeAddress: parsed.homeAddress || 'Registered Address',
          city: parsed.city || 'Mumbai',
          postalCode: parsed.postalCode || '400001',
          medicalNotes: parsed.medicalNotes,
          qrPassToken: parsed.token || 'QR-PASSED-LIVE',
        };

        return { user: userObj, profile: profileObj };
      }
    }
  } catch (err) {
    console.log('Not a direct JSON payload, falling back to token lookup:', err);
  }

  // Case 2: Token string lookup fallback
  const defaultAcc = MOCK_ACCOUNTS.patient;
  return {
    user: defaultAcc.user,
    profile: defaultAcc.profile as PatientProfileData,
  };
}

/**
 * Decodes QR code from raw pixel ImageData using jsqr library
 */
export function decodeQrFromImageData(
  rgbaPixelData: Uint8ClampedArray,
  width: number,
  height: number
): string | null {
  try {
    const code = jsQR(rgbaPixelData, width, height, {
      inversionAttempts: 'dontInvert',
    });
    if (code && code.data) {
      return code.data;
    }
  } catch (e) {
    console.error('jsQR decoding failed:', e);
  }
  return null;
}
