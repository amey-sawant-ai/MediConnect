// Synthea Synthetic Patient Population Simulator Integration for Blood Bank & Donor Intelligence
// Clinical Standards: LOINC 883-9 (ABO), LOINC 10331-7 (Rh), LOINC 718-7 (Hemoglobin), LOINC 777-3 (Platelets)

import { BloodGroup, RBC_DONOR_COMPATIBILITY } from './eRaktKoshService';

export interface SyntheaDonorRecord {
  syntheaPatientId: string;
  fullName: string;
  gender: 'M' | 'F';
  birthDate: string;
  bloodGroup: BloodGroup;
  loincObservations: {
    hemoglobinGdl: number; // LOINC 718-7 (Min 12.5 F, 13.0 M)
    plateletCountK: number; // LOINC 777-3 (Normal 150-450)
    bloodPressure: string; // LOINC 85354-9 (Systolic/Diastolic)
  };
  lastDonationDate: string;
  daysSinceLastDonation: number;
  isEligibleNow: boolean;
  disqualificationReason?: string;
  distanceKm: number;
  contactNumber: string;
  city: string;
  totalDonationsCount: number;
  badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'LifeSaver Hero';
}

export const SYNTHEA_DONORS_DATASET: SyntheaDonorRecord[] = [
  {
    syntheaPatientId: 'SYN-PAT-88102',
    fullName: 'Aditya Mehta',
    gender: 'M',
    birthDate: '1992-06-14',
    bloodGroup: 'O-', // Universal Donor!
    loincObservations: {
      hemoglobinGdl: 14.8,
      plateletCountK: 260,
      bloodPressure: '120/78',
    },
    lastDonationDate: '2025-10-10',
    daysSinceLastDonation: 120,
    isEligibleNow: true,
    distanceKm: 1.8,
    contactNumber: '+91 98201 44551',
    city: 'Mumbai',
    totalDonationsCount: 8,
    badgeLevel: 'Gold',
  },
  {
    syntheaPatientId: 'SYN-PAT-90314',
    fullName: 'Sneha Kulkarni',
    gender: 'F',
    birthDate: '1996-11-20',
    bloodGroup: 'O-', // Universal Donor!
    loincObservations: {
      hemoglobinGdl: 13.2,
      plateletCountK: 210,
      bloodPressure: '116/74',
    },
    lastDonationDate: '2025-08-15',
    daysSinceLastDonation: 185,
    isEligibleNow: true,
    distanceKm: 3.4,
    contactNumber: '+91 98202 77881',
    city: 'Mumbai',
    totalDonationsCount: 5,
    badgeLevel: 'Silver',
  },
  {
    syntheaPatientId: 'SYN-PAT-77291',
    fullName: 'Rajesh Iyer',
    gender: 'M',
    birthDate: '1988-02-04',
    bloodGroup: 'O+',
    loincObservations: {
      hemoglobinGdl: 15.1,
      plateletCountK: 290,
      bloodPressure: '124/80',
    },
    lastDonationDate: '2025-11-01',
    daysSinceLastDonation: 98,
    isEligibleNow: true,
    distanceKm: 2.1,
    contactNumber: '+91 98111 33441',
    city: 'Mumbai',
    totalDonationsCount: 12,
    badgeLevel: 'LifeSaver Hero',
  },
  {
    syntheaPatientId: 'SYN-PAT-65402',
    fullName: 'Pooja Deshmukh',
    gender: 'F',
    birthDate: '1997-09-12',
    bloodGroup: 'A+',
    loincObservations: {
      hemoglobinGdl: 13.6,
      plateletCountK: 235,
      bloodPressure: '118/76',
    },
    lastDonationDate: '2025-09-18',
    daysSinceLastDonation: 145,
    isEligibleNow: true,
    distanceKm: 2.7,
    contactNumber: '+91 97654 88991',
    city: 'Mumbai',
    totalDonationsCount: 4,
    badgeLevel: 'Silver',
  },
  {
    syntheaPatientId: 'SYN-PAT-54911',
    fullName: 'Karan Malhotra',
    gender: 'M',
    birthDate: '1994-03-29',
    bloodGroup: 'A-',
    loincObservations: {
      hemoglobinGdl: 14.2,
      plateletCountK: 215,
      bloodPressure: '122/82',
    },
    lastDonationDate: '2025-12-15',
    daysSinceLastDonation: 65,
    isEligibleNow: false,
    disqualificationReason: 'Interval < 90 days (25 days remaining)',
    distanceKm: 4.2,
    contactNumber: '+91 98333 11221',
    city: 'Mumbai',
    totalDonationsCount: 3,
    badgeLevel: 'Bronze',
  },
  {
    syntheaPatientId: 'SYN-PAT-43890',
    fullName: 'Vikram Joshi',
    gender: 'M',
    birthDate: '1991-07-08',
    bloodGroup: 'B+',
    loincObservations: {
      hemoglobinGdl: 14.9,
      plateletCountK: 280,
      bloodPressure: '126/82',
    },
    lastDonationDate: '2025-10-04',
    daysSinceLastDonation: 126,
    isEligibleNow: true,
    distanceKm: 1.5,
    contactNumber: '+91 98199 55661',
    city: 'Mumbai',
    totalDonationsCount: 9,
    badgeLevel: 'Gold',
  },
  {
    syntheaPatientId: 'SYN-PAT-32810',
    fullName: 'Neha Banerjee',
    gender: 'F',
    birthDate: '1995-12-19',
    bloodGroup: 'B-',
    loincObservations: {
      hemoglobinGdl: 12.8,
      plateletCountK: 195,
      bloodPressure: '115/72',
    },
    lastDonationDate: '2025-07-22',
    daysSinceLastDonation: 210,
    isEligibleNow: true,
    distanceKm: 3.8,
    contactNumber: '+91 98212 99001',
    city: 'Mumbai',
    totalDonationsCount: 6,
    badgeLevel: 'Silver',
  },
  {
    syntheaPatientId: 'SYN-PAT-21980',
    fullName: 'Farhan Shaikh',
    gender: 'M',
    birthDate: '1990-05-15',
    bloodGroup: 'AB+', // Universal Recipient
    loincObservations: {
      hemoglobinGdl: 15.4,
      plateletCountK: 310,
      bloodPressure: '128/84',
    },
    lastDonationDate: '2025-08-30',
    daysSinceLastDonation: 170,
    isEligibleNow: true,
    distanceKm: 2.9,
    contactNumber: '+91 98450 11441',
    city: 'Mumbai',
    totalDonationsCount: 7,
    badgeLevel: 'Gold',
  },
  {
    syntheaPatientId: 'SYN-PAT-10872',
    fullName: 'Meenakshi Sundaram',
    gender: 'F',
    birthDate: '1993-10-02',
    bloodGroup: 'AB-', // Very Rare!
    loincObservations: {
      hemoglobinGdl: 13.0,
      plateletCountK: 220,
      bloodPressure: '118/75',
    },
    lastDonationDate: '2025-06-11',
    daysSinceLastDonation: 250,
    isEligibleNow: true,
    distanceKm: 4.8,
    contactNumber: '+91 98700 88221',
    city: 'Mumbai',
    totalDonationsCount: 5,
    badgeLevel: 'Silver',
  },
];

export function findMatchingSyntheaDonors(
  recipientBloodGroup: BloodGroup,
  maxDistanceKm = 10,
  eligibleOnly = true
): SyntheaDonorRecord[] {
  // Compatible donor groups for red blood cells
  const compatibleGroups = RBC_DONOR_COMPATIBILITY[recipientBloodGroup] || ['O-'];

  return SYNTHEA_DONORS_DATASET.filter((donor) => {
    const isCompatible = compatibleGroups.includes(donor.bloodGroup);
    const inDistance = donor.distanceKm <= maxDistanceKm;
    const meetsEligibility = eligibleOnly ? donor.isEligibleNow : true;
    return isCompatible && inDistance && meetsEligibility;
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

export function summonSyntheaDonor(
  donor: SyntheaDonorRecord,
  hospitalName: string,
  bloodGroupNeeded: BloodGroup
): { summonId: string; message: string; timestamp: string } {
  const summonId = `SUMMON-${Math.floor(100000 + Math.random() * 900000)}`;
  const message = `URGENT BLOOD DISPATCH: ${hospitalName} requests emergency ${bloodGroupNeeded} blood. Donor ${donor.fullName} (Synthea ID: ${donor.syntheaPatientId}) summoned via SMS & App Alert.`;

  return {
    summonId,
    message,
    timestamp: new Date().toISOString(),
  };
}
