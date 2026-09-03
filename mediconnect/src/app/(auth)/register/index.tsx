import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';

interface RoleOption {
  id: Exclude<UserRole, 'admin'>;
  title: string;
  badge: string;
  description: string;
  icon: string;
  themeColor: string;
}

const PUBLIC_ROLES: RoleOption[] = [
  {
    id: 'patient',
    title: 'Patient / Citizen',
    badge: 'Immediate Access',
    description:
      'Emergency SOS trigger, instant ambulance tracker, digital medical QR pass, and nearby hospital bed check.',
    icon: 'person',
    themeColor: '#10B981',
  },
  {
    id: 'doctor',
    title: 'Doctor / Healthcare Pro',
    badge: 'License Verification',
    description:
      'Provide tele-triage consultations, review incoming emergency records, and offer first-aid advice.',
    icon: 'medical',
    themeColor: '#8B5CF6',
  },
  {
    id: 'hospital',
    title: 'Hospital / Clinic',
    badge: 'Facility Verification',
    description:
      'Manage live ICU, ventilator, and bed availability. Receive pre-arrival trauma patient alerts from ambulances.',
    icon: 'business',
    themeColor: '#0284C7',
  },
  {
    id: 'ambulance',
    title: 'Ambulance / EMS Fleet',
    badge: 'Fleet Dispatch',
    description:
      'Live GPS telemetry beacon, receive dispatch requests, view patient allergy/blood data, and ER handovers.',
    icon: 'car-sport',
    themeColor: '#F59E0B',
  },
  {
    id: 'blood_bank',
    title: 'Blood Bank Hub',
    badge: 'Inventory Hub',
    description:
      'Broadcast rare blood requests, sync live unit stocks (A, B, AB, O), and coordinate with donors.',
    icon: 'water',
    themeColor: '#EF4444',
  },
  {
    id: 'responder',
    title: 'Emergency Responder / EMT',
    badge: 'Badge Verified',
    description:
      'On-scene triage, AED location beacons, rapid trauma stabilization, and emergency CPR assistance.',
    icon: 'flash',
    themeColor: '#DC2626',
  },
];

export default function SelectRoleScreen() {
  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, 'admin'>>('patient');

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/register/account' as any,
      params: { role: selectedRole },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/(auth)/login' as any)}>
          <Ionicons name="arrow-back" size={20} color="#334155" />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 1 of 3: Account Classification</Text>
        </View>

        <Text style={styles.title}>Who are you registering as?</Text>
        <Text style={styles.subtitle}>
          HealthConnect delivers custom workflows and emergency controls tailored to your role.
        </Text>
        <View style={styles.adminNotice}>
          <Ionicons name="shield-checkmark" size={14} color="#64748B" />
          <Text style={styles.adminNoticeText}>
            Administrator accounts are provisioned internally and do not have public signup.
          </Text>
        </View>
      </View>

      <View style={styles.rolesGrid}>
        {PUBLIC_ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                isSelected && { borderColor: role.themeColor, backgroundColor: '#F8FAFC' },
              ]}
              onPress={() => setSelectedRole(role.id)}
              activeOpacity={0.85}>
              <View style={styles.roleCardTop}>
                <View style={[styles.iconBox, { backgroundColor: role.themeColor + '18' }]}>
                  <Ionicons name={role.icon as any} size={22} color={role.themeColor} />
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isSelected ? role.themeColor : '#F1F5F9' },
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isSelected ? '#FFFFFF' : '#475569' },
                    ]}>
                    {role.badge}
                  </Text>
                </View>
              </View>

              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && { borderColor: role.themeColor },
                    ]}>
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: role.themeColor },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.selectText,
                      isSelected && { color: role.themeColor, fontWeight: '700' },
                    ]}>
                    {isSelected ? 'Selected' : 'Select'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue to Account Details</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
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
  stepIndicator: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  adminNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 6,
  },
  adminNoticeText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  rolesGrid: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  ctaContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 14,
    borderRadius: 10,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
