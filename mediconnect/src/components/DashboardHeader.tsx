import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '@/context/AuthContext';
import { HealthcareColors } from '@/constants/theme';
import { parseScannedQrText, buildPatientQrPayload, decodeQrFromImageData } from '@/services/qrCodeService';

export const DashboardHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { user, role, logout, triggerEmergencySos, resolvePatientByQrToken } = useAuth();
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosActiveData, setSosActiveData] = useState<{ dispatchId: string; eta: number } | null>(null);

  // QR Code Scanner states
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPatientData, setScannedPatientData] = useState<{ user: any; profile: any } | null>(null);

  // Real Camera Live Stream states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const scanIntervalRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const stopCameraStream = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleRealQrScanPayload = (payloadText: string) => {
    stopCameraStream();
    setIsScanning(true);
    setTimeout(() => {
      const parsedRecord = parseScannedQrText(payloadText);
      if (parsedRecord) {
        setScannedPatientData(parsedRecord);
      } else {
        alert('Could not decode a valid MediConnect Medical QR Pass payload.');
      }
      setIsScanning(false);
    }, 300);
  };

  useEffect(() => {
    if (!qrModalVisible || scannedPatientData) {
      stopCameraStream();
      return;
    }

    // Start Web Live Camera Stream & jsqr real-time frame scanner
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setCameraError(null);
      setCameraActive(false);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } })
          .then((stream) => {
            streamRef.current = stream;
            setCameraActive(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }

            // Start 250ms real-time frame decoding loop
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

  const roleBadge = getRoleBadgeDetails(role);
  const rolesList: UserRole[] = [
    'patient',
    'doctor',
    'hospital',
    'ambulance',
    'blood_bank',
  ];
            scanIntervalRef.current = setInterval(() => {
              const video = videoRef.current;
              if (video && video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
                canvas.width = video.videoWidth || 320;
                canvas.height = video.videoHeight || 240;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const decodedQr = decodeQrFromImageData(imgData.data, canvas.width, canvas.height);
                if (decodedQr) {
                  handleRealQrScanPayload(decodedQr);
                }
              }
            }, 250);
          })
          .catch((err) => {
            console.warn('Camera stream notice:', err);
            setCameraError('Live camera access pending or permission required.');
          });
      } else {
        setCameraError('Camera API unsupported in this environment.');
      }
    } else if (Platform.OS !== 'web') {
      if (!permission?.granted) {
        requestPermission();
      }
    }

    return () => {
      stopCameraStream();
    };
  }, [qrModalVisible, scannedPatientData]);

  if (!user || !role) return null;

  const handleSosTrigger = (type: string) => {
    const res = triggerEmergencySos(type);
    setSosActiveData({ dispatchId: res.dispatchId, eta: res.etaMinutes });
  };

  const handleImageFileScan = (event: any) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setIsScanning(true);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const decodedText = decodeQrFromImageData(imageData.data, img.width, img.height);
            if (decodedText) {
              handleRealQrScanPayload(decodedText);
            } else {
              alert('No scannable QR code matrix found in selected image file.');
              setIsScanning(false);
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      handleRealQrScanPayload('qr_med_rahul_98765');
    }
  };

  const activePatientJson = user && role === 'patient'
    ? JSON.stringify(buildPatientQrPayload(user, resolvePatientByQrToken('qr_med_rahul_98765')?.profile as any))
    : JSON.stringify(buildPatientQrPayload(resolvePatientByQrToken('qr_med_rahul_98765')?.user as any, resolvePatientByQrToken('qr_med_rahul_98765')?.profile as any));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/images/app_logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>MediConnect</Text>
            <Text style={styles.brandSubtitle}>Emergency Healthcare</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {/* Medical QR Scanner Button */}
          <TouchableOpacity
            style={styles.qrHeaderButton}
            onPress={() => {
              setQrModalVisible(true);
              setScannedPatientData(null);
            }}
            activeOpacity={0.8}>
            <Ionicons name="qr-code-outline" size={16} color="#0284C7" />
            <Text style={styles.qrHeaderText}>Scan QR</Text>
          </TouchableOpacity>

          {/* Emergency SOS Shortcut */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setSosModalVisible(true)}
            activeOpacity={0.8}>
            <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
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

      {/* Medical QR Code Scanner & Passport Modal */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setQrModalVisible(false);
          setScannedPatientData(null);
        }}>
        <View style={styles.modalBackdrop}>
          {!scannedPatientData ? (
            /* SCANNER CAMERA VIEWFINDER */
            <View style={styles.scannerCard}>
              <View style={styles.scannerHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scannerTitle}>Medical QR Code Scanner</Text>
                  <Text style={styles.scannerSubtitle}>
                    Position patient Medical QR Pass within the viewfinder
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                  <Ionicons name="close-circle" size={26} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.viewfinderBox}>
                {Platform.OS === 'web' ? (
                  /* Web Live Camera Video Stream */
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 14,
                    }}
                  />
                ) : (
                  /* Native Camera View */
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={(result) => {
                      if (result.data) {
                        handleRealQrScanPayload(result.data);
                      }
                    }}
                  />
                )}

                <View style={[styles.cornerTarget, styles.cornerTL]} />
                <View style={[styles.cornerTarget, styles.cornerTR]} />
                <View style={[styles.cornerTarget, styles.cornerBL]} />
                <View style={[styles.cornerTarget, styles.cornerBR]} />

                <View style={styles.laserLine} />

                {cameraActive && (
                  <View style={styles.cameraLiveBadge}>
                    <View style={styles.cameraLiveDot} />
                    <Text style={styles.cameraLiveText}>LIVE CAMERA FEED ACTIVE</Text>
                  </View>
                )}

                {cameraError && (
                  <View style={styles.cameraErrorBox}>
                    <Ionicons name="camera" size={24} color="#94A3B8" />
                    <Text style={styles.cameraErrorText}>{cameraError}</Text>
                  </View>
                )}

                {isScanning && (
                  <View style={styles.scanningOverlay}>
                    <Ionicons name="sync" size={28} color="#38BDF8" />
                    <Text style={styles.scanningOverlayText}>Decrypting QR Medical Pass...</Text>
                  </View>
                )}
              </View>

              <Text style={styles.scannerHint}>
                🎥 Point your live device camera at any Medical QR Code to scan automatically
              </Text>

              <View style={styles.scannerActions}>
                <TouchableOpacity
                  style={styles.scanSimulateBtn}
                  onPress={() => handleRealQrScanPayload(activePatientJson)}
                  disabled={isScanning}>
                  <Ionicons name="scan" size={18} color="#FFFFFF" />
                  <Text style={styles.scanSimulateBtnText}>
                    {isScanning ? 'Decoding Matrix...' : 'Scan Active Patient QR'}
                  </Text>
                </TouchableOpacity>

                {Platform.OS === 'web' && (
                  <TouchableOpacity
                    style={styles.scanFileBtn}
                    onPress={() => {
                      const inputEl = document.getElementById('qr-file-input');
                      if (inputEl) inputEl.click();
                    }}>
                    <Ionicons name="image" size={18} color="#0284C7" />
                    <Text style={styles.scanFileBtnText}>Upload & Decode QR Image</Text>
                    <input
                      id="qr-file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileScan}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            /* LIVE SCANNED PATIENT EMERGENCY PASSPORT CARD */
            <View style={styles.scannedPassportCard}>
              <View style={styles.passportHeaderBanner}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
                <Text style={styles.passportHeaderBannerText}>
                  LIVE VERIFIED PATIENT EMERGENCY PASSPORT
                </Text>
                <TouchableOpacity onPress={() => setQrModalVisible(false)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close" size={22} color="#059669" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.passportBody} contentContainerStyle={{ gap: 14 }}>
                {/* Patient Hero Details */}
                <View style={styles.passportHeroRow}>
                  <View style={styles.passportBloodBadge}>
                    <Text style={styles.passportBloodText}>
                      {scannedPatientData.profile?.bloodGroup || 'O+'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.passportName}>{scannedPatientData.user?.fullName}</Text>
                    <Text style={styles.passportMeta}>
                      DOB: {scannedPatientData.profile?.dateOfBirth} • {scannedPatientData.profile?.gender?.toUpperCase()}
                    </Text>
                    <Text style={styles.passportToken}>
                      PASS ID: {scannedPatientData.profile?.qrPassToken}
                    </Text>
                  </View>
                </View>

                {/* ICE Emergency Contact Card with 1-Tap Dialer */}
                <View style={styles.iceCard}>
                  <View style={styles.iceHeader}>
                    <Ionicons name="call" size={16} color="#DC2626" />
                    <Text style={styles.iceTitle}>IN CASE OF EMERGENCY (ICE)</Text>
                  </View>
                  <Text style={styles.iceName}>
                    {scannedPatientData.profile?.emergencyContact?.name} (
                    {scannedPatientData.profile?.emergencyContact?.relation})
                  </Text>
                  <TouchableOpacity
                    style={styles.iceCallBtn}
                    onPress={() =>
                      alert(`Dialing ICE Contact: ${scannedPatientData.profile?.emergencyContact?.phoneNumber}`)
                    }>
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.iceCallBtnText}>
                      CALL {scannedPatientData.profile?.emergencyContact?.phoneNumber}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Critical Medical Conditions & Allergies */}
                <View style={styles.medGrid}>
                  <View style={styles.medBoxAlert}>
                    <Text style={styles.medBoxLabel}>Known Allergies</Text>
                    <Text style={styles.medBoxValAlert}>
                      {(scannedPatientData.profile?.allergies || ['None Reported']).join(', ')}
                    </Text>
                  </View>

                  <View style={styles.medBoxInfo}>
                    <Text style={styles.medBoxLabel}>Chronic Conditions</Text>
                    <Text style={styles.medBoxValInfo}>
                      {(scannedPatientData.profile?.existingConditions || ['None']).join(', ')}
                    </Text>
                  </View>
                </View>

                {/* Current Medications */}
                <View style={styles.medSectionBox}>
                  <Text style={styles.medSectionTitle}>Current Active Medications</Text>
                  <Text style={styles.medSectionVal}>
                    {(scannedPatientData.profile?.currentMedications || ['None']).join(' • ')}
                  </Text>
                </View>

                {/* Medical Notes & Address */}
                {scannedPatientData.profile?.medicalNotes && (
                  <View style={styles.medSectionBox}>
                    <Text style={styles.medSectionTitle}>Emergency Medical Notes</Text>
                    <Text style={styles.medSectionVal}>{scannedPatientData.profile.medicalNotes}</Text>
                  </View>
                )}

                <View style={styles.medSectionBox}>
                  <Text style={styles.medSectionTitle}>Registered Home Address</Text>
                  <Text style={styles.medSectionVal}>
                    {scannedPatientData.profile?.homeAddress}, {scannedPatientData.profile?.city} (
                    {scannedPatientData.profile?.postalCode})
                  </Text>
                </View>
              </ScrollView>

              {/* Footer Buttons */}
              <View style={styles.passportFooterRow}>
                <TouchableOpacity
                  style={styles.rescanBtn}
                  onPress={() => setScannedPatientData(null)}>
                  <Ionicons name="refresh" size={16} color="#0284C7" />
                  <Text style={styles.rescanBtnText}>Scan Another QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closePassportBtn}
                  onPress={() => setQrModalVisible(false)}>
                  <Text style={styles.closePassportBtnText}>Done / Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
  qrHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qrHeaderText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },

  // Scanner Viewfinder Card
  scannerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    padding: 20,
    alignItems: 'center',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  viewfinderBox: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 12,
  },
  cornerTarget: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#0284C7',
  },
  cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3 },
  laserLine: {
    position: 'absolute',
    top: '50%',
    width: '90%',
    height: 2,
    backgroundColor: '#0284C7',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  scanningOverlayText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  scannerHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  scannerActions: {
    width: '100%',
    gap: 10,
  },
  scanSimulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
  },
  scanSimulateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scanFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 10,
  },
  scanFileBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },

  // Scanned Live Passport Card
  scannedPassportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  passportHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  passportHeaderBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  passportBody: {
    maxHeight: 420,
  },
  passportHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passportBloodBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportBloodText: {
    color: '#DC2626',
    fontSize: 20,
    fontWeight: '900',
  },
  passportName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  passportMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  passportToken: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
  iceCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  iceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  iceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7F1D1D',
    marginBottom: 8,
  },
  iceCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 8,
  },
  iceCallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  medGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  medBoxAlert: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  medBoxInfo: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  medBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  medBoxValAlert: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
  },
  medBoxValInfo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  medSectionBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  medSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  medSectionVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  passportFooterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rescanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rescanBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  closePassportBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closePassportBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraLiveBadge: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cameraLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  cameraLiveText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cameraErrorBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
  },
  cameraErrorText: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
});
