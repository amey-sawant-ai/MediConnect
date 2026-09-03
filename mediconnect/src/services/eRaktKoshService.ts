// e-RaktKosh Centralized Blood Portal Integration Service
// Standards aligned with Ministry of Health and Family Welfare (MoHFW)

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent =
  | 'Whole Blood'
  | 'Packed Red Blood Cells (PRBC)'
  | 'Platelet Concentrate'
  | 'Fresh Frozen Plasma (FFP)'
  | 'Cryoprecipitate';

export interface ERaktKoshInventoryRecord {
  bankId: string;
  bankName: string;
  state: string;
  district: string;
  licenseNumber: string;
  contactNumber: string;
  address: string;
  operatingHours: string;
  components: Record<BloodGroup, {
    prbcUnits: number;
    plateletsUnits: number;
    ffpUnits: number;
    wholeBloodUnits: number;
  }>;
  lastUpdated: string;
}

// Red blood cell donor compatibility matrix
export const RBC_DONOR_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal Donor
};

export const MOCK_E_RAKTKOSH_RECORDS: ERaktKoshInventoryRecord[] = [
  {
    bankId: 'BB-MH-LIC-4482',
    bankName: 'LifeLine Central Blood Bank & Storage Hub',
    state: 'Maharashtra',
    district: 'Mumbai',
    licenseNumber: 'BB-MH-LIC-4482',
    contactNumber: '+91 22 2555 1100',
    address: '77 Cross Road, Medical District, Mumbai',
    operatingHours: '24 Hours / 7 Days',
    components: {
      'A+': { prbcUnits: 18, plateletsUnits: 6, ffpUnits: 10, wholeBloodUnits: 5 },
      'A-': { prbcUnits: 5, plateletsUnits: 2, ffpUnits: 3, wholeBloodUnits: 1 },
      'B+': { prbcUnits: 22, plateletsUnits: 8, ffpUnits: 12, wholeBloodUnits: 4 },
      'B-': { prbcUnits: 4, plateletsUnits: 1, ffpUnits: 2, wholeBloodUnits: 0 },
      'AB+': { prbcUnits: 9, plateletsUnits: 4, ffpUnits: 5, wholeBloodUnits: 2 },
      'AB-': { prbcUnits: 2, plateletsUnits: 1, ffpUnits: 1, wholeBloodUnits: 0 },
      'O+': { prbcUnits: 31, plateletsUnits: 12, ffpUnits: 18, wholeBloodUnits: 8 },
      'O-': { prbcUnits: 7, plateletsUnits: 3, ffpUnits: 4, wholeBloodUnits: 1 },
    },
    lastUpdated: 'Today at 12:00 PM',
  },
  {
    bankId: 'BB-MH-LIC-1099',
    bankName: 'Rotary Blood Bank & Transfusion Center',
    state: 'Maharashtra',
    district: 'Mumbai',
    licenseNumber: 'BB-MH-LIC-1099',
    contactNumber: '+91 22 2433 8899',
    address: 'Plot 45, Rotary Marg, Bandra West, Mumbai',
    operatingHours: '8:00 AM - 10:00 PM',
    components: {
      'A+': { prbcUnits: 12, plateletsUnits: 4, ffpUnits: 7, wholeBloodUnits: 3 },
      'A-': { prbcUnits: 3, plateletsUnits: 1, ffpUnits: 2, wholeBloodUnits: 0 },
      'B+': { prbcUnits: 16, plateletsUnits: 5, ffpUnits: 9, wholeBloodUnits: 2 },
      'B-': { prbcUnits: 2, plateletsUnits: 1, ffpUnits: 1, wholeBloodUnits: 0 },
      'AB+': { prbcUnits: 6, plateletsUnits: 2, ffpUnits: 3, wholeBloodUnits: 1 },
      'AB-': { prbcUnits: 1, plateletsUnits: 0, ffpUnits: 1, wholeBloodUnits: 0 },
      'O+': { prbcUnits: 20, plateletsUnits: 7, ffpUnits: 11, wholeBloodUnits: 4 },
      'O-': { prbcUnits: 4, plateletsUnits: 2, ffpUnits: 2, wholeBloodUnits: 1 },
    },
    lastUpdated: 'Today at 11:30 AM',
  },
];

export function getCompatibleBloodGroups(recipientGroup: BloodGroup): BloodGroup[] {
  return RBC_DONOR_COMPATIBILITY[recipientGroup] || ['O-'];
}

export function broadcastUrgentDonorRequest(
  bloodGroup: BloodGroup,
  unitsNeeded: number,
  hospitalName: string
): { broadcastId: string; notifiedCount: number; timestamp: string } {
  return {
    broadcastId: `BLAST-${Math.floor(100000 + Math.random() * 900000)}`,
    notifiedCount: Math.floor(80 + Math.random() * 120),
    timestamp: new Date().toISOString(),
  };
}
