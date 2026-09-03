import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentDeviceLocation, RealtimeLocation } from '@/services/realtimeLocationService';
import { fetchRealtimeNearbyMedicalFacilities, RealtimeMedicalFacility } from '@/services/overpassRealtimeService';
import { getEmergencyRoute, RouteCoordinates } from '@/services/osrmRoutingService';
import { HealthcareColors } from '@/constants/theme';
import { UniversalMapView } from '@/components/UniversalMapView';

interface InteractiveEmergencyMapProps {
  patientName?: string;
  hospitalName?: string;
  ambulanceName?: string;
}

export const InteractiveEmergencyMap: React.FC<InteractiveEmergencyMapProps> = ({
  patientName = 'Rahul Sharma (Patient)',
  ambulanceName = 'Rapid ALS Unit 07',
}) => {
  const [deviceLocation, setDeviceLocation] = useState<RealtimeLocation | null>(null);
  const [facilities, setFacilities] = useState<RealtimeMedicalFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<RealtimeMedicalFacility | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [initialDistKm, setInitialDistKm] = useState<number>(2.4);
  const [etaMinutes, setEtaMinutes] = useState<number>(5);
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState<number>(52);
  const [routeSummary, setRouteSummary] = useState<string>('Computing OSRM road corridor...');
  const [turnSteps, setTurnSteps] = useState<string[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<RouteCoordinates[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAutoMoving, setIsAutoMoving] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(1);
  const totalSimSteps = 8;

  // Load real-time GPS & Overpass data
  const loadRealtimeMapData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch real hardware GPS
      const loc = await getCurrentDeviceLocation();
      setDeviceLocation(loc);

      // 2. Fetch real facilities from OpenStreetMap Overpass
      const facs = await fetchRealtimeNearbyMedicalFacilities(loc.latitude, loc.longitude);
      setFacilities(facs);

      // Default target: closest hospital
      const closest = facs.find((f) => f.type === 'hospital') || facs[0];
      setSelectedFacility(closest || null);

      if (closest) {
        // Dispatched ambulance origin (approx 2-3km away from patient)
        const ambOrigin: RouteCoordinates = {
          latitude: +(loc.latitude - 0.012).toFixed(4),
          longitude: +(loc.longitude - 0.015).toFixed(4),
        };

        const patientCoords: RouteCoordinates = {
          latitude: loc.latitude,
          longitude: loc.longitude,
        };

        // 3. Compute real driving route via Project OSRM
        const route = await getEmergencyRoute(ambOrigin, patientCoords);
        setDistanceKm(route.distanceKm);
        setInitialDistKm(route.distanceKm);
        setEtaMinutes(route.durationMinutes);
        setRouteSummary(route.summary);
        setTurnSteps(route.steps);
        setRouteWaypoints(route.waypoints);
        setSimStep(1);
      }
    } catch (err) {
      console.warn('Error loading real-time map data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealtimeMapData();
  }, []);

  // Continuous Real-Time Movement Engine (Ticks every 2.5s)
  useEffect(() => {
    if (!isAutoMoving) return;

    const timer = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= totalSimSteps) {
          // Stay at arrived state
          return totalSimSteps;
        }
        const next = prev + 1;
        const remainingProgress = (totalSimSteps - next) / totalSimSteps;
        const newDist = Math.max(0.1, +(initialDistKm * remainingProgress).toFixed(1));
        setDistanceKm(newDist);
        setEtaMinutes(Math.max(1, Math.round(newDist * 2.2)));
        setCurrentSpeedKmH(44 + Math.floor(Math.random() * 16));
        return next;
      });
    }, 2600);

    return () => clearInterval(timer);
  }, [isAutoMoving, initialDistKm]);

  const advanceSimulation = () => {
    setSimStep((prev) => {
      const next = prev < totalSimSteps ? prev + 1 : 1;
      const remainingProgress = (totalSimSteps - next) / totalSimSteps;
      const newDist = Math.max(0.1, +(initialDistKm * remainingProgress).toFixed(1));
      setDistanceKm(newDist);
      setEtaMinutes(Math.max(1, Math.round(newDist * 2.2)));
      return next;
    });
  };

  // Follow the exact street curve waypoints calculated by Project OSRM
  let ambulanceLat = (deviceLocation?.latitude || 19.076) - 0.012;
  let ambulanceLon = (deviceLocation?.longitude || 72.8777) - 0.015;

  if (routeWaypoints.length > 0) {
    const wpIdx = Math.min(
      routeWaypoints.length - 1,
      Math.floor((simStep / totalSimSteps) * (routeWaypoints.length - 1))
    );
    ambulanceLat = routeWaypoints[wpIdx].latitude;
    ambulanceLon = routeWaypoints[wpIdx].longitude;
  }
  const isArrived = simStep >= totalSimSteps || distanceKm <= 0.15;

  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
      {/* Real-time Status Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.livePulse, isArrived && { backgroundColor: '#DC2626' }]} />
          <Ionicons name="navigate-circle" size={18} color="#0284C7" />
          <Text style={styles.title}>
            {isArrived ? '🚨 Unit Arrived' : 'Live Ambulance Telemetry'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Live Auto-Move Toggle */}
          <TouchableOpacity
            style={[styles.headerBtn, isAutoMoving && styles.headerBtnActive]}
            onPress={() => setIsAutoMoving(!isAutoMoving)}>
            <Ionicons
              name={isAutoMoving ? 'radio' : 'pause'}
              size={12}
              color={isAutoMoving ? '#059669' : '#64748B'}
            />
            <Text style={[styles.headerBtnText, isAutoMoving && { color: '#059669', fontWeight: '800' }]}>
              {isAutoMoving ? 'Live GPS' : 'Paused'}
            </Text>
          </TouchableOpacity>

          {/* Expand / Collapse Map View */}
          <TouchableOpacity
            style={[styles.headerBtn, isExpanded && styles.headerBtnExpanded]}
            onPress={() => setIsExpanded(!isExpanded)}>
            <Ionicons
              name={isExpanded ? 'contract' : 'scan-outline'}
              size={13}
              color={isExpanded ? '#FFFFFF' : '#0284C7'}
            />
            <Text style={[styles.headerBtnText, isExpanded && { color: '#FFFFFF' }]}>
              {isExpanded ? 'Collapse' : 'Expand View'}
            </Text>
          </TouchableOpacity>

          {/* Sync GPS */}
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadRealtimeMapData}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#0284C7" />
            ) : (
              <Ionicons name="refresh" size={13} color="#0284C7" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* GPS Telemetry Bar */}
      <View style={styles.gpsStatusBar}>
        <View style={styles.gpsLeft}>
          <Ionicons name="location" size={14} color="#059669" />
          <Text style={styles.gpsCoordsText}>
            {deviceLocation
              ? `${deviceLocation.latitude.toFixed(4)}° N, ${deviceLocation.longitude.toFixed(4)}° E (±${deviceLocation.accuracyMeters}m)`
              : 'Acquiring GPS fix...'}
          </Text>
        </View>
        <Text style={styles.gpsSourceText}>
          {deviceLocation?.isSimulated ? 'Precise Fallback' : 'Live Device GPS'}
        </Text>
      </View>

      {/* Real Address Strip */}
      {deviceLocation?.address && (
        <View style={styles.addressStrip}>
          <Ionicons name="home-outline" size={12} color="#64748B" />
          <Text style={styles.addressText} numberOfLines={1}>
            {deviceLocation.address.displayName}
          </Text>
        </View>
      )}

      {/* Real-time OpenStreetMap Leaflet Canvas */}
      <UniversalMapView
        initialRegion={{
          latitude: deviceLocation?.latitude || 19.076,
          longitude: deviceLocation?.longitude || 72.8777,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        markers={[
          ...(selectedFacility
            ? [
                {
                  id: selectedFacility.id,
                  coordinate: {
                    latitude: selectedFacility.latitude,
                    longitude: selectedFacility.longitude,
                  },
                  title: selectedFacility.name,
                  description: `${selectedFacility.distanceKm} km away • ${selectedFacility.type.toUpperCase()}`,
                  type: selectedFacility.type === 'blood_bank' ? ('blood_bank' as const) : ('hospital' as const),
                  pinColor: '#0284C7',
                },
              ]
            : []),
          {
            id: 'dispatched_ambulance',
            coordinate: {
              latitude: ambulanceLat,
              longitude: ambulanceLon,
            },
            title: ambulanceName,
            description: isArrived
              ? 'Arrived at Patient GPS'
              : `En Route • Speed: ${currentSpeedKmH} km/h • ETA: ${etaMinutes}m`,
            type: 'ambulance' as const,
            pinColor: '#F59E0B',
          },
        ]}
        routeCoordinates={routeWaypoints}
        height={isExpanded ? 520 : 250}>
        {/* Real-time Telemetry Overlay */}
        <View style={styles.telemetryOverlay}>
          <View style={styles.telemetryMetric}>
            <Text style={styles.telemetryLabel}>Road Distance</Text>
            <Text style={styles.telemetryValue}>
              {isArrived ? '0.0 km' : `${distanceKm} km`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.telemetryMetric}>
            <Text style={styles.telemetryLabel}>Driving ETA</Text>
            <Text style={[styles.telemetryValue, { color: '#DC2626' }]}>
              {isArrived ? 'Arrived!' : `${etaMinutes} mins`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.telemetryMetric}>
            <Text style={styles.telemetryLabel}>GPS Telemetry</Text>
            <Text style={[styles.telemetryValue, { color: '#059669' }]}>
              {isArrived ? 'On Site' : `${currentSpeedKmH} km/h`}
            </Text>
          </View>
        </View>
      </UniversalMapView>

      {/* Arrival Notification Alert */}
      {isArrived && (
        <View style={styles.arrivedBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.arrivedTitle}>Ambulance Arrived at Your Location!</Text>
            <Text style={styles.arrivedDesc}>
              Paramedic unit {ambulanceName} is on site. Prepare patient ID and medical pass.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.arrivedCallBtn}
            onPress={() => alert('Dialing Paramedic: +91 99222 33445')}>
            <Ionicons name="call" size={14} color="#065F46" />
            <Text style={styles.arrivedCallBtnText}>Call</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Real Nearby Facilities from OSM Overpass */}
      <View style={styles.facilitiesSection}>
        <View style={styles.facilityHeaderRow}>
          <Text style={styles.facilitiesTitle}>
            Real Medical Facilities Discovered ({facilities.length})
          </Text>
          <Text style={styles.osmAttribution}>OpenStreetMap Overpass Live</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilitiesScroll}>
          {facilities.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            const isBlood = fac.type === 'blood_bank';
            return (
              <TouchableOpacity
                key={fac.id}
                style={[
                  styles.facilityChip,
                  isSelected && styles.facilityChipActive,
                ]}
                onPress={() => setSelectedFacility(fac)}>
                <View style={[styles.facilityChipIcon, { backgroundColor: isBlood ? '#FEF2F2' : '#E0F2FE' }]}>
                  <Ionicons
                    name={isBlood ? 'water' : 'business'}
                    size={14}
                    color={isBlood ? '#DC2626' : '#0284C7'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.facilityChipName} numberOfLines={1}>
                    {fac.name}
                  </Text>
                  <Text style={styles.facilityChipMeta}>
                    {fac.distanceKm} km away • {fac.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={16} color="#0284C7" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* OSRM Route Steps & Controls */}
      <View style={styles.footer}>
        <View style={styles.corridorInfo}>
          <Ionicons name="navigate-circle" size={16} color="#059669" />
          <Text style={styles.corridorText}>
            Route: <Text style={{ fontWeight: '700' }}>{routeSummary}</Text>
          </Text>
        </View>

        {turnSteps.length > 0 && (
          <View style={styles.turnStepsBox}>
            <Text style={styles.turnStepText}>Next Maneuver: {turnSteps[0]}</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.simBtn} onPress={advanceSimulation}>
            <Ionicons name="play-forward" size={14} color="#0F172A" />
            <Text style={styles.simBtnText}>
              Simulate Live GPS Beacon ({simStep}/{totalSimSteps})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callDriverBtn}
            onPress={() => alert('Calling dispatched Ambulance Paramedic: +91 99222 33445')}>
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
  containerExpanded: {
    borderColor: '#0284C7',
    borderWidth: 1.5,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  headerBtnExpanded: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  headerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  refreshBtn: {
    backgroundColor: '#F0F9FF',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  arrivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  arrivedTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  arrivedDesc: {
    color: '#D1FAE5',
    fontSize: 10,
    marginTop: 1,
  },
  arrivedCallBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrivedCallBtnText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  gpsStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1FAE5',
  },
  gpsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  gpsSourceText: {
    fontSize: 10,
    color: '#047857',
  },
  addressStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  addressText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  mapCanvas: {
    height: 250,
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
    top: '28%',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#CBD5E1',
  },
  roadH2: {
    position: 'absolute',
    top: '68%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  roadV1: {
    position: 'absolute',
    left: '26%',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#CBD5E1',
  },
  roadV2: {
    position: 'absolute',
    right: '24%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#CBD5E1',
  },
  routeCorridor: {
    position: 'absolute',
    left: '18%',
    top: '38%',
    width: '64%',
    height: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.55)',
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
    top: 22,
    right: 28,
    backgroundColor: '#0284C7',
  },
  patientPin: {
    bottom: 64,
    right: 64,
    backgroundColor: '#DC2626',
  },
  accuracyRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
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
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
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
  facilitiesSection: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  facilityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilitiesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  osmAttribution: {
    fontSize: 10,
    color: '#64748B',
  },
  facilitiesScroll: {
    flexDirection: 'row',
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    width: 210,
  },
  facilityChipActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  facilityChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  facilityChipMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  footer: {
    padding: 12,
    gap: 8,
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
  turnStepsBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  turnStepText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
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
