import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PatientProfileData } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';
import { buildPatientQrPayload } from '@/services/qrCodeService';

export default function PatientDashboard() {
  const { user, profile, triggerEmergencySos } = useAuth();
  const patientProfile = profile as PatientProfileData | undefined;

  const [activeTab, setActiveTab] = useState<'home' | 'hospitals' | 'blood' | 'medical_pass'>('home');
  const [selectedBloodSearch, setSelectedBloodSearch] = useState<string>('O+');
  const [cprRunning, setCprRunning] = useState<boolean>(false);
  const [cprCount, setCprCount] = useState<number>(0);

  const [sosModalVisible, setSosModalVisible] = useState<boolean>(false);
  const [sosActiveData, setSosActiveData] = useState<{ dispatchId: string; eta: number; type: string } | null>(null);

  const handleTriggerSos = (type: string = 'Critical Emergency Request') => {
    const res = triggerEmergencySos(type);
    setSosActiveData({ dispatchId: res.dispatchId, eta: res.etaMinutes, type });
    setSosModalVisible(true);
  };

  // Mock nearby hospitals
  const hospitals = [
    {
      name: 'Metro City Trauma & General Hospital',
      distance: '1.2 km',
      icuBeds: 6,
      ventilators: 4,
      erWaitTime: '8 mins',
      hotline: '022-2400-9999',
      hasCathLab: true,
    },
    {
      name: 'Lilavati Emergency Care & Heart Institute',
      distance: '3.4 km',
      icuBeds: 2,
      ventilators: 1,
      erWaitTime: '15 mins',
      hotline: '022-2675-1000',
      hasCathLab: true,
    },
    {
      name: 'Apollo Speciality ER Center',
      distance: '4.8 km',
      icuBeds: 8,
      ventilators: 5,
      erWaitTime: '5 mins',
      hotline: '022-3350-3350',
      hasCathLab: true,
    },
  ];

  // Mock blood bank stocks
  const bloodStocks: Record<string, { units: number; bank: string; dist: string }> = {
    'A+': { units: 18, bank: 'LifeLine Central Hub', dist: '2.1 km' },
    'A-': { units: 5, bank: 'Rotary Blood Bank', dist: '3.8 km' },
    'B+': { units: 24, bank: 'LifeLine Central Hub', dist: '2.1 km' },
    'B-': { units: 4, bank: 'Red Cross Depot', dist: '5.2 km' },
    'AB+': { units: 9, bank: 'City Blood Bank', dist: '4.1 km' },
    'AB-': { units: 2, bank: 'Rotary Blood Bank', dist: '3.8 km' },
    'O+': { units: 31, bank: 'LifeLine Central Hub', dist: '2.1 km' },
    'O-': { units: 7, bank: 'National Reserve Hub', dist: '6.0 km' },
  };

  const toggleCpr = () => {
    if (cprRunning) {
      setCprRunning(false);
    } else {
      setCprRunning(true);
      setCprCount(1);
    }
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Patient Emergency Desk" />

      {/* Navigation Segment Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'home', label: 'Overview', icon: 'shield-outline' },
          { key: 'hospitals', label: 'Nearby Hospitals', icon: 'business-outline' },
          { key: 'blood', label: 'Blood Hub', icon: 'water-outline' },
          { key: 'medical_pass', label: 'Medical QR Pass', icon: 'qr-code-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key as any)}>
            <Ionicons
              name={tab.icon as any}
              size={15}
              color={activeTab === tab.key ? HealthcareColors.emergencyRed : '#64748B'}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab.key && styles.tabBtnTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= VIEW 1: HOME OVERVIEW ================= */}
        {activeTab === 'home' && (
          <View style={styles.sectionArea}>
            {/* BIG PROMINENT EMERGENCY SOS HERO CARD */}
            <View style={styles.heroSosCard}>
              <View style={styles.heroSosBadgeRow}>
                <View style={styles.heroSosPulseDot} />
                <Text style={styles.heroSosBadgeText}>24/7 IMMEDIATE EMERGENCY DISPATCH</Text>
              </View>

              <Text style={styles.heroSosTitle}>EMERGENCY SOS</Text>
              <Text style={styles.heroSosDesc}>
                Press the big button below for instant 1-tap emergency dispatch & alert
              </Text>

              {/* GIANT CENTERED SOS BUTTON */}
              <TouchableOpacity
                style={styles.heroSosButtonOuter}
                activeOpacity={0.8}
                onPress={() => handleTriggerSos('Critical Life Emergency')}>
                <View style={styles.heroSosButtonInner}>
                  <Ionicons name="alert-circle" size={46} color="#FFFFFF" />
                  <Text style={styles.heroSosButtonText}>SOS</Text>
                  <Text style={styles.heroSosButtonSub}>TAP FOR HELP</Text>
                </View>
              </TouchableOpacity>

              {/* QUICK TRIAGE SELECTORS */}
              <Text style={styles.quickSosLabel}>Quick Emergency Triggers:</Text>
              <View style={styles.quickSosGrid}>
                {[
                  { label: 'Cardiac Arrest / Chest Pain', icon: 'heart' },
                  { label: 'Road Accident / Trauma', icon: 'car-sport' },
                  { label: 'Severe Breathing Trouble', icon: 'fitness' },
                  { label: 'Unconscious / Stroke', icon: 'medical' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.quickSosChip}
                    onPress={() => handleTriggerSos(item.label)}>
                    <Ionicons name={item.icon as any} size={14} color="#DC2626" />
                    <Text style={styles.quickSosChipText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vital Emergency Card */}
            <View style={styles.vitalsBanner}>
              <View style={styles.vitalsHeader}>
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodBadgeText}>{patientProfile?.bloodGroup || 'O+'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vitalsName}>{user?.fullName}</Text>
                  <Text style={styles.vitalsSub}>
                    ICE: {patientProfile?.emergencyContact?.name || 'Anita Sharma'} (
                    {patientProfile?.emergencyContact?.phoneNumber || '+91 98765 43211'})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.qrShortcutBtn}
                  onPress={() => setActiveTab('medical_pass')}>
                  <Ionicons name="qr-code" size={20} color="#0284C7" />
                </TouchableOpacity>
              </View>

              <View style={styles.tagsRow}>
                <View style={styles.tagAlert}>
                  <Text style={styles.tagAlertText}>
                    Allergies: {(patientProfile?.allergies || ['Penicillin']).join(', ')}
                  </Text>
                </View>
                <View style={styles.tagInfo}>
                  <Text style={styles.tagInfoText}>
                    Conditions: {(patientProfile?.existingConditions || ['Mild Asthma']).join(', ')}
                  </Text>
                </View>
              </View>
            </View>

            {/* CPR Audio & Visual Assistant */}
            <View style={styles.card}>
              <View style={styles.cprHeader}>
                <View style={styles.cprIconBox}>
                  <Ionicons name="heart-circle" size={26} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cprTitle}>AI First-Aid: CPR Beat Guide</Text>
                  <Text style={styles.cprSub}>100–120 compressions/minute rhythm assistance</Text>
                </View>
                <TouchableOpacity
                  style={[styles.cprStartBtn, cprRunning && { backgroundColor: '#DC2626' }]}
                  onPress={toggleCpr}>
                  <Ionicons name={cprRunning ? 'stop' : 'play'} size={14} color="#FFFFFF" />
                  <Text style={styles.cprStartBtnText}>{cprRunning ? 'Stop' : 'Start CPR'}</Text>
                </TouchableOpacity>
              </View>

              {cprRunning && (
                <View style={styles.cprActiveBox}>
                  <Text style={styles.cprPulseText}>Push hard & fast in center of chest</Text>
                  <Text style={styles.cprRate}>Target: 100-120 BPM • 2 Inches Deep</Text>
                </View>
              )}
            </View>

            {/* Quick Access Matrix */}
            <Text style={styles.sectionTitle}>Nearest Emergency Facilities</Text>
            {hospitals.slice(0, 2).map((hosp) => (
              <View key={hosp.name} style={styles.facilityCard}>
                <View style={styles.facilityTop}>
                  <Text style={styles.facilityName}>{hosp.name}</Text>
                  <Text style={styles.facilityDist}>{hosp.distance}</Text>
                </View>
                <View style={styles.facilityMetrics}>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>ICU Beds</Text>
                    <Text style={styles.metricValGreen}>{hosp.icuBeds} Free</Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>Ventilators</Text>
                    <Text style={styles.metricValGreen}>{hosp.ventilators} Free</Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>Casualty Wait</Text>
                    <Text style={styles.metricVal}>{hosp.erWaitTime}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= VIEW 2: HOSPITALS ================= */}
        {activeTab === 'hospitals' && (
          <View style={styles.sectionArea}>
            <Text style={styles.sectionTitle}>Live Hospital Bed & ICU Matrix</Text>
            <Text style={styles.sectionSubtitle}>
              Real-time available capacity reported directly by emergency casualty departments.
            </Text>

            {hospitals.map((hosp) => (
              <View key={hosp.name} style={styles.hospFullCard}>
                <View style={styles.facilityTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.facilityName}>{hosp.name}</Text>
                    <Text style={styles.hospAddress}>Distance: {hosp.distance} • Cath Lab 24/7</Text>
                  </View>
                  <View style={styles.distBadge}>
                    <Ionicons name="navigate-outline" size={12} color="#0284C7" />
                    <Text style={styles.distBadgeText}>{hosp.distance}</Text>
                  </View>
                </View>

                <View style={styles.facilityMetrics}>
                  <View style={styles.hospMetricBox}>
                    <Text style={styles.metricLabel}>Available ICU</Text>
                    <Text style={styles.hospMetricVal}>{hosp.icuBeds}</Text>
                  </View>
                  <View style={styles.hospMetricBox}>
                    <Text style={styles.metricLabel}>Ventilators</Text>
                    <Text style={styles.hospMetricVal}>{hosp.ventilators}</Text>
                  </View>
                  <View style={styles.hospMetricBox}>
                    <Text style={styles.metricLabel}>Casualty Wait</Text>
                    <Text style={[styles.hospMetricVal, { color: '#DC2626' }]}>{hosp.erWaitTime}</Text>
                  </View>
                </View>

                <View style={styles.hospActions}>
                  <TouchableOpacity
                    style={styles.callErBtn}
                    onPress={() => alert(`Calling Casualty Hotline: ${hosp.hotline}`)}>
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.callErBtnText}>Call Emergency: {hosp.hotline}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= VIEW 3: BLOOD HUB ================= */}
        {activeTab === 'blood' && (
          <View style={styles.sectionArea}>
            <Text style={styles.sectionTitle}>Blood Resource & Bank Locator</Text>
            <Text style={styles.sectionSubtitle}>
              Check real-time stock levels across regional certified blood repositories.
            </Text>

            <View style={styles.bloodPickerRow}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodSelectBtn,
                    selectedBloodSearch === bg && styles.bloodSelectBtnActive,
                  ]}
                  onPress={() => setSelectedBloodSearch(bg)}>
                  <Text
                    style={[
                      styles.bloodSelectText,
                      selectedBloodSearch === bg && styles.bloodSelectTextActive,
                    ]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.bloodResultCard}>
              <View style={styles.bloodStockHeader}>
                <View style={styles.bloodDropIcon}>
                  <Ionicons name="water" size={28} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bloodResultTitle}>
                    {selectedBloodSearch} Stock Availability
                  </Text>
                  <Text style={styles.bloodResultSub}>
                    {bloodStocks[selectedBloodSearch]?.bank || 'LifeLine Blood Bank'}
                  </Text>
                </View>
                <View style={styles.unitsBadge}>
                  <Text style={styles.unitsVal}>
                    {bloodStocks[selectedBloodSearch]?.units || 0}
                  </Text>
                  <Text style={styles.unitsLabel}>Units Free</Text>
                </View>
              </View>

              <View style={styles.bloodMetaRow}>
                <Text style={styles.bloodMetaText}>
                  Location: {bloodStocks[selectedBloodSearch]?.dist || '2.5 km'} away • Verified 10 mins ago
                </Text>
              </View>

              <TouchableOpacity
                style={styles.requestBloodBtn}
                onPress={() => alert(`Request for ${selectedBloodSearch} transmitted to blood bank & verified local donors.`)}>
                <Ionicons name="megaphone" size={16} color="#FFFFFF" />
                <Text style={styles.requestBloodBtnText}>Broadcast Emergency Donor Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= VIEW 4: MEDICAL QR PASS ================= */}
        {activeTab === 'medical_pass' && (
          <View style={styles.sectionArea}>
            <Text style={styles.sectionTitle}>Permanent Digital Medical Pass</Text>
            <Text style={styles.sectionSubtitle}>
              Your unique QR pass automatically resolves your live updated emergency profile when scanned.
            </Text>

            <View style={styles.qrCard}>
              <View style={styles.qrVisualBox}>
                {user && patientProfile ? (
                  <View style={styles.qrContainerBox}>
                    <QRCode
                      value={JSON.stringify(buildPatientQrPayload(user, patientProfile))}
                      size={170}
                      color="#0F172A"
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                ) : (
                  <Ionicons name="qr-code" size={140} color="#0F172A" />
                )}
                <Text style={styles.qrTokenText}>
                  UNIQUE PASS TOKEN: {patientProfile?.qrPassToken || 'qr_med_rahul_98765'}
                </Text>
              </View>

              <View style={styles.uniqueQrNoticeBox}>
                <Ionicons name="infinite" size={18} color="#0284C7" />
                <Text style={styles.uniqueQrNoticeText}>
                  <Text style={{ fontWeight: '800' }}>Single Persistent QR Pass:</Text> Even if you update your phone number, emergency contacts, or allergies in your profile, this exact same QR code will always display your <Text style={{ fontWeight: '800' }}>latest live records</Text> to doctors and first-responders.
                </Text>
              </View>

              <View style={styles.qrDetailsArea}>
                <View style={styles.qrRow}>
                  <Text style={styles.qrFieldLabel}>Patient Name</Text>
                  <Text style={styles.qrFieldValue}>{user?.fullName}</Text>
                </View>
                <View style={styles.qrRow}>
                  <Text style={styles.qrFieldLabel}>Blood Group</Text>
                  <Text style={[styles.qrFieldValue, { color: '#DC2626', fontWeight: '800' }]}>
                    {patientProfile?.bloodGroup || 'O+'}
                  </Text>
                </View>
                <View style={styles.qrRow}>
                  <Text style={styles.qrFieldLabel}>Known Allergies</Text>
                  <Text style={[styles.qrFieldValue, { color: '#B91C1C' }]}>
                    {(patientProfile?.allergies || ['Penicillin', 'Sulfa']).join(', ')}
                  </Text>
                </View>
                <View style={styles.qrRow}>
                  <Text style={styles.qrFieldLabel}>Chronic Illness</Text>
                  <Text style={styles.qrFieldValue}>
                    {(patientProfile?.existingConditions || ['Asthma', 'Hypertension']).join(', ')}
                  </Text>
                </View>
                <View style={styles.qrRow}>
                  <Text style={styles.qrFieldLabel}>In Case of Emergency (ICE)</Text>
                  <Text style={styles.qrFieldValue}>
                    {patientProfile?.emergencyContact?.name || 'Anita Sharma'} (
                    {patientProfile?.emergencyContact?.phoneNumber || '+91 98765 43211'})
                  </Text>
                </View>
              </View>

              <View style={styles.offlineNotice}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.offlineNoticeText}>
                  Encrypted & cached locally. First-responders can scan without cellular connection.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* EMERGENCY DISPATCH MODAL */}
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
              <Ionicons name="warning" size={36} color="#DC2626" />
              <Text style={styles.sosCardTitle}>Emergency SOS Transmitted</Text>
              <Text style={styles.sosCardDesc}>
                Target Category: <Text style={{ fontWeight: '700', color: '#DC2626' }}>{sosActiveData?.type}</Text>
              </Text>
            </View>

            <View style={styles.sosSuccessBox}>
              <View style={styles.sosBeacon}>
                <Ionicons name="radio" size={44} color="#10B981" />
                <Text style={styles.sosSuccessTitle}>Ambulance & ER Alerted!</Text>
              </View>
              <View style={styles.sosMetricRow}>
                <View style={styles.sosMetric}>
                  <Text style={styles.sosMetricLabel}>Dispatch ID</Text>
                  <Text style={styles.sosMetricValue}>{sosActiveData?.dispatchId}</Text>
                </View>
                <View style={styles.sosMetric}>
                  <Text style={styles.sosMetricLabel}>Estimated ETA</Text>
                  <Text style={[styles.sosMetricValue, { color: '#DC2626' }]}>
                    {sosActiveData?.eta} mins
                  </Text>
                </View>
              </View>
              <Text style={styles.sosSuccessNote}>
                GPS live stream established with central trauma command.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeSosButton}
              onPress={() => {
                setSosModalVisible(false);
                setSosActiveData(null);
              }}>
              <Text style={styles.closeSosText}>Acknowledge & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: HealthcareColors.emergencyRed,
  },
  tabBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: HealthcareColors.emergencyRed,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  sectionArea: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 4,
  },
  vitalsBanner: {
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
  vitalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bloodBadgeText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '800',
  },
  vitalsName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  vitalsSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  qrShortcutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tagAlert: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagAlertText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
  },
  tagInfo: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagInfoText: {
    fontSize: 11,
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cprHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cprIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cprTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cprSub: {
    fontSize: 11,
    color: '#64748B',
  },
  cprStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cprStartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cprActiveBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    alignItems: 'center',
  },
  cprPulseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  cprRate: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
  },
  facilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  facilityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  facilityDist: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  facilityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  metricValGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  hospFullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  hospAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distBadgeText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  hospMetricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  hospMetricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  hospActions: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  callErBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callErBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bloodPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bloodSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bloodSelectBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  bloodSelectText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  bloodSelectTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
  bloodResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  bloodStockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloodDropIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  bloodResultSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  unitsBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitsVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
  },
  unitsLabel: {
    fontSize: 10,
    color: '#991B1B',
  },
  bloodMetaRow: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  bloodMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  requestBloodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 12,
    borderRadius: 8,
  },
  requestBloodBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  qrVisualBox: {
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrContainerBox: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTokenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  qrDetailsArea: {
    width: '100%',
    gap: 8,
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  qrFieldLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  qrFieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  offlineNoticeText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
  },
  // Hero SOS Card Styles (Bigger & Center of Attention)
  heroSosCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 6,
  },
  heroSosBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroSosPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  heroSosBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  heroSosTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 1,
  },
  heroSosDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
  },
  heroSosButtonOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    borderWidth: 3,
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },
  heroSosButtonInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  heroSosButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: -2,
  },
  heroSosButtonSub: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  quickSosLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  quickSosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  quickSosChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
  },
  quickSosChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  // Modal Backdrop & SOS Card
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  sosSuccessBox: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  sosBeacon: {
    alignItems: 'center',
    marginBottom: 10,
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
    marginVertical: 10,
    paddingVertical: 10,
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
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeSosText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  uniqueQrNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  uniqueQrNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
    lineHeight: 18,
  },
});
