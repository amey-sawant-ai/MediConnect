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
import {
  SYNTHEA_DONORS_DATASET,
  SyntheaDonorRecord,
  summonSyntheaDonor,
} from '@/services/syntheaBloodService';
import { BloodGroup } from '@/services/eRaktKoshService';

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
  const [selectedDonorFilter, setSelectedDonorFilter] = useState<BloodGroup | 'ALL'>('ALL');
  const [summonedDonors, setSummonedDonors] = useState<Record<string, boolean>>({});

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

  const handleSummon = (donor: SyntheaDonorRecord) => {
    const res = summonSyntheaDonor(donor, user?.fullName || 'LifeLine Blood Bank', donor.bloodGroup);
    setSummonedDonors((prev) => ({ ...prev, [donor.syntheaPatientId]: true }));
    alert(res.message);
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

        {/* Synthea Synthetic Patient Population Donor Network */}
        <View style={styles.syntheaHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Synthea Verified Donor Registry</Text>
            <Text style={styles.sectionSubtitle}>
              Clinical observations: LOINC 718-7 (Hemoglobin) & LOINC 777-3 (Platelets)
            </Text>
          </View>
          <View style={styles.syntheaBadge}>
            <Text style={styles.syntheaBadgeText}>FHIR Standards</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.donorFilterScroll}>
          {['ALL', 'O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((grp) => (
            <TouchableOpacity
              key={grp}
              style={[
                styles.donorFilterPill,
                selectedDonorFilter === grp && styles.donorFilterPillActive,
              ]}
              onPress={() => setSelectedDonorFilter(grp as any)}>
              <Text
                style={[
                  styles.donorFilterPillText,
                  selectedDonorFilter === grp && styles.donorFilterPillTextActive,
                ]}>
                {grp}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Donor Cards List */}
        <View style={styles.donorsList}>
          {SYNTHEA_DONORS_DATASET.filter(
            (d) => selectedDonorFilter === 'ALL' || d.bloodGroup === selectedDonorFilter
          ).map((donor) => {
            const isSummoned = summonedDonors[donor.syntheaPatientId];
            return (
              <View key={donor.syntheaPatientId} style={styles.donorCard}>
                <View style={styles.donorTop}>
                  <View style={styles.donorBloodBadge}>
                    <Text style={styles.donorBloodText}>{donor.bloodGroup}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.donorNameRow}>
                      <Text style={styles.donorName}>{donor.fullName}</Text>
                      <View style={styles.badgeLevelPill}>
                        <Text style={styles.badgeLevelText}>{donor.badgeLevel}</Text>
                      </View>
                    </View>
                    <Text style={styles.donorId}>
                      Synthea ID: {donor.syntheaPatientId} • {donor.distanceKm} km away
                    </Text>
                  </View>
                </View>

                {/* LOINC Clinical Observations */}
                <View style={styles.loincBox}>
                  <View style={styles.loincItem}>
                    <Text style={styles.loincLabel}>Hemoglobin (LOINC 718-7)</Text>
                    <Text style={styles.loincVal}>{donor.loincObservations.hemoglobinGdl} g/dL</Text>
                  </View>
                  <View style={styles.loincDivider} />
                  <View style={styles.loincItem}>
                    <Text style={styles.loincLabel}>Platelets (LOINC 777-3)</Text>
                    <Text style={styles.loincVal}>{donor.loincObservations.plateletCountK}k/µL</Text>
                  </View>
                  <View style={styles.loincDivider} />
                  <View style={styles.loincItem}>
                    <Text style={styles.loincLabel}>Status</Text>
                    <Text style={[styles.loincVal, { color: donor.isEligibleNow ? '#059669' : '#DC2626' }]}>
                      {donor.isEligibleNow ? 'Eligible' : 'Interval'}
                    </Text>
                  </View>
                </View>

                {/* Summon Button */}
                <TouchableOpacity
                  style={[
                    styles.summonBtn,
                    isSummoned && styles.summonBtnDone,
                    !donor.isEligibleNow && styles.summonBtnDisabled,
                  ]}
                  onPress={() => handleSummon(donor)}
                  disabled={isSummoned || !donor.isEligibleNow}>
                  <Ionicons
                    name={isSummoned ? 'checkmark-circle' : 'mail'}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.summonBtnText}>
                    {isSummoned
                      ? 'SMS & App Summon Dispatched'
                      : donor.isEligibleNow
                      ? `Summon ${donor.fullName} via SMS`
                      : donor.disqualificationReason || 'Currently Ineligible'}
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
  syntheaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  syntheaBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syntheaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  donorFilterScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  donorFilterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  donorFilterPillActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  donorFilterPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  donorFilterPillTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
  donorsList: {
    gap: 10,
    marginTop: 4,
  },
  donorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  donorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  donorBloodBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  donorBloodText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
  },
  donorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeLevelPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeLevelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  donorId: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  loincBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loincItem: {
    alignItems: 'center',
  },
  loincLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  loincVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  loincDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  summonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 10,
    borderRadius: 8,
  },
  summonBtnDone: {
    backgroundColor: '#059669',
  },
  summonBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  summonBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
