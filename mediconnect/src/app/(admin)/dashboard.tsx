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

export default function AdminDashboard() {
  const { user } = useAuth();

  const [verificationQueue, setVerificationQueue] = useState([
    {
      id: 'ver_01',
      name: 'Dr. Sameer Kulkarni, MD',
      role: 'Doctor',
      license: 'MCI-2019-77218',
      docType: 'Medical Council Board Certificate',
      date: 'Today, 10:14 AM',
    },
    {
      id: 'ver_02',
      name: 'LifeCare Apex Trauma Center',
      role: 'Hospital',
      license: 'HOSP-MUM-8891',
      docType: 'Municipal Health Directorate License',
      date: 'Today, 09:30 AM',
    },
    {
      id: 'ver_03',
      name: 'Apex Emergency Ambulance Unit 04',
      role: 'Ambulance',
      license: 'AMB-REG-MH02-441',
      docType: 'EMS Fleet & Equipment Permit',
      date: 'Yesterday',
    },
  ]);

  const handleApprove = (id: string, name: string) => {
    setVerificationQueue((prev) => prev.filter((item) => item.id !== id));
    alert(`Verified & Approved credentials for ${name}! Account status set to ACTIVE.`);
  };

  const handleReject = (id: string, name: string) => {
    setVerificationQueue((prev) => prev.filter((item) => item.id !== id));
    alert(`Flagged credentials for ${name} as pending revision.`);
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="HealthConnect System Administration" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* System Health & Telemetry Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={20} color="#0284C7" />
            <Text style={styles.statVal}>12,480</Text>
            <Text style={styles.statLabel}>Registered Citizens</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="car-sport" size={20} color="#F59E0B" />
            <Text style={[styles.statVal, { color: '#D97706' }]}>84</Text>
            <Text style={styles.statLabel}>Active Ambulances</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bed" size={20} color="#059669" />
            <Text style={[styles.statVal, { color: '#059669' }]}>312</Text>
            <Text style={styles.statLabel}>Open ICU Beds</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={[styles.statVal, { color: '#DC2626' }]}>168</Text>
            <Text style={styles.statLabel}>SOS Calls Today</Text>
          </View>
        </View>

        {/* Verification Review Queue */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Healthcare License Verification Queue</Text>
            <Text style={styles.sectionSubtitle}>
              Mandatory verification of medical registrations before live platform activation.
            </Text>
          </View>
          <View style={styles.queueBadge}>
            <Text style={styles.queueBadgeText}>{verificationQueue.length} Pending</Text>
          </View>
        </View>

        {verificationQueue.length > 0 ? (
          <View style={styles.queueList}>
            {verificationQueue.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View>
                    <Text style={styles.applicantName}>{item.name}</Text>
                    <Text style={styles.applicantRole}>
                      Role: <Text style={{ fontWeight: '700' }}>{item.role}</Text> • License: {item.license}
                    </Text>
                    <Text style={styles.docInfo}>Document: {item.docType}</Text>
                  </View>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item.id, item.name)}>
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.id, item.name)}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.approveBtnText}>Approve & Activate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyQueue}>
            <Ionicons name="checkmark-done-circle" size={40} color="#059669" />
            <Text style={styles.emptyTitle}>Verification Queue Clear</Text>
            <Text style={styles.emptySub}>All professional licenses have been reviewed.</Text>
          </View>
        )}

        {/* Security & Audit Telemetry */}
        <Text style={styles.sectionTitle}>Real-Time Security & Audit Trail</Text>
        <View style={styles.auditList}>
          {[
            { log: 'Ambulance Unit-07 dispatched to Sector 15 incident', time: '2 mins ago', type: 'dispatch' },
            { log: 'Metro Hospital updated ICU capacity: 6 free', time: '9 mins ago', type: 'capacity' },
            { log: 'Emergency Donor Broadcast issued for O- (142 notified)', time: '18 mins ago', type: 'broadcast' },
            { log: 'Dr. Sen authenticated via OTP session from clinical IP', time: '35 mins ago', type: 'auth' },
          ].map((audit, idx) => (
            <View key={idx} style={styles.auditItem}>
              <Ionicons name="shield" size={14} color="#0284C7" />
              <Text style={styles.auditText}>{audit.log}</Text>
              <Text style={styles.auditTime}>{audit.time}</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  queueBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  queueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  queueList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  applicantRole: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  docInfo: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#059669',
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyQueue: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
  },
  auditList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  auditText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
  },
  auditTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
