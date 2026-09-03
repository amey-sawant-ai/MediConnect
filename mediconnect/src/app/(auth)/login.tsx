import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { HealthcareColors } from '@/constants/theme';
import { MOCK_ACCOUNTS } from '@/data/mockUsers';

export default function UniversalLoginScreen() {
  const { loginWithPassword, requestOtp, verifyOtp, isLoading, triggerEmergencySos } = useAuth();

  // Login Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Form Fields
  const [identifier, setIdentifier] = useState('patient@healthconnect.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Flow
  const [otpPhone, setOtpPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // UI States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosActiveData, setSosActiveData] = useState<{ dispatchId: string; eta: number } | null>(null);

  const handlePasswordSubmit = async () => {
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or mobile phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = await loginWithPassword(identifier, password, rememberMe);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleRequestOtp = async () => {
    setErrorMessage(null);
    if (!otpPhone.trim()) {
      setErrorMessage('Please enter a valid mobile number for OTP.');
      return;
    }
    const res = await requestOtp(otpPhone);
    if (res.success) {
      setOtpSent(true);
      setDevOtpHint(res.devOtpHint || '123456');
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage(null);
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }
    const res = await verifyOtp(otpPhone, otpCode);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const fillDemoAccount = (targetRole: UserRole) => {
    const acc = MOCK_ACCOUNTS[targetRole];
    setIdentifier(acc.user.email || acc.user.phoneNumber);
    setPassword('password123');
    setAuthMode('password');
    setErrorMessage(null);
  };

  const handleQuickSos = (type: string) => {
    const res = triggerEmergencySos(type);
    setSosActiveData({ dispatchId: res.dispatchId, eta: res.etaMinutes });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Emergency SOS Banner */}
      <View style={styles.emergencyBanner}>
        <View style={styles.emergencyBannerLeft}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <Text style={styles.emergencyBannerText}>In an immediate life-threatening emergency?</Text>
        </View>
        <TouchableOpacity
          style={styles.emergencyBannerBtn}
          onPress={() => setSosModalVisible(true)}>
          <Text style={styles.emergencyBannerBtnText}>1-Tap SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Main Login Card */}
      <View style={styles.loginCard}>
        {/* Brand Header */}
        <View style={styles.headerArea}>
          <View style={styles.logoBadge}>
            <Ionicons name="medical" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>HealthConnect</Text>
          <Text style={styles.brandSubtitle}>Healthcare & Emergency Response Platform</Text>
          <Text style={styles.universalNotice}>
            Universal Portal for Patients, Doctors, Hospitals, Ambulances & Responders
          </Text>
        </View>

        {/* Mode Toggle: Password vs Fast OTP */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, authMode === 'password' && styles.toggleBtnActive]}
            onPress={() => {
              setAuthMode('password');
              setErrorMessage(null);
            }}>
            <Ionicons
              name="key-outline"
              size={16}
              color={authMode === 'password' ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.toggleBtnText, authMode === 'password' && styles.toggleBtnTextActive]}>
              Password Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, authMode === 'otp' && styles.toggleBtnActive]}
            onPress={() => {
              setAuthMode('otp');
              setErrorMessage(null);
            }}>
            <Ionicons
              name="flash-outline"
              size={16}
              color={authMode === 'otp' ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.toggleBtnText, authMode === 'otp' && styles.toggleBtnTextActive]}>
              Fast OTP Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Box */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Mode A: Password Login */}
        {authMode === 'password' && (
          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Phone or Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. patient@healthconnect.org or +91 98765 43210"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password / PIN</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your account password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.metaRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}>
                <Ionicons
                  name={rememberMe ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={rememberMe ? '#0284C7' : '#94A3B8'}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => alert('Password reset instructions sent to registered mobile/email.')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handlePasswordSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Mode B: Fast OTP Login */}
        {authMode === 'otp' && (
          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Registered Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={otpPhone}
                  onChangeText={setOtpPhone}
                  editable={!otpSent}
                />
              </View>
            </View>

            {!otpSent ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleRequestOtp}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send 6-Digit OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View>
                <View style={styles.devHintBox}>
                  <Ionicons name="information-circle" size={16} color="#0284C7" />
                  <Text style={styles.devHintText}>
                    Testing OTP: Use <Text style={{ fontWeight: '700' }}>{devOtpHint}</Text>
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter 6-Digit Code</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123456"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otpCode}
                      onChangeText={setOtpCode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => setOtpSent(false)}>
                  <Text style={styles.resendBtnText}>Change Number / Resend</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Quick Demo Credentials Fill Pills */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>One-Click Demo Account Autofill:</Text>
          <View style={styles.demoPillsRow}>
            {[
              { role: 'patient' as UserRole, label: 'Patient', color: '#10B981' },
              { role: 'doctor' as UserRole, label: 'Doctor', color: '#8B5CF6' },
              { role: 'hospital' as UserRole, label: 'Hospital ER', color: '#0284C7' },
              { role: 'ambulance' as UserRole, label: 'Ambulance', color: '#F59E0B' },
              { role: 'blood_bank' as UserRole, label: 'Blood Bank', color: '#EF4444' },
              { role: 'responder' as UserRole, label: 'Responder', color: '#DC2626' },
              { role: 'admin' as UserRole, label: 'Admin', color: '#334155' },
            ].map((p) => (
              <TouchableOpacity
                key={p.role}
                style={[styles.demoPill, { borderColor: p.color }]}
                onPress={() => fillDemoAccount(p.role)}>
                <View style={[styles.demoPillDot, { backgroundColor: p.color }]} />
                <Text style={styles.demoPillText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Register Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account yet?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>

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
            <View style={styles.sosCardHeader}>
              <Ionicons name="warning" size={32} color="#DC2626" />
              <Text style={styles.sosCardTitle}>Immediate Emergency SOS</Text>
              <Text style={styles.sosCardSubtitle}>
                No login required. Broadcasts GPS coordinates to nearest dispatch fleet.
              </Text>
            </View>

            {!sosActiveData ? (
              <View style={styles.sosOptionsList}>
                <Text style={styles.sosSelectPrompt}>Select Emergency Category:</Text>
                {[
                  'Cardiac Arrest / Chest Pain',
                  'Road Accident / Trauma',
                  'Severe Bleeding / Wound',
                  'Choking / Breathlessness',
                  'Unconscious Person',
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.sosOptionBtn}
                    onPress={() => handleQuickSos(cat)}>
                    <Ionicons name="radio-button-on" size={16} color="#DC2626" />
                    <Text style={styles.sosOptionText}>{cat}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.sosSuccessArea}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.sosSuccessHeading}>Ambulance Dispatched</Text>
                <Text style={styles.sosSuccessSub}>
                  Dispatch ID: <Text style={{ fontWeight: '700' }}>{sosActiveData.dispatchId}</Text>
                </Text>
                <Text style={styles.sosEta}>
                  Estimated Arrival: <Text style={{ color: '#DC2626' }}>{sosActiveData.eta} minutes</Text>
                </Text>
                <Text style={styles.sosDesc}>
                  Stay calm. Paramedics have received your location.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.sosCloseBtn}
              onPress={() => {
                setSosModalVisible(false);
                setSosActiveData(null);
              }}>
              <Text style={styles.sosCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    maxWidth: 520,
    marginBottom: 16,
  },
  emergencyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  emergencyBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    flexShrink: 1,
  },
  emergencyBannerBtn: {
    backgroundColor: HealthcareColors.emergencyRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  emergencyBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    width: '100%',
    maxWidth: 520,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: HealthcareColors.emergencyRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  universalNotice: {
    fontSize: 11,
    color: '#0284C7',
    textAlign: 'center',
    marginTop: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    flex: 1,
  },
  formArea: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12,
    color: '#475569',
  },
  forgotText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: HealthcareColors.emergencyRed,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  devHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  devHintText: {
    fontSize: 12,
    color: '#0369A1',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendBtnText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  demoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  demoPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  createAccountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
  },
  sosCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sosCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 6,
  },
  sosCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  sosOptionsList: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  sosSelectPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  sosOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sosOptionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  sosSuccessArea: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    width: '100%',
  },
  sosSuccessHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 8,
  },
  sosSuccessSub: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
  },
  sosEta: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 6,
  },
  sosDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 6,
    textAlign: 'center',
  },
  sosCloseBtn: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sosCloseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
