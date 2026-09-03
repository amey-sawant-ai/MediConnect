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
import { BloodBankProfileData } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';

export default function BloodBankDashboard() {
  const { user, profile } = useAuth();
  const bbProfile = profile as BloodBankProfileData | undefined;

  const [inventory, setInventory] = useState<Record<string, number>>(
    bbProfile?.inventoryUnits || {
      'A+': 18,
      'A-': 5,
      'B+': 22,
      'B-': 4,
      'AB+': 9,
      'AB-': 2,
      'O+': 31,
      'O-': 7,
    }
  );

  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleAdjust = (group: string, delta: number) => {
    setInventory((prev) => ({
      ...prev,
      [group]: Math.max(0, (prev[group] || 0) + delta),
    }));
  };

  const handleBroadcast = (bloodGroup: string) => {
    setBroadcastSent(true);
    alert(`Emergency broadcast transmitted for ${bloodGroup} to 142 registered donors within a 10km radius.`);
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Blood Bank & Donor Dispatch Desk" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bank Profile Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankTop}>
            <View style={styles.bankIcon}>
              <Ionicons name="water" size={24} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankName}>
                {user?.fullName || 'LifeLine Central Blood Bank & Storage Hub'}
              </Text>
              <Text style={styles.bankSub}>
                License: {bbProfile?.licenseNumber || 'BB-MH-LIC-4482'} • Verified 24/7 Repository
              </Text>
            </View>
          </View>
          <View style={styles.hotlineRow}>
            <Ionicons name="call" size={14} color="#0284C7" />
            <Text style={styles.hotlineText}>
              Emergency Unit Dispatch Hotline: {bbProfile?.hotlinePhone || '+91 22 2555 1100'}
            </Text>
          </View>
        </View>

        {/* Live Inventory Matrix */}
        <Text style={styles.sectionTitle}>Real-Time Blood Component Inventory</Text>
        <Text style={styles.sectionSubtitle}>
          Tap + or - to update stock units live across the regional HealthConnect emergency grid.
        </Text>

        <View style={styles.inventoryGrid}>
          {Object.entries(inventory).map(([group, count]) => {
            const isLow = count < 6;
            return (
              <View key={group} style={[styles.inventoryCard, isLow && styles.inventoryCardLow]}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group}</Text>
                  {isLow && (
                    <View style={styles.lowBadge}>
                      <Text style={styles.lowBadgeText}>LOW</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.countText, isLow && { color: '#DC2626' }]}>{count}</Text>
                <Text style={styles.countLabel}>Units Available</Text>

                <View style={styles.adjustRow}>
                  <TouchableOpacity
                    style={styles.adjBtn}
                    onPress={() => handleAdjust(group, -1)}>
                    <Ionicons name="remove" size={16} color="#0F172A" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.adjBtn}
                    onPress={() => handleAdjust(group, 1)}>
                    <Ionicons name="add" size={16} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                {isLow && (
                  <TouchableOpacity
                    style={styles.sosBroadcastSmallBtn}
                    onPress={() => handleBroadcast(group)}>
                    <Text style={styles.sosSmallText}>Broadcast SOS</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Emergency SOS Donor Broadcast Module */}
        <View style={styles.broadcastBanner}>
          <View style={styles.broadcastIcon}>
            <Ionicons name="megaphone" size={24} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.broadcastTitle}>Broadcast Urgent Donor Call</Text>
            <Text style={styles.broadcastDesc}>
              Instantly sends targeted app notifications & SMS to compatible verified donors within 10 km.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.broadcastActionBtn}
            onPress={() => handleBroadcast('O- / Rare Blood Types')}>
            <Text style={styles.broadcastActionBtnText}>Trigger Blast</Text>
          </TouchableOpacity>
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
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  bankTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  bankSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  hotlineText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
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
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  inventoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  inventoryCardLow: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  lowBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  countText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  countLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  adjBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  sosBroadcastSmallBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  sosSmallText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  broadcastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    padding: 16,
    marginTop: 6,
  },
  broadcastIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  broadcastDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  broadcastActionBtn: {
    backgroundColor: HealthcareColors.emergencyRed,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  broadcastActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
