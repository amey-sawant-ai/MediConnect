import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { getRoleBadgeDetails } from '@/utils/roleRedirect';
import { HealthcareColors } from '@/constants/theme';

export const DashboardHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { user, role, logout, switchDemoRole, triggerEmergencySos } = useAuth();
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosActiveData, setSosActiveData] = useState<{ dispatchId: string; eta: number } | null>(null);

  if (!user || !role) return null;

  const roleBadge = getRoleBadgeDetails(role);
  const rolesList: UserRole[] = [
    'patient',
    'doctor',
    'hospital',
    'ambulance',
    'blood_bank',
  ];

  const handleSosTrigger = (type: string) => {
    const res = triggerEmergencySos(type);
    setSosActiveData({ dispatchId: res.dispatchId, eta: res.etaMinutes });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="medical" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>HealthConnect</Text>
            <Text style={styles.brandSubtitle}>Emergency Healthcare</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {/* Emergency SOS Shortcut */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setSosModalVisible(true)}
            activeOpacity={0.8}>
            <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          {/* Quick Role Switcher Button */}
          <TouchableOpacity
            style={[styles.roleButton, { borderColor: roleBadge.color }]}
            onPress={() => setRoleModalVisible(true)}
            activeOpacity={0.8}>
            <Ionicons name={roleBadge.icon as any} size={14} color={roleBadge.color} />
            <Text style={[styles.roleButtonText, { color: roleBadge.color }]}>
              {roleBadge.label}
            </Text>
            <Ionicons name="chevron-down" size={12} color={roleBadge.color} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            accessibilityLabel="Log Out">
            <Ionicons name="log-out-outline" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.dashboardTitle}>{title}</Text>
          <Text style={styles.welcomeText}>
            Logged in as <Text style={styles.userName}>{user.fullName}</Text>
          </Text>
        </View>
      )}

      {/* Role Switcher Modal */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Switch Dashboard View</Text>
                <Text style={styles.modalSubtitle}>Preview experience across all 7 user roles</Text>
              </View>
              <TouchableOpacity onPress={() => setRoleModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.rolesList}>
              {rolesList.map((r) => {
                const info = getRoleBadgeDetails(r);
                const isSelected = r === role;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleItem,
                      isSelected && { borderColor: info.color, backgroundColor: '#F8FAFC' },
                    ]}
                    onPress={() => {
                      setRoleModalVisible(false);
                      switchDemoRole(r);
                    }}>
                    <View style={[styles.roleItemIcon, { backgroundColor: info.color + '15' }]}>
                      <Ionicons name={info.icon as any} size={18} color={info.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roleItemTitle}>{info.label}</Text>
                      <Text style={styles.roleItemDesc}>
                        View {info.label.toLowerCase()} portal & controls
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={info.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Emergency SOS Modal */}
      <Modal
        visible={sosModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSosModalVisible(false);
          setSosActiveData(null);
        }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sosCard}>
            <View style={styles.sosHeader}>
              <Ionicons name="warning" size={32} color="#DC2626" />
              <Text style={styles.sosCardTitle}>Emergency SOS Trigger</Text>
              <Text style={styles.sosCardDesc}>
                Instant dispatch connects to nearest ambulance & hospital ER
              </Text>
            </View>

            {!sosActiveData ? (
              <View style={styles.triageOptions}>
                <Text style={styles.triageLabel}>Select Emergency Type:</Text>
                {[
                  { label: 'Cardiac Arrest / Chest Pain', icon: 'heart' },
                  { label: 'Road Accident / Major Trauma', icon: 'car-sport' },
                  { label: 'Severe Bleeding / Hemorrhage', icon: 'water' },
                  { label: 'Respiratory Distress', icon: 'fitness' },
                  { label: 'Unconscious / Stroke', icon: 'medical' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.triageButton}
                    onPress={() => handleSosTrigger(item.label)}>
                    <Ionicons name={item.icon as any} size={18} color="#DC2626" />
                    <Text style={styles.triageButtonText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#DC2626" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.sosSuccessBox}>
                <View style={styles.sosBeacon}>
                  <Ionicons name="radio" size={40} color="#10B981" />
                  <Text style={styles.sosSuccessTitle}>Ambulance Dispatched!</Text>
                </View>
                <View style={styles.sosMetricRow}>
                  <View style={styles.sosMetric}>
                    <Text style={styles.sosMetricLabel}>Dispatch ID</Text>
                    <Text style={styles.sosMetricValue}>{sosActiveData.dispatchId}</Text>
                  </View>
                  <View style={styles.sosMetric}>
                    <Text style={styles.sosMetricLabel}>Estimated ETA</Text>
                    <Text style={[styles.sosMetricValue, { color: '#DC2626' }]}>
                      {sosActiveData.eta} mins
                    </Text>
                  </View>
                </View>
                <Text style={styles.sosSuccessNote}>
                  Live GPS telemetry transmitted. Hospital ER informed.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeSosButton}
              onPress={() => {
                setSosModalVisible(false);
                setSosActiveData(null);
              }}>
              <Text style={styles.closeSosText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: HealthcareColors.emergencyRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  titleContainer: {
    marginTop: 12,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  userName: {
    fontWeight: '600',
    color: '#0F172A',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 460,
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rolesList: {
    maxHeight: 380,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  roleItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  roleItemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 440,
    padding: 20,
    alignItems: 'center',
  },
  sosHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sosCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 8,
  },
  sosCardDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  triageOptions: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  triageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  triageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  triageButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  sosSuccessBox: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  sosBeacon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sosSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 6,
  },
  sosMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1FAE5',
  },
  sosMetric: {
    alignItems: 'center',
  },
  sosMetricLabel: {
    fontSize: 11,
    color: '#047857',
  },
  sosMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 2,
  },
  sosSuccessNote: {
    fontSize: 11,
    color: '#047857',
    textAlign: 'center',
  },
  closeSosButton: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeSosText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
