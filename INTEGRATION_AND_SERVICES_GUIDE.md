# HealthConnect: Free & Open-Source Services, APIs & Datasets Integration Guide

> **Scope**: Implementation blueprint for Mapping, Geocoding, OSRM Routing, Real-Time Telemetry (Socket.IO/FCM), SMS Gateways (Fast2SMS), and Healthcare Datasets (e-RaktKosh & OGD India).

---

## 1. Overview of Free Tier & Open-Source Stack

```
+-----------------------------------------------------------------------------------------+
|                                    HEALTHCONNECT APP                                    |
+-----------------------------+-----------------------------+-----------------------------+
|    Mapping & Navigation     |    Real-Time Telemetry      |    Emergency Messaging      |
|    - Leaflet.js / OSM Tiles |    - Socket.IO WebSockets   |    - Fast2SMS Gateway       |
|    - Nominatim Geocoding    |    - Firebase Cloud Messaging|   - Push Notifications (FCM)|
|    - Project OSRM Routing   |    - Real-Time Beaconing    |    - 1-Tap SOS Broadcast    |
+-----------------------------+-----------------------------+-----------------------------+
|                    Healthcare Datasets & Open Standards Infrastructure                  |
|    - e-RaktKosh (National Blood Portal Component Schema: PRBC, FFP, Platelets)          |
|    - Open Government Data (OGD) Platform India (National Hospital & PHC Directory)      |
|    - Overpass Turbo (OSM amenity=hospital, amenity=blood_bank, emergency=ambulance)    |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Mapping, Geocoding & Routing Services

### 2.1 Nominatim (OpenStreetMap Free Geocoding)
* **Purpose**: Convert GPS coordinates (Latitude/Longitude) to readable street addresses, and search hospital/clinic names to coordinates.
* **Cost**: 100% Free (OpenStreetMap Foundation).
* **Policy Requirement**: You must provide a custom `User-Agent` header in every HTTP request (max 1 request/sec rate limit; implement local cache).
* **API Endpoints**:
  * **Reverse Geocoding** (Coords -> Address):
    ```http
    GET https://nominatim.openstreetmap.org/reverse?lat=19.0760&lon=72.8777&format=json&addressdetails=1
    ```
  * **Search / Forward Geocoding** (Place Name -> Coords):
    ```http
    GET https://nominatim.openstreetmap.org/search?q=Lilavati+Hospital+Mumbai&format=json&limit=5
    ```

---

### 2.2 Project OSRM (Open Source Routing Machine)
* **Purpose**: Calculate fastest driving routes, turn-by-turn directions, distances, and ETAs between ambulances, patients, and hospital emergency trauma centers.
* **Cost**: 100% Free public demo server (`router.project-osrm.org`) or self-hostable via Docker.
* **API Endpoint (Driving Route)**:
  ```http
  GET https://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=geojson&steps=true
  ```
* **Output Structure**:
  - `routes[0].distance`: Distance in meters (divide by 1000 for km).
  - `routes[0].duration`: Estimated travel duration in seconds (divide by 60 for ETA in minutes).
  - `routes[0].geometry.coordinates`: GeoJSON array of `[longitude, latitude]` waypoints for drawing the route polyline on Leaflet map.

---

### 2.3 Overpass Turbo (OSM Query API)
* **Purpose**: Download verified coordinates of hospitals, trauma centers, blood banks, and pharmacies for any Indian city or district.
* **Endpoint**: `https://overpass-api.de/api/interpreter`
* **Query Template (Fetch all hospitals & blood banks within bounding box or city)**:
  ```ql
  [out:json][timeout:25];
  area["name"="Mumbai"]->.searchArea;
  (
    node["amenity"="hospital"](area.searchArea);
    way["amenity"="hospital"](area.searchArea);
    node["amenity"="blood_bank"](area.searchArea);
    node["emergency"="ambulance_station"](area.searchArea);
  );
  out center body;
  >;
  out skel qt;
  ```

---

## 3. Real-Time Telemetry & Messaging Architecture

### 3.1 Socket.IO (Low-Latency Bidirectional Events)
* **Ambulance Beacon Channel**: `ambulance:telemetry`
  ```typescript
  // Payload emitted every 3 seconds by ambulance app
  {
    ambulanceId: "AMB-MH-01-7749",
    coords: { latitude: 19.0825, longitude: 72.8812 },
    heading: 142.5,
    speedKmH: 54,
    status: "on_emergency_call",
    targetHospitalId: "usr_hosp_003",
    etaMinutes: 4
  }
  ```
* **Hospital ER Pre-Arrival Channel**: `hospital:incoming_alert`
  ```typescript
  {
    dispatchId: "DISP-89421",
    ambulanceId: "AMB-MH-01-7749",
    patientName: "Rahul Sharma",
    bloodGroup: "O+",
    triageLevel: "RED",
    etaMinutes: 4,
    prepRequired: "Trauma Bay 1 + 2 Units O+ Blood"
  }
  ```

---

### 3.2 Fast2SMS Gateway Integration
* **Purpose**: Deliver OTPs and emergency SOS coordinates via SMS to non-smartphones or without data connectivity.
* **Endpoint**: `https://www.fast2sms.com/dev/bulkV2`
* **Request Header**: `authorization: YOUR_FAST2SMS_API_KEY`
* **Payload**:
  ```json
  {
    "route": "otp",
    "variables_values": "123456",
    "numbers": "9876543210"
  }
  ```
* **Quick SOS SMS Template**:
  ```
  "EMERGENCY ALERT from HealthConnect: Rahul Sharma triggered SOS at Lat 19.0760, Lon 72.8777. Nearest Ambulance Unit-07 dispatched. Track: https://healthconnect.org/track/DISP-89421"
  ```

---

## 4. Healthcare & Blood Resource Datasets

### 4.1 e-RaktKosh Centralized Blood Portal Schema
Aligned with the Ministry of Health and Family Welfare (MoHFW) standards:
* **Blood Components**:
  1. `Whole Blood` (WB)
  2. `Packed Red Blood Cells` (PRBC)
  3. `Fresh Frozen Plasma` (FFP)
  4. `Platelet Concentrate` (RDP / SDP)
  5. `Cryoprecipitate`
* **Inventory Record Structure**:
  ```json
  {
    "bloodBankId": "BB-MH-LIC-4482",
    "bankName": "LifeLine Central Blood Bank",
    "state": "Maharashtra",
    "district": "Mumbai",
    "licenseNo": "BB-MH-LIC-4482",
    "contactPhone": "+91 22 2555 1100",
    "componentAvailability": {
      "A+": { "PRBC": 18, "Platelets": 6, "FFP": 12 },
      "O+": { "PRBC": 31, "Platelets": 10, "FFP": 15 },
      "O-": { "PRBC": 7, "Platelets": 2, "FFP": 4 }
    },
    "lastSyncTimestamp": "2026-09-03T12:00:00Z"
  }
  ```

### 4.2 Open Government Data (OGD) Platform India Hospital Schema
* Standard fields for hospital listings:
  - `facility_name` (Hospital / CHC / PHC / District Hospital)
  - `state_name`, `district_name`, `pincode`
  - `latitude`, `longitude`
  - `emergency_services_available` (Yes/No)
  - `total_sanctioned_beds`, `icu_beds_count`, `ventilator_count`
  - `contact_number`

---

## 5. Client Services Implementation in Code

The following service modules have been provided in `src/services/`:
1. `src/services/nominatimService.ts` — Address lookup and reverse geocoding.
2. `src/services/osrmRoutingService.ts` — Real driving route calculation, distance, and ETA.
3. `src/services/eRaktKoshService.ts` — Live blood component inventory & donor broadcasting.
4. `src/components/InteractiveEmergencyMap.tsx` — Visual Leaflet/OSM map component rendering routes and live ambulances.
