import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AmbulanceProfileData, AmbulanceStatus } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';

export default function AmbulanceDashboard() {
  const { user, profile } = useAuth();
  const ambProfile = profile as AmbulanceProfileData | undefined;

  const [fleetStatus, setFleetStatus] = useState<AmbulanceStatus>('available');
  const [activeCallPhase, setActiveCallPhase] = useState<'idle' | 'dispatched' | 'picked_up' | 'arrived_er'>('dispatched');

  const handleStatusChange = (status: AmbulanceStatus) => {
    setFleetStatus(status);
    if (status === 'available') {
      setActiveCallPhase('idle');
    } else if (status === 'on_emergency_call') {
      setActiveCallPhase('dispatched');
    }
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Ambulance EMS Telemetry Desk" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vehicle & Crew Card */}
        <View style={styles.fleetCard}>
          <View style={styles.fleetHeader}>
            <View style={styles.fleetIcon}>
              <Ionicons name="car-sport" size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.unitTitle}>
                {ambProfile?.ambulanceIdNumber || 'AMB-MH-01-7749'} • {ambProfile?.ambulanceType || 'ALS'} Unit
              </Text>
              <Text style={styles.unitSub}>
                Vehicle: {ambProfile?.vehicleRegistrationNumber || 'MH 01 EQ 7749'} • Driver: {ambProfile?.driverName || 'Vikram Jadhav'}
              </Text>
            </View>
          </View>

          {/* Availability Switch Tabs */}
          <View style={styles.statusTabs}>
            {[
              { id: 'available' as AmbulanceStatus, label: '🟢 Available', color: '#059669' },
              { id: 'on_emergency_call' as AmbulanceStatus, label: '🔴 On Call', color: '#DC2626' },
              { id: 'offline' as AmbulanceStatus, label: '⚪ Offline', color: '#64748B' },
            ].map((st) => (
              <TouchableOpacity
                key={st.id}
                style={[
                  styles.statusTabBtn,
                  fleetStatus === st.id && {
                    backgroundColor: '#FFFFFF',
                    borderColor: st.color,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => handleStatusChange(st.id)}>
                <Text
                  style={[
                    styles.statusTabLabel,
                    fleetStatus === st.id && { color: st.color, fontWeight: '700' },
                  ]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Emergency Dispatch Order */}
        {activeCallPhase !== 'idle' ? (
          <View style={styles.dispatchCard}>
            <View style={styles.dispatchHeader}>
              <View style={styles.priorityPill}>
                <Ionicons name="flame" size={14} color="#FFFFFF" />
                <Text style={styles.priorityPillText}>CRITICAL EMERGENCY DISPATCH</Text>
              </View>
              <Text style={styles.orderId}>#DISP-89421</Text>
            </View>

            <View style={styles.incidentRow}>
              <Text style={styles.incidentTitle}>Cardiac Arrest & Respiratory Failure</Text>
              <Text style={styles.incidentAddress}>
                Location: A-402, Green Valley Towers, Sector 15 (1.4 km away)
              </Text>
            </View>

            {/* Victim Pre-loaded Medical Passport */}
            <View style={styles.patientPassport}>
              <View style={styles.passportTop}>
                <View style={styles.bloodTag}>
                  <Text style={styles.bloodTagText}>O+</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patName}>Rahul Sharma (32y, Male)</Text>
                  <Text style={styles.patAlert}>
                    Allergies: <Text style={{ fontWeight: '700' }}>Penicillin, Sulfa</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.callPatBtn}
                  onPress={() => alert('Calling In-Case-of-Emergency contact: +91 98765 43211')}>
                  <Ionicons name="call" size={16} color="#0284C7" />
                </TouchableOpacity>
              </View>
              <Text style={styles.patHistory}>
                History: Mild Asthma • Rescue Inhaler with patient
              </Text>
            </View>

            {/* Step Progress Tracker */}
            <View style={styles.phaseSteps}>
              <TouchableOpacity
                style={[
                  styles.phaseBtn,
                  activeCallPhase === 'dispatched' && styles.phaseBtnActive,
                ]}
                onPress={() => setActiveCallPhase('dispatched')}>
                <Text style={styles.phaseBtnText}>1. En Route</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.phaseBtn,
                  activeCallPhase === 'picked_up' && styles.phaseBtnActive,
                ]}
                onPress={() => setActiveCallPhase('picked_up')}>
                <Text style={styles.phaseBtnText}>2. Patient Onboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.phaseBtn,
                  activeCallPhase === 'arrived_er' && styles.phaseBtnActive,
                ]}
                onPress={() => {
                  setActiveCallPhase('arrived_er');
                  alert('Patient successfully handed over to Metro Hospital ER Trauma Bay 1.');
                }}>
                <Text style={styles.phaseBtnText}>3. ER Handover</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => alert('Launching GPS Turn-by-Turn Navigation to patient coordinates...')}>
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.navBtnText}>Launch Turn-by-Turn GPS Navigation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.idleCard}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#059669" />
            <Text style={styles.idleTitle}>Fleet Unit Available</Text>
            <Text style={styles.idleSub}>
              GPS beacon active. Standing by for emergency dispatch orders.
            </Text>
          </View>
        )}

        {/* Onboard ALS Equipment Checklist */}
        <Text style={styles.sectionTitle}>Onboard Medical Equipment Status</Text>
        <View style={styles.equipGrid}>
          {[
            { name: 'Defibrillator (AED)', status: 'Operational', battery: '98%' },
            { name: 'Portable Ventilator', status: 'Operational', battery: '100%' },
            { name: 'Oxygen 10L Tank', status: 'Full (150 bar)', battery: 'N/A' },
            { name: 'Spine Board & Collar', status: 'Inspected', battery: 'N/A' },
          ].map((eq) => (
            <View key={eq.name} style={styles.equipCard}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.equipName}>{eq.name}</Text>
                <Text style={styles.equipSub}>{eq.status} • {eq.battery}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  fleetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  fleetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fleetIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  unitSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginTop: 14,
    gap: 4,
  },
  statusTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  statusTabLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  dispatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F87171',
    padding: 16,
    gap: 12,
    shadowColor: '#DC2626',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  dispatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  incidentRow: {
    gap: 2,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  incidentAddress: {
    fontSize: 12,
    color: '#64748B',
  },
  patientPassport: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  passportTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bloodTag: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodTagText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  patName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  patAlert: {
    fontSize: 11,
    color: '#B91C1C',
  },
  patHistory: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  callPatBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  phaseSteps: {
    flexDirection: 'row',
    gap: 6,
  },
  phaseBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  phaseBtnActive: {
    backgroundColor: HealthcareColors.emergencyRed,
  },
  phaseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  idleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  idleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  idleSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  equipGrid: {
    gap: 8,
  },
  equipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  equipName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  equipSub: {
    fontSize: 11,
    color: '#64748B',
  },
});
