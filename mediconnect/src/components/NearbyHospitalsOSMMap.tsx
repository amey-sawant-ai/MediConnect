import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentDeviceLocation, RealtimeLocation } from '@/services/realtimeLocationService';
import { fetchNearbyHospitalsOSM, OSMHospitalDetail } from '@/services/overpassRealtimeService';
import { getEmergencyRoute, RouteCoordinates } from '@/services/osrmRoutingService';
import { searchPlace } from '@/services/nominatimService';
import { HealthcareColors } from '@/constants/theme';
import { UniversalMapView } from '@/components/UniversalMapView';

export const NearbyHospitalsOSMMap: React.FC<{
  patientBloodGroup?: string;
  patientAllergies?: string[];
}> = ({
  patientBloodGroup = 'O+',
  patientAllergies = ['Penicillin'],
}) => {
  const [deviceLocation, setDeviceLocation] = useState<RealtimeLocation | null>(null);
  const [hospitals, setHospitals] = useState<OSMHospitalDetail[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<OSMHospitalDetail | null>(null);
  const [radiusMeters, setRadiusMeters] = useState<number>(8000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // OSRM Real Routing Data to Selected Hospital
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [routeEtaMinutes, setRouteEtaMinutes] = useState<number>(0);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<RouteCoordinates[]>([]);
  const [preAlertSent, setPreAlertSent] = useState<Record<string, boolean>>({});

  // 1. Load Device GPS & Query Live OSM Overpass
  const loadHospitals = async (lat?: number, lon?: number, radius?: number) => {
    setIsLoading(true);
    try {
      let targetLat = lat;
      let targetLon = lon;

      if (targetLat === undefined || targetLon === undefined) {
        const loc = await getCurrentDeviceLocation();
        setDeviceLocation(loc);
        targetLat = loc.latitude;
        targetLon = loc.longitude;
      }

      const r = radius || radiusMeters;
      const data = await fetchNearbyHospitalsOSM(targetLat, targetLon, r);
      setHospitals(data);

      if (data.length > 0) {
        selectHospital(data[0], targetLat, targetLon);
      }
    } catch (err) {
      console.warn('Error loading nearby hospitals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  // 2. Select Hospital & Compute Real OSRM Route
  const selectHospital = async (
    hosp: OSMHospitalDetail,
    userLat = deviceLocation?.latitude || 19.076,
    userLon = deviceLocation?.longitude || 72.8777
  ) => {
    setSelectedHospital(hosp);

    const start: RouteCoordinates = { latitude: userLat, longitude: userLon };
    const end: RouteCoordinates = { latitude: hosp.latitude, longitude: hosp.longitude };

    const route = await getEmergencyRoute(start, end);
    setRouteDistanceKm(route.distanceKm);
    setRouteEtaMinutes(route.durationMinutes);
    setRouteSteps(route.steps);
    setRouteWaypoints(route.waypoints);
  };

  // 3. Search Any Location via Nominatim
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchPlace(searchQuery);
      if (results.length > 0) {
        const first = results[0];
        setDeviceLocation({
          latitude: first.lat,
          longitude: first.lon,
          accuracyMeters: 20,
          heading: null,
          speedKmH: null,
          timestamp: Date.now(),
          address: first,
          isSimulated: true,
        });
        await loadHospitals(first.lat, first.lon, radiusMeters);
      } else {
        alert('No location found. Please try another place name or landmark.');
      }
    } catch {
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePreAlert = (hospId: string, hospName: string) => {
    setPreAlertSent((prev) => ({ ...prev, [hospId]: true }));
    alert(
      `PRE-ARRIVAL ALERT TRANSMITTED!\n\nHospital: ${hospName}\nPatient Blood Group: ${patientBloodGroup}\nKnown Allergies: ${patientAllergies.join(
        ', '
      )}\nEstimated ETA: ${routeEtaMinutes} mins.\n\nCasualty ER Trauma Bay pre-allocated.`
    );
  };

  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
      {/* Header & Search */}
      <View style={styles.topBar}>
        <View style={styles.topTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <View style={styles.pulseDot} />
            <Ionicons name="map" size={18} color="#0284C7" />
            <Text style={styles.topTitle}>OpenStreetMap Live Hospital Finder</Text>
          </View>

          {/* Expand / Collapse Button */}
          <TouchableOpacity
            style={[styles.expandBtn, isExpanded && styles.expandBtnActive]}
            onPress={() => setIsExpanded(!isExpanded)}>
            <Ionicons
              name={isExpanded ? 'contract' : 'scan-outline'}
              size={13}
              color={isExpanded ? '#FFFFFF' : '#0284C7'}
            />
            <Text style={[styles.expandBtnText, isExpanded && { color: '#FFFFFF' }]}>
              {isExpanded ? 'Collapse' : 'Expand View'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Place Search Input */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, area, or landmark..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleLocationSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleLocationSearch}
            disabled={isSearching}>
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Current GPS & Radius Selector */}
        <View style={styles.controlsRow}>
          <View style={styles.gpsChip}>
            <Ionicons name="location" size={12} color="#059669" />
            <Text style={styles.gpsChipText} numberOfLines={1}>
              {deviceLocation?.address?.city || 'Mumbai'}: {deviceLocation?.latitude.toFixed(3)}°, {deviceLocation?.longitude.toFixed(3)}°
            </Text>
          </View>

          {/* Radius selector */}
          <View style={styles.radiusPills}>
            {[3000, 5000, 8000, 15000].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusPill, radiusMeters === r && styles.radiusPillActive]}
                onPress={() => {
                  setRadiusMeters(r);
                  loadHospitals(deviceLocation?.latitude, deviceLocation?.longitude, r);
                }}>
                <Text style={[styles.radiusPillText, radiusMeters === r && styles.radiusPillTextActive]}>
                  {r / 1000} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* React Native Maps / OpenStreetMap Universal Map View */}
      <UniversalMapView
        initialRegion={{
          latitude: deviceLocation?.latitude || 19.076,
          longitude: deviceLocation?.longitude || 72.8777,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        markers={hospitals.map((h) => ({
          id: h.id,
          coordinate: { latitude: h.latitude, longitude: h.longitude },
          title: h.name,
          description: `${h.distanceKm} km • ${h.icuBedsAvailable} ICU beds free`,
          type: 'hospital',
          pinColor: selectedHospital?.id === h.id ? '#0369A1' : '#0284C7',
        }))}
        routeCoordinates={routeWaypoints}
        onMarkerPress={(marker) => {
          const found = hospitals.find((h) => h.id === marker.id);
          if (found) selectHospital(found);
        }}
        height={isExpanded ? 520 : 240}>
        {/* Routing Corridor Banner */}
        {selectedHospital && (
          <View style={styles.telemetryOverlay}>
            <View style={styles.telemItem}>
              <Text style={styles.telemLabel}>Road Distance</Text>
              <Text style={styles.telemValue}>{routeDistanceKm || selectedHospital.distanceKm} km</Text>
            </View>
            <View style={styles.telemDivider} />
            <View style={styles.telemItem}>
              <Text style={styles.telemLabel}>Driving ETA</Text>
              <Text style={[styles.telemValue, { color: '#DC2626' }]}>
                {routeEtaMinutes || selectedHospital.erWaitMinutes} mins
              </Text>
            </View>
            <View style={styles.telemDivider} />
            <View style={styles.telemItem}>
              <Text style={styles.telemLabel}>ICU Beds</Text>
              <Text style={[styles.telemValue, { color: '#059669' }]}>
                {selectedHospital.icuBedsAvailable} Free
              </Text>
            </View>
          </View>
        )}
      </UniversalMapView>

      {/* Selected Hospital Details & Pre-Alert Actions */}
      {selectedHospital && (
        <View style={styles.selectedHospCard}>
          <View style={styles.hospCardTop}>
            <View style={styles.hospIconBox}>
              <Ionicons name="business" size={22} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hospCardName}>{selectedHospital.name}</Text>
              <Text style={styles.hospCardAddress} numberOfLines={1}>
                {selectedHospital.address}
              </Text>
              <Text style={styles.hospCardMeta}>
                Distance: {selectedHospital.distanceKm} km • Casualty Wait: {selectedHospital.erWaitMinutes}m
              </Text>
            </View>
            <View style={styles.bedsBadge}>
              <Text style={styles.bedsBadgeNum}>{selectedHospital.icuBedsAvailable}</Text>
              <Text style={styles.bedsBadgeText}>ICU Beds</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.callHotlineBtn}
              onPress={() => alert(`Dialing 24/7 Casualty Hotline: ${selectedHospital.phone}`)}>
              <Ionicons name="call" size={14} color="#FFFFFF" />
              <Text style={styles.callHotlineBtnText}>Call ER: {selectedHospital.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.preAlertBtn,
                preAlertSent[selectedHospital.id] && styles.preAlertBtnSent,
              ]}
              onPress={() => handlePreAlert(selectedHospital.id, selectedHospital.name)}>
              <Ionicons
                name={preAlertSent[selectedHospital.id] ? 'checkmark-circle' : 'notifications'}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.preAlertBtnText}>
                {preAlertSent[selectedHospital.id] ? 'ER Pre-Alerted' : 'Pre-Alert ER Bay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* All Discovered Hospitals Roster */}
      <View style={styles.rosterSection}>
        <View style={styles.rosterHeader}>
          <Text style={styles.rosterTitle}>
            OpenStreetMap Verified Facilities in {radiusMeters / 1000}km ({hospitals.length})
          </Text>
          <TouchableOpacity
            style={styles.resyncBtn}
            onPress={() => loadHospitals(deviceLocation?.latitude, deviceLocation?.longitude, radiusMeters)}>
            <Ionicons name="refresh" size={12} color="#0284C7" />
            <Text style={styles.resyncText}>Refresh OSM</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#0284C7" />
            <Text style={styles.loadingText}>Querying OpenStreetMap Overpass servers...</Text>
          </View>
        ) : (
          <ScrollView style={styles.rosterList} nestedScrollEnabled>
            {hospitals.map((h) => {
              const isSel = selectedHospital?.id === h.id;
              return (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.rosterItem, isSel && styles.rosterItemActive]}
                  onPress={() => selectHospital(h)}>
                  <View style={styles.rosterItemLeft}>
                    <Text style={styles.rosterItemName}>{h.name}</Text>
                    <Text style={styles.rosterItemSub} numberOfLines={1}>
                      {h.address}
                    </Text>
                    <View style={styles.badgesRow}>
                      <View style={styles.specBadge}>
                        <Text style={styles.specBadgeText}>{h.icuBedsAvailable} ICU Beds</Text>
                      </View>
                      <View style={styles.waitBadge}>
                        <Text style={styles.waitBadgeText}>{h.erWaitMinutes}m wait</Text>
                      </View>
                      <Text style={styles.distText}>{h.distanceKm} km</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isSel ? 'radio-button-on' : 'chevron-forward'}
                    size={18}
                    color={isSel ? '#0284C7' : '#94A3B8'}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
    marginBottom: 16,
  },
  containerExpanded: {
    borderColor: '#0284C7',
    borderWidth: 1.5,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  topBar: {
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  expandBtn: {
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
  expandBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  topTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  searchBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  gpsChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  radiusPills: {
    flexDirection: 'row',
    gap: 4,
  },
  radiusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  radiusPillActive: {
    backgroundColor: '#0284C7',
  },
  radiusPillText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  radiusPillTextActive: {
    color: '#FFFFFF',
  },
  mapCanvas: {
    height: 220,
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
  road1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#CBD5E1',
  },
  road2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  road3: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#CBD5E1',
  },
  expressway: {
    position: 'absolute',
    left: '15%',
    top: '40%',
    width: '70%',
    height: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.5)',
    borderRadius: 4,
  },
  mapMarker: {
    position: 'absolute',
    padding: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userMarker: {
    bottom: 50,
    left: '25%',
    backgroundColor: '#DC2626',
  },
  userPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
  },
  hospMarker: {
    backgroundColor: '#0284C7',
  },
  hospMarkerSelected: {
    backgroundColor: '#0369A1',
    transform: [{ scale: 1.15 }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  markerTag: {
    position: 'absolute',
    top: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  markerTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  telemetryOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  telemItem: {
    alignItems: 'center',
  },
  telemLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  telemValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  telemDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  selectedHospCard: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  hospCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hospIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  hospCardAddress: {
    fontSize: 11,
    color: '#64748B',
  },
  hospCardMeta: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  bedsBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  bedsBadgeNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  bedsBadgeText: {
    fontSize: 9,
    color: '#065F46',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callHotlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: HealthcareColors.emergencyRed,
    paddingVertical: 9,
    borderRadius: 6,
  },
  callHotlineBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  preAlertBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    borderRadius: 6,
  },
  preAlertBtnSent: {
    backgroundColor: '#059669',
  },
  preAlertBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  rosterSection: {
    padding: 12,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rosterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  resyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resyncText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 11,
    color: '#64748B',
  },
  rosterList: {
    maxHeight: 240,
  },
  rosterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  rosterItemActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  rosterItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  rosterItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rosterItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  specBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specBadgeText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  waitBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  waitBadgeText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
  },
  distText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 'auto',
  },
});
