import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';
import { getRoleBadgeDetails } from '@/utils/roleRedirect';

export default function RoleOnboardingScreen() {
  const params = useLocalSearchParams<{
    role?: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
  }>();

  const selectedRole = (params.role as Exclude<UserRole, 'admin'>) || 'patient';
  const roleBadge = getRoleBadgeDetails(selectedRole);
  const { registerUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // PATIENT FIELDS
  // -------------------------------------------------------------
  const [patientDob, setPatientDob] = useState('1996-05-20');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientBloodGroup, setPatientBloodGroup] = useState<string>('O+');
  const [patientAllergies, setPatientAllergies] = useState('Penicillin');
  const [patientConditions, setPatientConditions] = useState('Asthma');
  const [patientMeds, setPatientMeds] = useState('Albuterol');
  const [iceName, setIceName] = useState('Anita Sharma');
  const [iceRelation, setIceRelation] = useState('Spouse');
  const [icePhone, setIcePhone] = useState('+91 98765 43211');
  const [patientAddress, setPatientAddress] = useState('Flat 204, Sea View, Marine Drive');
  const [patientCity, setPatientCity] = useState('Mumbai');
  const [patientPin, setPatientPin] = useState('400020');

  // -------------------------------------------------------------
  // DOCTOR FIELDS
  // -------------------------------------------------------------
  const [docRegNo, setDocRegNo] = useState('MCI-2018-9281');
  const [docQuals, setDocQuals] = useState('MBBS, MD - Emergency Medicine');
  const [docSpec, setDocSpec] = useState('Cardiology & Trauma');
  const [docExp, setDocExp] = useState('8');
  const [docHospital, setDocHospital] = useState('Metro Trauma Center');
  const [docFee, setDocFee] = useState('500');

  // -------------------------------------------------------------
  // HOSPITAL FIELDS
  // -------------------------------------------------------------
  const [hospType, setHospType] = useState<'General' | 'Trauma Center' | 'Specialty'>('Trauma Center');
  const [hospRegNo, setHospRegNo] = useState('HOSP-MUM-4491');
  const [hospAddress, setHospAddress] = useState('108 Emergency Blvd, Sector 4');
  const [hospHotline, setHospHotline] = useState('108 / 022-2600-0000');
  const [hospBeds, setHospBeds] = useState('120');
  const [hospIcuBeds, setHospIcuBeds] = useState('16');
  const [hospVents, setHospVents] = useState('8');

  // -------------------------------------------------------------
  // AMBULANCE FIELDS
  // -------------------------------------------------------------
  const [ambOrg, setAmbOrg] = useState('Rapid Life Emergency EMS');
  const [ambId, setAmbId] = useState('AMB-EMS-102');
  const [ambType, setAmbType] = useState<'BLS' | 'ALS' | 'Neonatal'>('ALS');
  const [ambVehicleNo, setAmbVehicleNo] = useState('MH 02 AB 9988');
  const [ambDriverName, setAmbDriverName] = useState('Sunil Shinde');
  const [ambDriverPhone, setAmbDriverPhone] = useState('+91 98199 88776');
  const [ambParamedic, setAmbParamedic] = useState('Karan Joshi (EMT-B)');

  // -------------------------------------------------------------
  // BLOOD BANK FIELDS
  // -------------------------------------------------------------
  const [bbName, setBbName] = useState('City LifeBlood Resource Center');
  const [bbLicNo, setBbLicNo] = useState('BB-MUM-882');
  const [bbHotline, setBbHotline] = useState('+91 22 2500 1122');
  const [bbAddress, setBbAddress] = useState('Health Complex, Central Hospital Rd');
  const [bbHours, setBbHours] = useState('24 Hours / 7 Days');

  // -------------------------------------------------------------
  // RESPONDER FIELDS
  // -------------------------------------------------------------
  const [respBadge, setRespBadge] = useState('EMT-P-77401');
  const [respOrg, setRespOrg] = useState('Disaster Medical Assistance Team');
  const [respRoleTitle, setRespRoleTitle] = useState('Advanced EMT');
  const [respCerts, setRespCerts] = useState('ACLS, PHTLS, CPR Certified');
  const [respContact, setRespContact] = useState('+91 97654 32100');

  const bloodGroupList = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async () => {
    setError(null);

    let profileData: any = {};

    if (selectedRole === 'patient') {
      if (!iceName.trim() || !icePhone.trim()) {
        setError('Please provide at least one Emergency Contact Name and Phone.');
        return;
      }
      profileData = {
        dateOfBirth: patientDob,
        gender: patientGender,
        bloodGroup: patientBloodGroup,
        allergies: patientAllergies ? patientAllergies.split(',').map((s) => s.trim()) : [],
        existingConditions: patientConditions ? patientConditions.split(',').map((s) => s.trim()) : [],
        currentMedications: patientMeds ? patientMeds.split(',').map((s) => s.trim()) : [],
        emergencyContact: {
          name: iceName,
          relation: iceRelation,
          phoneNumber: icePhone,
        },
        homeAddress: patientAddress,
        city: patientCity,
        postalCode: patientPin,
        qrPassToken: `qr_pass_${Date.now()}`,
      };
    } else if (selectedRole === 'doctor') {
      if (!docRegNo.trim()) {
        setError('Medical Registration Number is required for doctors.');
        return;
      }
      profileData = {
        medicalRegNumber: docRegNo,
        qualifications: docQuals.split(',').map((s) => s.trim()),
        specialization: docSpec,
        yearsOfExperience: parseInt(docExp, 10) || 0,
        hospitalAffiliationName: docHospital,
        consultationAvailable: true,
        consultationFee: parseInt(docFee, 10) || 0,
        isVerified: false,
      };
    } else if (selectedRole === 'hospital') {
      profileData = {
        registrationLicenseNumber: hospRegNo,
        hospitalType: hospType,
        address: hospAddress,
        city: 'Mumbai',
        postalCode: '400001',
        emergencyHotline: hospHotline,
        hasEmergencyDepartment: true,
        totalBeds: parseInt(hospBeds, 10) || 100,
        availableBeds: 25,
        totalIcuBeds: parseInt(hospIcuBeds, 10) || 10,
        availableIcuBeds: 4,
        totalVentilators: parseInt(hospVents, 10) || 5,
        availableVentilators: 2,
        hasOperationTheatre: true,
        hasBloodBank: true,
        hasAmbulanceService: true,
        specializations: ['Trauma', 'Emergency Medicine', 'ICU'],
        isVerified: false,
      };
    } else if (selectedRole === 'ambulance') {
      profileData = {
        organizationName: ambOrg,
        ambulanceIdNumber: ambId,
        ambulanceType: ambType,
        vehicleRegistrationNumber: ambVehicleNo,
        driverName: ambDriverName,
        driverPhone: ambDriverPhone,
        paramedicName: ambParamedic,
        equipmentList: ['AED', 'Oxygen Kit', 'Stretcher', 'Splints'],
        status: 'available',
        isVerified: false,
      };
    } else if (selectedRole === 'blood_bank') {
      profileData = {
        bankName: bbName,
        licenseNumber: bbLicNo,
        address: bbAddress,
        city: 'Mumbai',
        postalCode: '400001',
        hotlinePhone: bbHotline,
        operatingHours: bbHours,
        inventoryUnits: {
          'A+': 15,
          'A-': 4,
          'B+': 20,
          'B-': 3,
          'AB+': 8,
          'AB-': 2,
          'O+': 25,
          'O-': 6,
        },
        plateletsAvailable: true,
        plasmaAvailable: true,
        isVerified: false,
      };
    } else if (selectedRole === 'responder') {
      profileData = {
        badgeOrResponderId: respBadge,
        organizationName: respOrg,
        responderRole: respRoleTitle,
        certifications: respCerts.split(',').map((s) => s.trim()),
        emergencyContactPhone: respContact,
        isOnDuty: true,
        isVerified: false,
      };
    }

    const res = await registerUser(
      {
        fullName: params.fullName || 'New HealthConnect User',
        phoneNumber: params.phoneNumber || '+91 98000 00000',
        email: params.email,
        password: params.password,
        role: selectedRole,
      },
      profileData
    );

    if (!res.success && res.error) {
      setError(res.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#334155" />
        <Text style={styles.backBtnText}>Back to Account Info</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 3 of 3: Role-Specific Onboarding</Text>
        </View>

        <View style={styles.roleBanner}>
          <View style={[styles.roleDot, { backgroundColor: roleBadge.color }]} />
          <Text style={styles.roleBannerText}>
            Configuring <Text style={{ fontWeight: '700', color: roleBadge.color }}>{roleBadge.label}</Text> Profile
          </Text>
        </View>

        <Text style={styles.title}>
          {selectedRole === 'patient' && 'Medical & Emergency Contacts'}
          {selectedRole === 'doctor' && 'Medical Credentials & Practice'}
          {selectedRole === 'hospital' && 'Facility & Emergency Bed Capacities'}
          {selectedRole === 'ambulance' && 'Vehicle, Equipment & Crew Setup'}
          {selectedRole === 'blood_bank' && 'Facility License & Operating Details'}
          {selectedRole === 'responder' && 'EMT Certification & Deployment Info'}
        </Text>

        <Text style={styles.subtitle}>
          This data ensures accurate triage, emergency dispatch, and life-saving coordination.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ----------------- PATIENT FORM ----------------- */}
        {selectedRole === 'patient' && (
          <View style={styles.formSection}>
            <Text style={styles.sectionHeader}>1. Blood Group & Vitals</Text>
            <View style={styles.bloodGroupRow}>
              {bloodGroupList.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bgPill,
                    patientBloodGroup === bg && styles.bgPillActive,
                  ]}
                  onPress={() => setPatientBloodGroup(bg)}>
                  <Text
                    style={[
                      styles.bgPillText,
                      patientBloodGroup === bg && styles.bgPillTextActive,
                    ]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Known Allergies (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Penicillin, Peanuts, Latex"
                placeholderTextColor="#94A3B8"
                value={patientAllergies}
                onChangeText={setPatientAllergies}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Existing Medical Conditions</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Asthma, Diabetes, Hypertension"
                placeholderTextColor="#94A3B8"
                value={patientConditions}
                onChangeText={setPatientConditions}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Medications</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Inhaler, Metformin 500mg"
                placeholderTextColor="#94A3B8"
                value={patientMeds}
                onChangeText={setPatientMeds}
              />
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>2. In Case of Emergency (ICE) Contact</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Anita Sharma"
                placeholderTextColor="#94A3B8"
                value={iceName}
                onChangeText={setIceName}
              />
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Relationship *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Spouse / Parent / Sibling"
                  placeholderTextColor="#94A3B8"
                  value={iceRelation}
                  onChangeText={setIceRelation}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Emergency Phone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43211"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={icePhone}
                  onChangeText={setIcePhone}
                />
              </View>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>3. Primary Residence</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Home / Residence address"
                placeholderTextColor="#94A3B8"
                value={patientAddress}
                onChangeText={setPatientAddress}
              />
            </View>
            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={patientCity}
                  onChangeText={setPatientCity}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>PIN Code</Text>
                <TextInput
                  style={styles.input}
                  value={patientPin}
                  onChangeText={setPatientPin}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
        )}

        {/* ----------------- DOCTOR FORM ----------------- */}
        {selectedRole === 'doctor' && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical Council Registration No. *</Text>
              <TextInput
                style={styles.input}
                placeholder="MCI-YYYY-XXXX"
                placeholderTextColor="#94A3B8"
                value={docRegNo}
                onChangeText={setDocRegNo}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Degrees & Qualifications</Text>
              <TextInput
                style={styles.input}
                placeholder="MBBS, MD - Emergency Medicine"
                placeholderTextColor="#94A3B8"
                value={docQuals}
                onChangeText={setDocQuals}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Specialization</Text>
              <TextInput
                style={styles.input}
                placeholder="Emergency Trauma, Critical Care, Cardiology"
                placeholderTextColor="#94A3B8"
                value={docSpec}
                onChangeText={setDocSpec}
              />
            </View>
            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Experience (Years)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="8"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={docExp}
                  onChangeText={setDocExp}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Consult Fee (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={docFee}
                  onChangeText={setDocFee}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Affiliated Hospital / Clinic</Text>
              <TextInput
                style={styles.input}
                placeholder="Metro Trauma Center"
                placeholderTextColor="#94A3B8"
                value={docHospital}
                onChangeText={setDocHospital}
              />
            </View>
          </View>
        )}

        {/* ----------------- HOSPITAL FORM ----------------- */}
        {selectedRole === 'hospital' && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facility License / Registration No. *</Text>
              <TextInput
                style={styles.input}
                placeholder="HOSP-REG-YYYY-XXXX"
                placeholderTextColor="#94A3B8"
                value={hospRegNo}
                onChangeText={setHospRegNo}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facility Address</Text>
              <TextInput
                style={styles.input}
                value={hospAddress}
                onChangeText={setHospAddress}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>24/7 Emergency Casualty Hotline *</Text>
              <TextInput
                style={styles.input}
                placeholder="108 / 022-XXXX-XXXX"
                placeholderTextColor="#94A3B8"
                value={hospHotline}
                onChangeText={setHospHotline}
              />
            </View>
            <View style={styles.threeCol}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Total Beds</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={hospBeds}
                  onChangeText={setHospBeds}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ICU Beds</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={hospIcuBeds}
                  onChangeText={setHospIcuBeds}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Ventilators</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={hospVents}
                  onChangeText={setHospVents}
                />
              </View>
            </View>
          </View>
        )}

        {/* ----------------- AMBULANCE FORM ----------------- */}
        {selectedRole === 'ambulance' && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization / Service Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Rapid EMS Network"
                placeholderTextColor="#94A3B8"
                value={ambOrg}
                onChangeText={setAmbOrg}
              />
            </View>
            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Ambulance Unit ID</Text>
                <TextInput
                  style={styles.input}
                  value={ambId}
                  onChangeText={setAmbId}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Vehicle Reg No.</Text>
                <TextInput
                  style={styles.input}
                  value={ambVehicleNo}
                  onChangeText={setAmbVehicleNo}
                />
              </View>
            </View>
            <View style={styles.twoCol}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Driver Name</Text>
                <TextInput
                  style={styles.input}
                  value={ambDriverName}
                  onChangeText={setAmbDriverName}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Driver Phone</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={ambDriverPhone}
                  onChangeText={setAmbDriverPhone}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Onboard Paramedic / EMT</Text>
              <TextInput
                style={styles.input}
                value={ambParamedic}
                onChangeText={setAmbParamedic}
              />
            </View>
          </View>
        )}

        {/* ----------------- BLOOD BANK FORM ----------------- */}
        {selectedRole === 'blood_bank' && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Blood Bank Facility Name *</Text>
              <TextInput
                style={styles.input}
                value={bbName}
                onChangeText={setBbName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>License Number *</Text>
              <TextInput
                style={styles.input}
                value={bbLicNo}
                onChangeText={setBbLicNo}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Dispatch Hotline</Text>
              <TextInput
                style={styles.input}
                value={bbHotline}
                onChangeText={setBbHotline}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facility Address</Text>
              <TextInput
                style={styles.input}
                value={bbAddress}
                onChangeText={setBbAddress}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Operating Hours</Text>
              <TextInput
                style={styles.input}
                value={bbHours}
                onChangeText={setBbHours}
              />
            </View>
          </View>
        )}

        {/* ----------------- RESPONDER FORM ----------------- */}
        {selectedRole === 'responder' && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Badge / First Responder ID *</Text>
              <TextInput
                style={styles.input}
                placeholder="EMT-XXXXX"
                placeholderTextColor="#94A3B8"
                value={respBadge}
                onChangeText={setRespBadge}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization / Station</Text>
              <TextInput
                style={styles.input}
                value={respOrg}
                onChangeText={setRespOrg}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responder Title / Role</Text>
              <TextInput
                style={styles.input}
                value={respRoleTitle}
                onChangeText={setRespRoleTitle}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Certifications</Text>
              <TextInput
                style={styles.input}
                value={respCerts}
                onChangeText={setRespCerts}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duty Contact Phone</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={respContact}
                onChangeText={setRespContact}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Complete Registration & Launch</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  stepIndicator: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  roleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  roleBannerText: {
    fontSize: 13,
    color: '#334155',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    flex: 1,
  },
  formSection: {
    gap: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bloodGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  bgPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  bgPillActive: {
    borderColor: HealthcareColors.emergencyRed,
    backgroundColor: '#FEF2F2',
  },
  bgPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  bgPillTextActive: {
    color: HealthcareColors.emergencyRed,
    fontWeight: '800',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  threeCol: {
    flexDirection: 'row',
    gap: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
