import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DoctorProfileData } from '@/types/auth';

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const docProfile = profile as DoctorProfileData | undefined;

  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const [triageQueue, setTriageQueue] = useState([
    {
      id: 'req_001',
      patient: 'Ramesh Gupta',
      age: 54,
      condition: 'Acute Chest Tightness & Diaphoresis',
      triageLevel: 'RED (Immediate)',
      vitals: 'BP: 155/95 • HR: 112 bpm • SpO2: 94%',
      waitTime: '2 mins ago',
      allergies: 'Aspirin',
    },
    {
      id: 'req_002',
      patient: 'Meera Nair',
      age: 29,
      condition: 'Severe Allergic Reaction / Urticaria',
      triageLevel: 'YELLOW (Urgent)',
      vitals: 'BP: 120/80 • HR: 88 bpm • SpO2: 98%',
      waitTime: '7 mins ago',
      allergies: 'Latex, Shellfish',
    },
    {
      id: 'req_003',
      patient: 'Arjun Verma',
      age: 41,
      condition: 'Post-Trauma Limb Immobilization Check',
      triageLevel: 'GREEN (Standard)',
      vitals: 'BP: 128/82 • HR: 76 bpm • SpO2: 99%',
      waitTime: '14 mins ago',
      allergies: 'None',
    },
  ]);

  const handleAcceptCall = (patientName: string) => {
    alert(`Connecting secure encrypted video consultation with ${patientName}...`);
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Doctor Clinical Triage Desk" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Doctor Identity & Status Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarBadge}>
              <Ionicons name="medical" size={24} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.docName}>{user?.fullName || 'Dr. Ananya Sen, MD'}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.verifiedText}>Verified MD</Text>
                </View>
              </View>
              <Text style={styles.docReg}>
                Reg #: {docProfile?.medicalRegNumber || 'MCI-2015-84920'} • {docProfile?.specialization || 'Emergency Trauma & Cardiology'}
              </Text>
            </View>
          </View>

          <View style={styles.statusToggleRow}>
            <View>
              <Text style={styles.statusLabel}>Tele-Triage Availability</Text>
              <Text style={styles.statusSub}>
                {isAvailable ? '🟢 Online & accepting emergency cases' : '⚪ Offline / In Operation'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#CBD5E1', true: '#C4B5FD' }}
              thumbColor={isAvailable ? '#8B5CF6' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Clinical Statistics Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>18</Text>
            <Text style={styles.statLabel}>Triaged Today</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#DC2626' }]}>3</Text>
            <Text style={styles.statLabel}>Pending Critical</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#059669' }]}>4.9 ★</Text>
            <Text style={styles.statLabel}>Review Rating</Text>
          </View>
        </View>

        {/* Incoming Patient Triage Queue */}
        <Text style={styles.sectionTitle}>Incoming Emergency Triage Queue</Text>
        <Text style={styles.sectionSubtitle}>
          Real-time intake queue forwarded from paramedics and emergency dispatchers.
        </Text>

        <View style={styles.queueList}>
          {triageQueue.map((item) => {
            const isRed = item.triageLevel.includes('RED');
            return (
              <View key={item.id} style={[styles.triageCard, isRed && styles.triageCardRed]}>
                <View style={styles.triageCardTop}>
                  <View>
                    <Text style={styles.patientName}>{item.patient}, {item.age}y</Text>
                    <Text style={styles.patientCondition}>{item.condition}</Text>
                  </View>
                  <View style={[styles.triageBadge, isRed ? styles.badgeRed : styles.badgeYellow]}>
                    <Text style={[styles.triageBadgeText, isRed ? styles.badgeTextRed : styles.badgeTextYellow]}>
                      {item.triageLevel}
                    </Text>
                  </View>
                </View>

                <View style={styles.vitalsBox}>
                  <Ionicons name="pulse-outline" size={16} color="#0284C7" />
                  <Text style={styles.vitalsText}>{item.vitals}</Text>
                </View>

                <View style={styles.triageFooter}>
                  <Text style={styles.allergyText}>
                    Allergies: <Text style={{ fontWeight: '700' }}>{item.allergies}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.connectBtn}
                    onPress={() => handleAcceptCall(item.patient)}>
                    <Ionicons name="videocam" size={14} color="#FFFFFF" />
                    <Text style={styles.connectBtnText}>Accept Consultation</Text>
                  </TouchableOpacity>
                </View>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  docReg: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  statusSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 4,
  },
  queueList: {
    gap: 10,
  },
  triageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  triageCardRed: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  triageCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  patientCondition: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  triageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRed: {
    backgroundColor: '#FEF2F2',
  },
  badgeYellow: {
    backgroundColor: '#FEF3C7',
  },
  triageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextRed: {
    color: '#DC2626',
  },
  badgeTextYellow: {
    color: '#D97706',
  },
  vitalsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  vitalsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  triageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  allergyText: {
    fontSize: 11,
    color: '#64748B',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
