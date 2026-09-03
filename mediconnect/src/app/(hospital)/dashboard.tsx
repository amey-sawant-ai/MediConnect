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
import { HospitalProfileData } from '@/types/auth';

export default function HospitalDashboard() {
  const { user, profile } = useAuth();
  const hospProfile = profile as HospitalProfileData | undefined;

  // Live Capacity States
  const [icuAvailable, setIcuAvailable] = useState<number>(hospProfile?.availableIcuBeds || 6);
  const [bedsAvailable, setBedsAvailable] = useState<number>(hospProfile?.availableBeds || 38);
  const [ventsAvailable, setVentsAvailable] = useState<number>(hospProfile?.availableVentilators || 4);

  // Incoming Ambulance Handover Radar
  const [incomingAlerts, setIncomingAlerts] = useState([
    {
      id: 'amb_alert_1',
      unit: 'Rapid ALS Unit 07',
      eta: '3 mins',
      patient: 'Rahul Sharma (32y, Male)',
      bloodGroup: 'O+',
      condition: 'Acute Trauma / Multiple Fractures',
      vitalStats: 'BP: 90/60 • HR: 125 • SpO2: 92%',
      prepNeeded: 'Trauma Bay 1 + 2 Units O+ Blood',
      status: 'En Route',
    },
    {
      id: 'amb_alert_2',
      unit: 'City Ambulance 14',
      eta: '11 mins',
      patient: 'K. Pillai (68y, Female)',
      bloodGroup: 'B+',
      condition: 'Suspected Ischemic Stroke',
      vitalStats: 'GCS: 11 • Last Normal: 45m',
      prepNeeded: 'CT Scan & Neuro Team on standby',
      status: 'Dispatched',
    },
  ]);

  const [bayReserved, setBayReserved] = useState<Record<string, boolean>>({});

  const handleReserveBay = (id: string) => {
    setBayReserved((prev) => ({ ...prev, [id]: true }));
    alert('Trauma Bay Reserved! Pre-arrival notification confirmed to ambulance paramedics.');
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Hospital ER & Bed Matrix Desk" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hospital Facility Identity */}
        <View style={styles.hospitalCard}>
          <View style={styles.hospTop}>
            <View style={styles.iconBox}>
              <Ionicons name="business" size={24} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hospName}>
                {user?.fullName || 'Metro City Trauma & Multi-Specialty Hospital'}
              </Text>
              <Text style={styles.hospSub}>
                License: {hospProfile?.registrationLicenseNumber || 'HOSP-MUM-2021-998'} • 24/7 Level 1 Trauma Center
              </Text>
            </View>
          </View>
          <View style={styles.hotlineBanner}>
            <Ionicons name="call" size={16} color="#DC2626" />
            <Text style={styles.hotlineText}>
              Emergency ER Line: <Text style={{ fontWeight: '700' }}>108 / 022-2400-9999</Text>
            </Text>
          </View>
        </View>

        {/* Live Capacity Controls */}
        <Text style={styles.sectionTitle}>Real-Time ER Bed & ICU Capacity Controls</Text>
        <Text style={styles.sectionSubtitle}>
          Adjust numbers instantly to broadcast live capacity to dispatchers and nearby citizens.
        </Text>

        <View style={styles.capacityGrid}>
          {/* ICU Beds */}
          <View style={styles.capacityCard}>
            <View style={styles.capacityTop}>
              <Text style={styles.capacityLabel}>Available ICU Beds</Text>
              <View style={styles.capacityBadge}>
                <Text style={styles.capacityBadgeText}>Total: 24</Text>
              </View>
            </View>
            <Text style={[styles.capacityValue, { color: '#059669' }]}>{icuAvailable}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setIcuAvailable((prev) => Math.max(0, prev - 1))}>
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setIcuAvailable((prev) => prev + 1)}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ventilators */}
          <View style={styles.capacityCard}>
            <View style={styles.capacityTop}>
              <Text style={styles.capacityLabel}>Free Ventilators</Text>
              <View style={styles.capacityBadge}>
                <Text style={styles.capacityBadgeText}>Total: 18</Text>
              </View>
            </View>
            <Text style={[styles.capacityValue, { color: '#0284C7' }]}>{ventsAvailable}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setVentsAvailable((prev) => Math.max(0, prev - 1))}>
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setVentsAvailable((prev) => prev + 1)}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* General Beds */}
          <View style={styles.capacityCard}>
            <View style={styles.capacityTop}>
              <Text style={styles.capacityLabel}>General ER Beds</Text>
              <View style={styles.capacityBadge}>
                <Text style={styles.capacityBadgeText}>Total: 240</Text>
              </View>
            </View>
            <Text style={[styles.capacityValue, { color: '#D97706' }]}>{bedsAvailable}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setBedsAvailable((prev) => Math.max(0, prev - 1))}>
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setBedsAvailable((prev) => prev + 1)}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Incoming Ambulance Radar */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Incoming Ambulance Telemetry & ER Pre-Arrival</Text>
        <Text style={styles.sectionSubtitle}>
          Real-time patient telemetry received before physical handover.
        </Text>

        <View style={styles.alertsList}>
          {incomingAlerts.map((alertItem) => {
            const isReserved = bayReserved[alertItem.id];
            return (
              <View key={alertItem.id} style={styles.alertCard}>
                <View style={styles.alertCardTop}>
                  <View style={styles.unitRow}>
                    <Ionicons name="car-sport" size={18} color="#F59E0B" />
                    <Text style={styles.unitName}>{alertItem.unit}</Text>
                  </View>
                  <View style={styles.etaBadge}>
                    <Ionicons name="timer-outline" size={14} color="#DC2626" />
                    <Text style={styles.etaText}>ETA: {alertItem.eta}</Text>
                  </View>
                </View>

                <View style={styles.patientBanner}>
                  <Text style={styles.patTitle}>{alertItem.patient}</Text>
                  <Text style={styles.patCondition}>{alertItem.condition}</Text>
                  <Text style={styles.patVitals}>Telemetry: {alertItem.vitalStats}</Text>
                </View>

                <View style={styles.prepBox}>
                  <Ionicons name="medkit-outline" size={16} color="#0369A1" />
                  <Text style={styles.prepText}>Preparation: {alertItem.prepNeeded}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.reserveBtn, isReserved && styles.reserveBtnDone]}
                  onPress={() => handleReserveBay(alertItem.id)}
                  disabled={isReserved}>
                  <Ionicons
                    name={isReserved ? 'checkmark-circle' : 'bed-outline'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.reserveBtnText}>
                    {isReserved ? 'Trauma Bay Prepped & Reserved' : 'Acknowledge & Reserve Trauma Bay'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  hospTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  hospSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  hotlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  hotlineText: {
    fontSize: 12,
    color: '#991B1B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 4,
  },
  capacityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  capacityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  capacityTop: {
    alignItems: 'center',
    gap: 2,
  },
  capacityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  capacityBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  capacityBadgeText: {
    fontSize: 9,
    color: '#64748B',
  },
  capacityValue: {
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  adjustBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  patientBanner: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    gap: 2,
  },
  patTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  patCondition: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  patVitals: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  prepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 6,
  },
  prepText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
  },
  reserveBtnDone: {
    backgroundColor: '#059669',
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
