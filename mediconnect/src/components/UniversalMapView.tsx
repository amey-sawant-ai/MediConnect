import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapMarkerItem {
  id: string;
  coordinate: MapCoordinate;
  title: string;
  description?: string;
  pinColor?: string;
  iconName?: string;
  type?: 'user' | 'hospital' | 'ambulance' | 'blood_bank';
}

export interface UniversalMapViewProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  markers?: MapMarkerItem[];
  routeCoordinates?: MapCoordinate[];
  onMarkerPress?: (marker: MapMarkerItem) => void;
  height?: number;
  showsUserLocation?: boolean;
  children?: React.ReactNode;
}

// Dynamically import react-native-webview on native platforms
let NativeWebView: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeWebView = require('react-native-webview').WebView;
  } catch (err) {
    console.warn('Could not load react-native-webview:', err);
  }
}

export const UniversalMapView: React.FC<UniversalMapViewProps> = ({
  initialRegion,
  markers = [],
  routeCoordinates = [],
  height = 250,
  children,
}) => {
  const lat = initialRegion.latitude || 19.076;
  const lon = initialRegion.longitude || 72.8777;

  // Build high-performance Leaflet HTML with OpenStreetMap Tiles
  const mapHtml = useMemo(() => {
    const markersScript = markers
      .map((m) => {
        const titleEscaped = m.title.replace(/'/g, "\\'");
        const descEscaped = (m.description || '').replace(/'/g, "\\'");
        const isHosp = m.type === 'hospital';
        const color = isHosp ? '#0284c7' : '#f59e0b';
        const icon = isHosp ? '🏥' : '🚑';

        return `
          (function() {
            var icon = L.divIcon({
              className: '',
              html: '<div style="background:${color};color:white;padding:4px 8px;border-radius:8px;font-weight:bold;font-size:11px;border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);white-space:nowrap;display:flex;align-items:center;gap:4px;">${icon} ${titleEscaped}</div>',
              iconSize: [120, 28],
              iconAnchor: [60, 14]
            });
            L.marker([${m.coordinate.latitude}, ${m.coordinate.longitude}], { icon: icon })
              .addTo(map)
              .bindPopup('<div style="font-family:sans-serif;padding:4px;"><strong style="color:#0f172a;font-size:13px;">${titleEscaped}</strong><br/><span style="color:#64748b;font-size:11px;">${descEscaped}</span></div>');
          })();
        `;
      })
      .join('\n');

    const polylineScript =
      routeCoordinates.length > 1
        ? `
          var latlngs = ${JSON.stringify(routeCoordinates.map((c) => [c.latitude, c.longitude]))};
          // Outer road shadow line
          L.polyline(latlngs, {
            color: '#1E3A8A',
            weight: 8,
            opacity: 0.5,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);
          // Inner vibrant street navigation corridor
          var polyline = L.polyline(latlngs, {
            color: '#0284C7',
            weight: 5,
            opacity: 0.95,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        `
        : `map.setView([${lat}, ${lon}], 14);`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body, html, #map { width: 100%; height: 100%; background: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: hidden; }
          .user-pulse-marker {
            width: 20px;
            height: 20px;
            background: #dc2626;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.9);
            animation: pulse 1.6s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
            70% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
          .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            center: [${lat}, ${lon}],
            zoom: 14,
            zoomControl: true
          });

          // OpenStreetMap Free Tile Layer
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // User Live GPS Pin
          var userIcon = L.divIcon({
            className: '',
            html: '<div class="user-pulse-marker"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          L.marker([${lat}, ${lon}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>You are here</b><br/>Live Device GPS');

          ${markersScript}
          ${polylineScript}
        </script>
      </body>
      </html>
    `;
  }, [lat, lon, markers, routeCoordinates]);

  return (
    <View style={[styles.container, { height }]}>
      {Platform.OS === 'web' ? (
        // Web: Render real OpenStreetMap Leaflet iframe
        // @ts-ignore
        <iframe
          srcDoc={mapHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title="OpenStreetMap Live Hospital Map"
        />
      ) : NativeWebView ? (
        // Native Android & iOS: Render real OpenStreetMap Leaflet WebView
        <NativeWebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={StyleSheet.absoluteFill}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Loading OpenStreetMap tiles...</Text>
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  fallback: {
    ...(StyleSheet.absoluteFill as any),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  fallbackText: {
    fontSize: 12,
    color: '#64748B',
  },
});
