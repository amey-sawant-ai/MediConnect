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
import { ResponderProfileData } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';

export default function ResponderDashboard() {
  const { user, profile } = useAuth();
  const respProfile = profile as ResponderProfileData | undefined;

  const [isOnDuty, setIsOnDuty] = useState(true);

  const nearbyIncidents = [
    {
      id: 'inc_101',
      title: 'Pedestrian Hit by Vehicle',
      distance: '450 meters away',
      address: 'Junction of MG Road & Station Link',
      priority: 'HIGH PRIORITY',
      time: '1 min ago',
      reportedVitals: 'Severe limb hemorrhage, conscious',
      aedNearby: 'AED located at Metro Bank (80m)',
    },
    {
      id: 'inc_102',
      title: 'Elderly Collapse / Unresponsive',
      distance: '1.2 km away',
      address: 'Central Park East Gate, Promenade',
      priority: 'CRITICAL',
      time: '4 mins ago',
      reportedVitals: 'No pulse confirmed by bystander',
      aedNearby: 'AED at Park Security Kiosk (30m)',
    },
  ];

  return (
    <View style={styles.container}>
      <DashboardHeader title="First Responder Field Console" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Responder Badge Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.badgeIconBox}>
              <Ionicons name="flash" size={24} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.responderName}>{user?.fullName || 'Kavita Deshmukh'}</Text>
              <Text style={styles.badgeId}>
                Badge: {respProfile?.badgeOrResponderId || 'EMT-PARAMEDIC-4019'} • {respProfile?.responderRole || 'Senior Paramedic'}
              </Text>
              <Text style={styles.certifications}>
                Certified: {((respProfile?.certifications || ['ACLS', 'PHTLS'])).join(' • ')}
              </Text>
            </View>
          </View>

          <View style={styles.dutyRow}>
            <View>
              <Text style={styles.dutyLabel}>Field Duty Beacon</Text>
              <Text style={styles.dutySub}>
                {isOnDuty ? '🟢 Active & receiving on-scene dispatch pings' : '⚪ Off-duty'}
              </Text>
            </View>
            <Switch
              value={isOnDuty}
              onValueChange={setIsOnDuty}
              trackColor={{ false: '#CBD5E1', true: '#FECACA' }}
              thumbColor={isOnDuty ? HealthcareColors.emergencyRed : '#94A3B8'}
            />
          </View>
        </View>

        {/* Nearby Incidents Radar */}
        <Text style={styles.sectionTitle}>Nearby Incidents Awaiting First Responder</Text>
        <Text style={styles.sectionSubtitle}>
          Incidents within immediate running distance where early CPR/defibrillation saves lives.
        </Text>

        <View style={styles.incidentList}>
          {nearbyIncidents.map((inc) => (
            <View key={inc.id} style={styles.incidentCard}>
              <View style={styles.incTop}>
                <View style={styles.priorityBadge}>
                  <Ionicons name="warning" size={14} color="#DC2626" />
                  <Text style={styles.priorityText}>{inc.priority}</Text>
                </View>
                <Text style={styles.incTime}>{inc.time}</Text>
              </View>

              <Text style={styles.incTitle}>{inc.title}</Text>
              <Text style={styles.incAddress}>{inc.address} ({inc.distance})</Text>

              <View style={styles.aedBanner}>
                <Ionicons name="hardware-chip" size={16} color="#059669" />
                <Text style={styles.aedText}>{inc.aedNearby}</Text>
              </View>

              <View style={styles.incActions}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => alert(`Accepted incident ${inc.title}. Dispatch and victim bystander notified of your arrival.`)}>
                  <Ionicons name="walk" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptBtnText}>Respond to Scene ({inc.distance})</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Rapid Trauma Stabilization Protocols */}
        <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Field Intervention Protocols</Text>
        <View style={styles.protocolsGrid}>
          {[
            { title: 'Severe Hemorrhage / Tourniquet', steps: 'Apply 2-3 inches above wound. Twist windlass until bleeding stops.' },
            { title: 'Defibrillator (AED) Shock Guide', steps: 'Expose chest. Dry skin. Place pads (Upper Right, Lower Left). Clear!' },
            { title: 'Airway & Recovery Position', steps: 'Head-tilt chin-lift. If unconscious with pulse, roll onto left lateral side.' },
          ].map((proto) => (
            <View key={proto.title} style={styles.protocolCard}>
              <Text style={styles.protoTitle}>{proto.title}</Text>
              <Text style={styles.protoSteps}>{proto.steps}</Text>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  responderName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeId: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  certifications: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
  },
  dutyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dutyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dutySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  incidentList: {
    gap: 12,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 8,
  },
  incTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  incTime: {
    fontSize: 11,
    color: '#64748B',
  },
  incTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  incAddress: {
    fontSize: 12,
    color: '#64748B',
  },
  aedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  aedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  incActions: {
    marginTop: 4,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  protocolsGrid: {
    gap: 8,
  },
  protocolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  protoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  protoSteps: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
});
