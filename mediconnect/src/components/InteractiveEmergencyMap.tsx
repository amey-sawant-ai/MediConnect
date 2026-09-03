import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEmergencyRoute, RouteCoordinates } from '@/services/osrmRoutingService';
import { HealthcareColors } from '@/constants/theme';

interface InteractiveEmergencyMapProps {
  patientCoords?: RouteCoordinates;
  hospitalCoords?: RouteCoordinates;
  ambulanceCoords?: RouteCoordinates;
  patientName?: string;
  hospitalName?: string;
  ambulanceName?: string;
}

export const InteractiveEmergencyMap: React.FC<InteractiveEmergencyMapProps> = ({
  patientCoords = { latitude: 19.076, longitude: 72.8777 },
  hospitalCoords = { latitude: 19.085, longitude: 72.889 },
  ambulanceCoords = { latitude: 19.068, longitude: 72.865 },
  patientName = 'Rahul Sharma (Patient)',
  hospitalName = 'Metro City Trauma Hospital',
  ambulanceName = 'Rapid ALS Unit 07',
}) => {
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [etaMinutes, setEtaMinutes] = useState<number>(5);
  const [routeSummary, setRouteSummary] = useState<string>('Fastest Emergency Corridor via Arterial Express');
  const [simStep, setSimStep] = useState<number>(1);
  const totalSimSteps = 5;

  useEffect(() => {
    let isMounted = true;
    getEmergencyRoute(ambulanceCoords, patientCoords).then((res) => {
      if (isMounted) {
        setDistanceKm(res.distanceKm);
        setEtaMinutes(res.durationMinutes);
        setRouteSummary(res.summary);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const advanceSimulation = () => {
    setSimStep((prev) => {
      const next = prev < totalSimSteps ? prev + 1 : 1;
      const remainingKm = Math.max(0.3, +(distanceKm * (1 - next / (totalSimSteps + 1))).toFixed(1));
      setDistanceKm(remainingKm);
      setEtaMinutes(Math.max(1, Math.round(remainingKm * 2)));
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {/* Map Header Card */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="map" size={18} color="#0284C7" />
          <Text style={styles.title}>Live Emergency Dispatch & Route Tracking</Text>
        </View>
        <Text style={styles.subtext}>Powered by Leaflet OSM & Project OSRM Routing Machine</Text>
      </View>

      {/* Visual Simulated Map Canvas */}
      <View style={styles.mapCanvas}>
        {/* Background Grid Pattern */}
        <View style={styles.gridOverlay}>
          <View style={styles.roadH1} />
          <View style={styles.roadH2} />
          <View style={styles.roadV1} />
          <View style={styles.roadV2} />
          <View style={styles.routeCorridor} />
        </View>

        {/* Target Hospital Pin */}
        <View style={[styles.pinBox, styles.hospitalPin]}>
          <Ionicons name="business" size={16} color="#FFFFFF" />
          <View style={styles.pinLabelBox}>
            <Text style={styles.pinLabelText}>ER Trauma Center</Text>
          </View>
        </View>

        {/* Patient Location Pin */}
        <View style={[styles.pinBox, styles.patientPin]}>
          <Ionicons name="person" size={16} color="#FFFFFF" />
          <View style={styles.pinLabelBox}>
            <Text style={styles.pinLabelText}>{patientName}</Text>
          </View>
        </View>

        {/* Moving Dispatched Ambulance Pin */}
        <View
          style={[
            styles.ambulanceVehicle,
            {
              left: `${20 + (simStep / totalSimSteps) * 55}%`,
              top: `${55 - (simStep / totalSimSteps) * 25}%`,
            },
          ]}>
          <View style={styles.sirenPulse} />
          <Ionicons name="car-sport" size={20} color="#FFFFFF" />
          <View style={styles.ambulanceTag}>
            <Text style={styles.ambulanceTagText}>{ambulanceName}</Text>
          </View>
        </View>

        {/* Telemetry Overlay Banner */}
        <View style={styles.telemetryOverlay}>
          <View style={styles.telemetryMetric}>
            <Text style={styles.telemetryLabel}>Remaining Distance</Text>
            <Text style={styles.telemetryValue}>{distanceKm} km</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.telemetryMetric}>
            <Text style={styles.telemetryLabel}>Estimated ETA</Text>
            <Text style={[styles.telemetryValue, { color: '#DC2626' }]}>{etaMinutes} mins</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.telemetryMetric}>
            <Text style={styles.telemetryLabel}>Speed</Text>
            <Text style={styles.telemetryValue}>52 km/h</Text>
          </View>
        </View>
      </View>

      {/* Route & Controls Footer */}
      <View style={styles.footer}>
        <View style={styles.corridorInfo}>
          <Ionicons name="navigate-circle" size={16} color="#059669" />
          <Text style={styles.corridorText}>
            Corridor: <Text style={{ fontWeight: '700' }}>{routeSummary}</Text>
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.simBtn} onPress={advanceSimulation}>
            <Ionicons name="play-forward" size={14} color="#0F172A" />
            <Text style={styles.simBtnText}>Simulate Ambulance Telemetry ({simStep}/{totalSimSteps})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callDriverBtn}
            onPress={() => alert('Calling Ambulance Driver: +91 99222 33445')}>
            <Ionicons name="call" size={14} color="#FFFFFF" />
            <Text style={styles.callDriverBtnText}>Call Driver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  mapCanvas: {
    height: 240,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EDF2F7',
  },
  roadH1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#CBD5E1',
  },
  roadH2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  roadV1: {
    position: 'absolute',
    left: '28%',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#CBD5E1',
  },
  roadV2: {
    position: 'absolute',
    right: '25%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#CBD5E1',
  },
  routeCorridor: {
    position: 'absolute',
    left: '20%',
    top: '35%',
    width: '60%',
    height: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.5)',
    borderRadius: 4,
  },
  pinBox: {
    position: 'absolute',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hospitalPin: {
    top: 24,
    right: 32,
    backgroundColor: '#0284C7',
  },
  patientPin: {
    bottom: 60,
    right: 70,
    backgroundColor: '#DC2626',
  },
  pinLabelBox: {
    position: 'absolute',
    top: 36,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  ambulanceVehicle: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sirenPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  ambulanceTag: {
    position: 'absolute',
    top: -18,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ambulanceTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  telemetryOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  telemetryMetric: {
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  telemetryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  footer: {
    padding: 14,
    gap: 10,
  },
  corridorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  corridorText: {
    fontSize: 12,
    color: '#334155',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  callDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callDriverBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
