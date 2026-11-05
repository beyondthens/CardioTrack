# CardioTrack ZA — Cardiovascular Remote Patient Monitoring & Telehealth Platform

> **Class II Medical Software Telehealth Platform** designed for South African cardiology practices, private hospitals, and remote chronic patient monitoring. Compliant with **POPIA** (Protection of Personal Information Act) and **SAHPRA** digital health telemetry guidelines.

---

## 🌐 Live Cloud Deployment & Links

* **Live Cloud Application (Render)**: [https://cardiotrack-za.onrender.com](https://cardiotrack-za.onrender.com)
* **GitHub Repository**: [https://github.com/beyondthens/CardioTrack](https://github.com/beyondthens/CardioTrack)
* **Render Service ID**: `srv-dbm7j015efls73cnutr0`
* **Direct Android APK Download**: [https://cardiotrack-za.onrender.com/api/download-apk](https://cardiotrack-za.onrender.com/api/download-apk)
* **CockroachDB Cloud Integration**: Live GCP Serverless Distributed SQL Cluster (`cardiotrack-za`)

---

## 📱 Android Native APK & Mobile Distribution

CardioTrack ZA includes standalone Android packaging and mobile installation support:

* **Downloadable APK**: Available directly via the app header and `/api/download-apk` (`cardiotrack-za.apk`).
* **Package Identifier**: `za.co.cardiotrack.mobile`
* **Target Architecture**: Android 7.0+ (API Level 24 through 34).
* **Permissions Configured**: `INTERNET`, `ACCESS_NETWORK_STATE`, `BODY_SENSORS`, `BLUETOOTH`, `BLUETOOTH_CONNECT`, `POST_NOTIFICATIONS`.
* **Build Script**: `python3 scripts/build-apk.py` generates the APK bundle with `AndroidManifest.xml`, Dalvik executable, and bundled mobile app assets.
* **Automated CI/CD**: `.github/workflows/build-apk.yml` builds, packages, and attaches the release APK on every commit to GitHub.
* **Progressive Web App (PWA)**: Includes `manifest.json` and `sw.js` for instant Add-to-Home-Screen installation on any Android or iOS device.

---

## 🗄️ CockroachDB Cloud Database Infrastructure

The database is provisioned and running live on CockroachDB Cloud (Standard Edition on GCP):

* **Cluster Name**: `cardiotrack-za`
* **Cluster ID**: `2ad514ff-61bc-42c8-bacb-55de065b1146`
* **Cloud Provider & Region**: GCP `us-central1`
* **Database Name**: `cardiotrack_db`
* **SQL User**: `cardiotrack_app`
* **SQL Host**: `cardiotrack-za-22972.jxf.gcp-us-central1.cockroachlabs.cloud`
* **Port**: `26257`
* **SSL Mode**: `verify-full` (TLS 1.3 encrypted)

### Provisioned Database Tables

1. **`users`**: HPCSA registrations, BHF practice numbers, patient records, and PMS access roles.
2. **`vitals_telemetry`**: Heart rate, systolic/diastolic blood pressure, SpO2, blood glucose, BMI, MAP, and pulse pressure.
3. **`pms_addons`**: Integrations with Healthbridge, GoodX, Medprax, TeleHealth ZA, and HL7 FHIR v4.
4. **`pms_audit_logs`**: POPIA-compliant audit logging for every clinical observation transmitted to doctor PMS suites.

---

## 👥 Commercial Demo Accounts

Pre-configured commercial accounts are available for instant 1-click evaluation:

| Role | Name & Title | Email Address | Password | Clinical Practice & Identifier |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Thabo Mokoena | `thabo.mokoena@patient.cardiotrack.co.za` | `Password123!` | Discovery Health Classic (Member #902188412) |
| **Cardiologist** | Dr. Priya Naidoo, MBChB, FCP(SA) | `dr.naidoo@sandtonheart.co.za` | `Password123!` | Sandton Heart Institute • BHF: `0148829` • HPCSA: `MP0492819` |
| **Telemedicine Lead** | Dr. Kgosi Molefe, DipPEC(SA) | `dr.molefe@telehealth.co.za` | `Password123!` | Cape Telemed Emergency Hub • BHF: `0281941` • HPCSA: `MP0581944` |
| **Clinic Admin / Sister** | Sr. Nomvula Sithole, RN | `admin@sandtonheart.co.za` | `Password123!` | Practice Claims, PMS Billing & Healthbridge Coordinator |

> *Tip: You can also register a brand new custom Patient or Doctor account directly through the in-app registration modal.*

---

## 🚀 Key Commercial Features

### 1. Cardiovascular Remote Patient Monitoring (RPM)
* **Real-time Vitals Capture**: Heart Rate (BPM), Blood Pressure (Systolic/Diastolic mmHg), SpO2 Oxygen (%), and Blood Glucose (mmol/L).
* **Clinical AHA & SA Heart Staging**: Automatic categorization into *Normal*, *Elevated*, *Stage 1 HTN*, *Stage 2 HTN*, and *Hypertensive Crisis* with immediate clinical action alerts.
* **Mean Arterial Pressure (MAP) & Pulse Pressure**: Calculated hemodynamic indicators for arterial compliance and organ perfusion.
* **Pulse Rhythm Tap-to-Measure Sensor**: Interactive haptic sensor enabling patients to estimate heart rate cadence without dedicated peripheral hardware.

### 2. Practice Management Software (PMS) & Telemedicine Add-ons Hub
Direct API connectors to South Africa's leading healthcare practice software:
* **Healthbridge Clinical API**: Real-time electronic patient file updates, claims pre-authorizations, and continuous telemetry streaming.
* **GoodX Clinical Web Suite**: Web-based clinical records synchronization with HL7 FHIR v4 compatibility.
* **Medprax Clinical PMS**: Clinical encounter documentation and billing codes (ICD-10 I10 for Essential Hypertension).
* **TeleHealth ZA Virtual Clinic**: End-to-end encrypted video teleconsultation room featuring a live real-time cardiac vitals Heads-Up Display (HUD) overlay for the consulting physician.
* **HL7 FHIR v4 REST API**: Industry-standard interoperability exchange for Observation and Encounter resources.

### 3. Body Mass Index (BMI) & Cardiac Risk Engine
* **Interactive Biometric Controls**: Metric (`kg/cm`) and Imperial (`lbs/in`) sliders with real-time WHO classification.
* **Cardiovascular Load Assessment**: Explains how body mass index correlates with left ventricular hypertrophy and systemic vascular resistance.
* **Target Weight Window**: Dynamically calculates normal BMI weight limits based on height.

### 4. Multi-Day Telemetry Trend Analytics
* **Dual-curve Blood Pressure Graph**: Plots Systolic and Diastolic trends with the AHA Stage 1 HTN threshold benchmark.
* **Interactive SVG Visualization**: Hover-inspect telemetry data points with timestamps, BPM peaks, and clinical notes.
* **Statistical Rolling Averages**: 7-day rolling mean blood pressure, resting heart rate range, and telemetry stability index.

### 5. South Africa Emergency SOS Medical Helplines
* Direct one-touch dispatch links to **ER24** (`084 124`), **Netcare 911** (`082 911`), **Public Ambulance / Metro** (`10177`), and **Universal Cellular SOS** (`112`).

---

## 🏗️ Architecture & Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
* **Backend**: Node.js & Express full-stack server (`server.ts`).
* **Database**: CockroachDB Cloud Serverless SQL (PostgreSQL protocol via `pg`) + Offline-first fallback cache.
* **Mobile Packaging**: Android Native APK (`cardiotrack-za.apk`) & PWA offline cache.
* **Cloud Hosting**: Render Web Service (`cardiotrack-za.onrender.com`) with automated zero-downtime deployment triggers.
* **Regulatory Compliance**: HL7 FHIR v4, ICD-10, POPIA Act 4 of 2013, SAHPRA Software as a Medical Device (SaMD) Class II guidelines.

---

## 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/beyondthens/CardioTrack.git
cd CardioTrack

# 2. Install dependencies
npm install

# 3. Build Android APK
python3 scripts/build-apk.py

# 4. Start development server (Port 3000)
npm run dev

# 5. Access the web app
open http://localhost:3000
```
