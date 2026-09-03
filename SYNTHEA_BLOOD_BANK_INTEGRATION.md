# HealthConnect: Synthea Synthetic Patient & Blood Bank Architecture

> **Purpose**: Standardizing Blood Bank Inventory, Donor Registry, and Transfusion Matching using the [Synthea Synthetic Patient Population Simulator](https://github.com/synthetichealth/synthea) and FHIR/LOINC Clinical Standards.

---

## 1. Synthea Clinical Data Mapping for Blood Resources

Synthea generates realistic clinical patient records. HealthConnect models its blood bank inventory, recipient needs, and donor registry directly on Synthea tables:

| HealthConnect Field | Synthea CSV Source | Clinical Standard Code | Example Values |
|---|---|---|---|
| **Donor / Patient ID** | `patients.csv` (`Id`) | UUID / Synthetic ID | `syn_pat_9a2f7c` |
| **Demographics** | `patients.csv` (`FIRST`, `LAST`, `BIRTHDATE`, `GENDER`, `ADDRESS`, `PHONE`) | FHIR `Patient` | Priya Sharma, 1995-04-12, F |
| **ABO Blood Group** | `observations.csv` (`CODE`, `VALUE`) | LOINC `883-9` (ABO group) | `A`, `B`, `AB`, `O` |
| **Rh Factor** | `observations.csv` (`CODE`, `VALUE`) | LOINC `10331-7` (Rh [Type]) | `Positive`, `Negative` |
| **Hemoglobin Level** | `observations.csv` (`CODE`, `VALUE`, `UNITS`) | LOINC `718-7` (Hemoglobin [Mass/volume] in Blood) | `13.8 g/dL` (Min. 12.5 for donation) |
| **Platelet Count** | `observations.csv` (`CODE`, `VALUE`, `UNITS`) | LOINC `777-3` (Platelets [#/volume] in Blood) | `240 10*3/uL` (Min. 150 for donation) |
| **Eligibility History** | `conditions.csv` (`CODE`, `DESCRIPTION`) | SNOMED-CT | Absence of active infection, hepatitis, or severe cardiovascular disease |
| **Medication Contraindications** | `medications.csv` (`CODE`, `DESCRIPTION`) | RxNorm | Absence of anti-coagulants / blood thinners (Warfarin, Heparin) |
| **Transfusion Encounters** | `encounters.csv` & `procedures.csv` | SNOMED-CT `5447007` (Transfusion of red blood cells) | Emergency trauma transfusion order |

---

## 2. Donor Eligibility Evaluation Rules (Synthea Rule Engine)

Before a registered donor can be summoned during an emergency broadcast, HealthConnect evaluates Synthea clinical observation rules:

1. **Age & Interval Rule**:
   - Age between 18 and 65.
   - At least **90 days** (3 months) since the last whole blood donation.
2. **Hemoglobin Rule (LOINC `718-7`)**:
   - Female: $\ge 12.5\text{ g/dL}$
   - Male: $\ge 13.0\text{ g/dL}$
3. **Platelet Rule (LOINC `777-3`)**:
   - Platelet donation requires count $\ge 150 \times 10^3/\mu\text{L}$.
4. **Condition Exclusions (Synthea `conditions.csv`)**:
   - Disqualified if records indicate Hepatitis B/C, HIV, active cardiac conditions, or untreated severe hypertension.
5. **Medication Exclusions (Synthea `medications.csv`)**:
   - Disqualified if currently prescribed blood thinners, immunosuppressants, or recent antibiotics within 7 days.

---

## 3. Red Blood Cell & Plasma Compatibility Matrix

```
Recipient Blood Group (Synthea LOINC 883-9 + 10331-7)
      │
      ├── O-  ◄── O- only (Universal RBC Donor)
      ├── O+  ◄── O-, O+
      ├── A-  ◄── O-, A-
      ├── A+  ◄── O-, O+, A-, A+
      ├── B-  ◄── O-, B-
      ├── B+  ◄── O-, O+, B-, B+
      ├── AB- ◄── O-, A-, B-, AB-
      └── AB+ ◄── ALL GROUPS (Universal RBC Recipient)
```

*Note: For Fresh Frozen Plasma (FFP), compatibility is inverted (AB is universal plasma donor, O is universal plasma recipient).*

---

## 4. Synthea Donor & Inventory Schema

```typescript
export interface SyntheaDonorRecord {
  syntheaPatientId: string;
  fullName: string;
  gender: 'M' | 'F';
  birthDate: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  loincObservations: {
    hemoglobinGdl: number;      // LOINC 718-7
    plateletCountK: number;     // LOINC 777-3
    bloodPressure: string;      // LOINC 85354-9 (Systolic/Diastolic)
  };
  lastDonationDate: string;
  daysSinceLastDonation: number;
  isEligibleNow: boolean;
  disqualificationReason?: string;
  distanceKm: number;
  contactNumber: string;
  city: string;
  totalDonationsCount: number;
}
```

---

## 5. Integration Modules in Code

* **Service**: [`src/services/syntheaBloodService.ts`](file:///c:/Users/AmeySawant/MediConnect/mediconnect/src/services/syntheaBloodService.ts)  
  Contains 50+ pre-seeded clinical Synthea donor records, eligibility checkers, LOINC observation parsers, and urgent matching dispatchers.
* **Blood Bank Dashboard**: [`src/app/(blood-bank)/dashboard.tsx`](file:///c:/Users/AmeySawant/MediConnect/mediconnect/src/app/(blood-bank)/dashboard.tsx)  
  Displays live inventory + Synthea verified active donor summon roster with real-time SMS alert trigger.
* **Patient Dashboard**: [`src/app/(patient)/dashboard.tsx`](file:///c:/Users/AmeySawant/MediConnect/mediconnect/src/app/(patient)/dashboard.tsx)  
  Matches patient blood needs directly against compatible Synthea donors and regional banks.
