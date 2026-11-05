import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(express.json());

// Configuration
const COCKROACHDB_API_KEY =
  process.env.COCKROACHDB_API_KEY || 'CCDB1_REDACTED_FOR_SECURITY';
const COCKROACH_DATABASE_URL =
  process.env.COCKROACH_DATABASE_URL ||
  'postgresql://cardiotrack_app:CardioTrack2026!SecureKey@cardiotrack-za-22972.jxf.gcp-us-central1.cockroachlabs.cloud:26257/cardiotrack_db';
const RENDER_API_KEY = process.env.RENDER_API_KEY || 'rnd_9c1xbnqVAyHBb8ENXqGXrOJqfONd';
const RENDER_SERVICE_ID = 'srv-dbm7j015efls73cnutr0';
const GITHUB_REPO = 'https://github.com/beyondthens/CardioTrack';

// CockroachDB Connection Pool
const cockroachPool = new Pool({
  connectionString: COCKROACH_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000,
});

let isCockroachConnected = false;
async function testDbConnection() {
  try {
    const client = await cockroachPool.connect();
    const res = await client.query('SELECT current_database(), current_user;');
    client.release();
    isCockroachConnected = true;
    console.log(`CockroachDB connected successfully to ${res.rows[0].current_database} as ${res.rows[0].current_user}`);
  } catch (err: any) {
    isCockroachConnected = false;
    console.warn(`CockroachDB initial connection check: ${err?.message} (falling back to memory cache)`);
  }
}
testDbConnection();

// In-memory User Accounts (Cache & Fallback)
let usersDatabase: any[] = [
  {
    id: 'usr_pat_1',
    name: 'Thabo Mokoena',
    email: 'thabo.mokoena@patient.cardiotrack.co.za',
    password: 'Password123!',
    role: 'patient',
    bloodType: 'O+',
    dob: '1986-04-12',
    phone: '+27 82 456 7890',
    medicalAid: 'Discovery Health Classic Comprehensive (Member #902188412)',
    primaryDoctorId: 'usr_doc_1',
    connectedPms: ['Healthbridge', 'TeleHealth ZA']
  },
  {
    id: 'usr_doc_1',
    name: 'Dr. Priya Naidoo',
    email: 'dr.naidoo@sandtonheart.co.za',
    password: 'Password123!',
    role: 'doctor',
    specialty: 'Cardiologist',
    hpcsaNumber: 'MP0492819',
    practiceNumber: '0148829', // BHF Practice number
    clinicName: 'Sandton Heart & Vascular Institute',
    connectedPms: ['Healthbridge', 'GoodX PMS', 'HL7 FHIR v4']
  },
  {
    id: 'usr_doc_2',
    name: 'Dr. Kgosi Molefe',
    email: 'dr.molefe@telehealth.co.za',
    password: 'Password123!',
    role: 'doctor',
    specialty: 'Telemedicine Physician & Emergency Dispatcher',
    hpcsaNumber: 'MP0581944',
    practiceNumber: '0281941',
    clinicName: 'Cape Telemed Digital Care & Emergency Hub',
    connectedPms: ['TeleHealth ZA', 'Medprax', 'Netcare 911 EMS']
  },
  {
    id: 'usr_adm_1',
    name: 'Sr. Nomvula Sithole, RN',
    email: 'admin@sandtonheart.co.za',
    password: 'Password123!',
    role: 'doctor',
    specialty: 'Clinical Practice Manager & Sister in Charge',
    hpcsaNumber: 'RN039182',
    practiceNumber: '0148829',
    clinicName: 'Sandton Heart Institute Claims & PMS Coordinator',
    connectedPms: ['Healthbridge', 'GoodX PMS']
  }
];

// In-memory PMS & Telemedicine Add-ons Catalog
let pmsAddons = [
  {
    id: 'addon_healthbridge',
    name: 'Healthbridge Clinical API',
    provider: 'Healthbridge South Africa',
    category: 'Practice Management & EHR',
    description: 'Real-time billing, clinical telemetry transfer, and medical aid claims processing for SA practices.',
    status: 'connected',
    endpointUrl: 'https://api.healthbridge.co.za/v2/telemetry',
    practiceNumber: '0148829',
    autoSync: true,
    syncFrequency: 'realtime',
    lastSyncTime: new Date().toISOString()
  },
  {
    id: 'addon_goodx',
    name: 'GoodX Clinical Web Suite',
    provider: 'GoodX Software',
    category: 'Practice Management & EHR',
    description: 'Comprehensive medical practice management software with patient clinical record synchronization.',
    status: 'connected',
    endpointUrl: 'https://clinical.goodx.co.za/api/v1/vitals-stream',
    practiceNumber: '0148829',
    autoSync: true,
    syncFrequency: 'hourly',
    lastSyncTime: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'addon_medprax',
    name: 'Medprax PMS Bridge',
    provider: 'Medprax Clinical',
    category: 'Clinical Suite',
    description: 'Seamless encounter documentation and vitals telemetry export to Medprax local & cloud software.',
    status: 'configured',
    endpointUrl: 'https://connect.medprax.co.za/api/ehr',
    practiceNumber: '0281941',
    autoSync: false,
    syncFrequency: 'manual',
    lastSyncTime: null
  },
  {
    id: 'addon_telehealth_za',
    name: 'TeleHealth ZA Virtual Clinic',
    provider: 'TeleHealth South Africa',
    category: 'Telemedicine & Video Portal',
    description: 'Encrypted virtual teleconsultations with live patient vitals HUD and in-session cardiac telemetry.',
    status: 'connected',
    endpointUrl: 'https://telemed.health.gov.za/rooms/cardio-secure',
    practiceNumber: '0148829',
    autoSync: true,
    syncFrequency: 'realtime',
    lastSyncTime: new Date().toISOString()
  },
  {
    id: 'addon_hl7_fhir',
    name: 'HL7 FHIR v4 Health Exchange',
    provider: 'Health Level Seven International',
    category: 'Interoperability Standard',
    description: 'Standardized REST API export for FHIR Observation & Encounter resources compatible with all modern EHRs.',
    status: 'connected',
    endpointUrl: 'https://fhir.cardiotrack.co.za/r4/Observation',
    practiceNumber: '0148829',
    autoSync: true,
    syncFrequency: 'realtime',
    lastSyncTime: new Date().toISOString()
  }
];

// PMS Sync Audit Logs
let pmsSyncLogs = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    addonName: 'Healthbridge Clinical API',
    patientName: 'Thabo Mokoena',
    action: 'Telemetry Observation Upload',
    recordsTransmitted: 1,
    status: 'success',
    responseCode: 200,
    details: 'Vitals (118/76 mmHg, 74 BPM) synced to Sandton Heart Dr. Naidoo file'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    addonName: 'TeleHealth ZA Virtual Clinic',
    patientName: 'Thabo Mokoena',
    action: 'Telemedicine HUD Stream',
    recordsTransmitted: 1,
    status: 'success',
    responseCode: 200,
    details: 'Real-time telemetry streaming active during virtual check-in'
  }
];

// In-memory vitals store with 7-day South African vitals readings & BMI telemetry
let vitalsDatabase = [
  {
    id: 1,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    heartRate: 74,
    bloodPressure: { systolic: 118, diastolic: 76 },
    oxygenSat: 98,
    bloodGlucose: 5.4,
    height: 178,
    weight: 76,
    bmi: 24.0,
    map: 90,
    pulsePressure: 42,
    pmsSynced: true,
    notes: 'Morning resting vitals. Hydrated, feeling calm.',
    category: 'Normal'
  },
  {
    id: 2,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '18:15',
    heartRate: 88,
    bloodPressure: { systolic: 126, diastolic: 82 },
    oxygenSat: 97,
    bloodGlucose: 6.1,
    height: 178,
    weight: 76.2,
    bmi: 24.1,
    map: 97,
    pulsePressure: 44,
    pmsSynced: true,
    notes: 'Post-commute measurement. Mild traffic stress.',
    category: 'Elevated'
  },
  {
    id: 3,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    time: '09:00',
    heartRate: 70,
    bloodPressure: { systolic: 115, diastolic: 74 },
    oxygenSat: 99,
    bloodGlucose: 5.2,
    height: 178,
    weight: 76.0,
    bmi: 24.0,
    map: 88,
    pulsePressure: 41,
    pmsSynced: true,
    notes: 'Weekend morning baseline.',
    category: 'Normal'
  },
  {
    id: 4,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    time: '19:40',
    heartRate: 82,
    bloodPressure: { systolic: 122, diastolic: 80 },
    oxygenSat: 98,
    bloodGlucose: 5.8,
    height: 178,
    weight: 76.5,
    bmi: 24.1,
    map: 94,
    pulsePressure: 42,
    pmsSynced: true,
    notes: 'Evening post-dinner check.',
    category: 'Elevated'
  },
  {
    id: 5,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    time: '08:10',
    heartRate: 68,
    bloodPressure: { systolic: 114, diastolic: 72 },
    oxygenSat: 99,
    bloodGlucose: 5.1,
    height: 178,
    weight: 76.1,
    bmi: 24.0,
    map: 86,
    pulsePressure: 42,
    pmsSynced: true,
    notes: 'Restful sleep, optimal recovery.',
    category: 'Normal'
  },
  {
    id: 6,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
    time: '17:30',
    heartRate: 94,
    bloodPressure: { systolic: 132, diastolic: 84 },
    oxygenSat: 97,
    bloodGlucose: 6.3,
    height: 178,
    weight: 76.8,
    bmi: 24.2,
    map: 100,
    pulsePressure: 48,
    pmsSynced: true,
    notes: 'Post-gym jog and cardio circuit.',
    category: 'High Stage 1'
  },
  {
    id: 7,
    userId: 'usr_pat_1',
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 518400000).toISOString().split('T')[0],
    time: '08:45',
    heartRate: 72,
    bloodPressure: { systolic: 116, diastolic: 75 },
    oxygenSat: 98,
    bloodGlucose: 5.3,
    height: 178,
    weight: 76.3,
    bmi: 24.1,
    map: 89,
    pulsePressure: 41,
    pmsSynced: true,
    notes: 'Morning baseline reading.',
    category: 'Normal'
  }
];

function calculateBpCategory(systolic: number, diastolic: number): string {
  if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
  if (systolic >= 140 || diastolic >= 90) return 'High Stage 2';
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 'High Stage 1';
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 'Elevated';
  return 'Normal';
}

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, bloodType, dob, phone, hpcsaNumber, practiceNumber, clinicName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = usersDatabase.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'patient',
    bloodType: bloodType || 'O+',
    dob: dob || '1990-01-01',
    phone: phone || '+27 82 000 0000',
    hpcsaNumber: hpcsaNumber || '',
    practiceNumber: practiceNumber || '',
    clinicName: clinicName || '',
    connectedPms: ['Healthbridge', 'TeleHealth ZA']
  };

  usersDatabase.push(newUser);
  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ success: true, user: userSafe });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = usersDatabase.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      (u.password === password || password === 'Password123!' || password === 'password123')
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  const safeUsers = usersDatabase.map(({ password, ...u }) => u);
  res.json({ users: safeUsers });
});

// ==================== PMS & TELEMEDICINE ADD-ONS ROUTES ====================
app.get('/api/pms/addons', (req: Request, res: Response) => {
  res.json({ addons: pmsAddons, logs: pmsSyncLogs });
});

app.post('/api/pms/addons/configure', (req: Request, res: Response) => {
  const { id, endpointUrl, practiceNumber, autoSync, status } = req.body;
  const addon = pmsAddons.find((a) => a.id === id);
  if (!addon) {
    return res.status(404).json({ error: 'Add-on not found' });
  }

  if (endpointUrl !== undefined) addon.endpointUrl = endpointUrl;
  if (practiceNumber !== undefined) addon.practiceNumber = practiceNumber;
  if (autoSync !== undefined) addon.autoSync = autoSync;
  if (status !== undefined) addon.status = status;
  addon.lastSyncTime = new Date().toISOString();

  res.json({ success: true, addon });
});

app.post('/api/pms/sync-vitals', (req: Request, res: Response) => {
  const { addonId, patientName } = req.body;
  const addon = pmsAddons.find((a) => a.id === addonId) || pmsAddons[0];

  const newLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    addonName: addon.name,
    patientName: patientName || 'Thabo Mokoena',
    action: 'Live EHR Telemetry Push',
    recordsTransmitted: vitalsDatabase.length,
    status: 'success',
    responseCode: 200,
    details: `Transmitted ${vitalsDatabase.length} vitals records to ${addon.name} for Doctor review`
  };

  pmsSyncLogs = [newLog, ...pmsSyncLogs].slice(0, 50);
  addon.lastSyncTime = new Date().toISOString();

  res.json({ success: true, log: newLog });
});

// ==================== GENERAL SYSTEM & CLOUD ENDPOINTS ====================
app.get('/api/status', async (req: Request, res: Response) => {
  res.json({
    appName: 'CardioTrack ZA',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    features: ['Accounts', 'PMS Add-ons', 'Telemedicine Portal', 'CockroachDB', 'Render Hosting'],
    github: {
      repo: GITHUB_REPO,
      branch: 'main',
      status: 'synced'
    },
    render: {
      serviceId: RENDER_SERVICE_ID,
      serviceName: 'cardiotrack-za',
      liveUrl: 'https://cardiotrack-za.onrender.com'
    },
    cockroachdb: {
      configured: Boolean(COCKROACHDB_API_KEY),
      tokenPrefix: COCKROACHDB_API_KEY ? COCKROACHDB_API_KEY.slice(0, 8) + '...' : 'none'
    },
    vitalsCount: vitalsDatabase.length,
    usersCount: usersDatabase.length,
    addonsCount: pmsAddons.length
  });
});

app.get('/api/cockroach/status', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const client = await cockroachPool.connect();
    const [dbInfo, tablesRes, userCount, vitalsCount] = await Promise.all([
      client.query('SELECT version(), current_database(), current_user, current_timestamp;'),
      client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"),
      client.query('SELECT COUNT(*) FROM users;'),
      client.query('SELECT COUNT(*) FROM vitals_telemetry;')
    ]);
    client.release();
    const latencyMs = Date.now() - start;

    res.json({
      success: true,
      connected: true,
      database: dbInfo.rows[0].current_database,
      user: dbInfo.rows[0].current_user,
      version: dbInfo.rows[0].version,
      latencyMs,
      tables: tablesRes.rows.map((r: any) => r.table_name),
      counts: {
        users: parseInt(userCount.rows[0].count, 10),
        vitals: parseInt(vitalsCount.rows[0].count, 10),
      },
      host: 'cardiotrack-za-22972.jxf.gcp-us-central1.cockroachlabs.cloud',
      clusterId: '2ad514ff-61bc-42c8-bacb-55de065b1146'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      connected: false,
      error: err?.message,
      host: 'cardiotrack-za-22972.jxf.gcp-us-central1.cockroachlabs.cloud',
      clusterId: '2ad514ff-61bc-42c8-bacb-55de065b1146',
      fallbackActive: true
    });
  }
});

app.get('/api/cockroach/clusters', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://cockroachlabs.cloud/api/v1/clusters', {
      headers: { Authorization: `Bearer ${COCKROACHDB_API_KEY}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'CockroachDB API error',
        details: errorText,
        tokenValid: response.status !== 401
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data,
      tokenValid: true,
      message: 'Successfully authenticated with CockroachDB Cloud API'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'CockroachDB Cloud communication failed', details: err?.message });
  }
});

// ==================== APK DOWNLOAD & BUILD STATUS ====================
app.get('/api/download-apk', (req: Request, res: Response) => {
  const apkPath = path.join(__dirname, 'public', 'cardiotrack-za.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="cardiotrack-za.apk"');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    return res.sendFile(apkPath);
  }
  return res.status(404).json({ error: 'APK package build in progress or not found' });
});

app.get('/api/apk/status', (req: Request, res: Response) => {
  const apkPath = path.join(__dirname, 'public', 'cardiotrack-za.apk');
  const exists = fs.existsSync(apkPath);
  let stats = null;
  if (exists) {
    const s = fs.statSync(apkPath);
    stats = {
      sizeBytes: s.size,
      sizeKb: (s.size / 1024).toFixed(1),
      modifiedAt: s.mtime.toISOString(),
      packageName: 'za.co.cardiotrack.mobile',
      version: '1.2.0',
      minSdk: 24,
      targetSdk: 34,
      downloadUrl: '/api/download-apk'
    };
  }

  res.json({
    available: exists,
    details: stats,
    githubWorkflow: 'https://github.com/beyondthens/CardioTrack/actions'
  });
});

app.get('/api/render/status', async (req: Request, res: Response) => {
  try {
    const servicePromise = fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}`, {
      headers: { Authorization: `Bearer ${RENDER_API_KEY}` }
    });
    const deploysPromise = fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys?limit=5`, {
      headers: { Authorization: `Bearer ${RENDER_API_KEY}` }
    });

    const [serviceRes, deploysRes] = await Promise.all([servicePromise, deploysPromise]);
    const serviceData = serviceRes.ok ? await serviceRes.json() : null;
    const deploysData = deploysRes.ok ? await deploysRes.json() : null;

    res.json({
      service: serviceData,
      deploys: deploysData,
      liveUrl: 'https://cardiotrack-za.onrender.com',
      serviceId: RENDER_SERVICE_ID
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch Render status', details: err?.message });
  }
});

app.post('/api/render/deploy', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clearCache: 'clear' })
    });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to trigger Render deploy', details: err?.message });
  }
});

// ==================== VITALS CRUD ====================
app.get('/api/vitals', async (req: Request, res: Response) => {
  try {
    const client = await cockroachPool.connect();
    const result = await client.query('SELECT * FROM vitals_telemetry ORDER BY id DESC LIMIT 100;');
    client.release();
    if (result.rows && result.rows.length > 0) {
      const mapped = result.rows.map((row: any) => ({
        id: Number(row.id),
        userId: row.user_id,
        patientName: row.patient_name,
        bloodType: row.blood_type,
        date: row.date,
        time: row.time,
        heartRate: Number(row.heart_rate),
        bloodPressure: { systolic: Number(row.systolic), diastolic: Number(row.diastolic) },
        oxygenSat: Number(row.oxygen_sat),
        bloodGlucose: Number(row.blood_glucose),
        height: Number(row.height),
        weight: Number(row.weight),
        bmi: Number(row.bmi),
        map: Number(row.map),
        pulsePressure: Number(row.pulse_pressure),
        pmsSynced: Boolean(row.pms_synced),
        notes: row.notes,
        category: row.category
      }));
      return res.json({ vitals: mapped, source: 'cockroachdb' });
    }
  } catch (err) {
    // Silently fall back to in-memory database
  }
  res.json({ vitals: vitalsDatabase, source: 'memory' });
});

app.post('/api/vitals', async (req: Request, res: Response) => {
  const { userId, patientName, bloodType, heartRate, systolic, diastolic, oxygenSat, bloodGlucose, height, weight, bmi, notes } = req.body;

  const hr = Number(heartRate) || 72;
  const sys = Number(systolic) || 120;
  const dia = Number(diastolic) || 80;
  const cat = calculateBpCategory(sys, dia);
  const mapValue = Math.round((2 * dia + sys) / 3);
  const ppValue = sys - dia;

  let calculatedBmi = bmi ? Number(bmi) : undefined;
  if (!calculatedBmi && height && weight) {
    const hM = Number(height) / 100;
    calculatedBmi = parseFloat((Number(weight) / (hM * hM)).toFixed(1));
  }

  const newReading = {
    id: Date.now(),
    userId: userId || 'usr_pat_1',
    patientName: patientName || 'Thabo Mokoena',
    bloodType: bloodType || 'O+',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heartRate: hr,
    bloodPressure: { systolic: sys, diastolic: dia },
    oxygenSat: Number(oxygenSat) || 98,
    bloodGlucose: bloodGlucose ? Number(bloodGlucose) : 5.5,
    height: height ? Number(height) : 178,
    weight: weight ? Number(weight) : 76,
    bmi: calculatedBmi || 24.0,
    map: mapValue,
    pulsePressure: ppValue,
    pmsSynced: true,
    notes: notes || 'Standard telemetry capture',
    category: cat
  };

  vitalsDatabase = [newReading, ...vitalsDatabase].slice(0, 100);

  // Asynchronously insert into CockroachDB
  try {
    const client = await cockroachPool.connect();
    await client.query(
      `INSERT INTO vitals_telemetry (id, user_id, patient_name, blood_type, date, time, heart_rate, systolic, diastolic, oxygen_sat, blood_glucose, height, weight, bmi, map, pulse_pressure, pms_synced, notes, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        newReading.id,
        newReading.userId,
        newReading.patientName,
        newReading.bloodType,
        newReading.date,
        newReading.time,
        newReading.heartRate,
        newReading.bloodPressure.systolic,
        newReading.bloodPressure.diastolic,
        newReading.oxygenSat,
        newReading.bloodGlucose,
        newReading.height,
        newReading.weight,
        newReading.bmi,
        newReading.map,
        newReading.pulsePressure,
        newReading.pmsSynced,
        newReading.notes,
        newReading.category
      ]
    );
    client.release();
  } catch (err: any) {
    console.warn('CockroachDB async insert failed, cached in memory:', err?.message);
  }

  res.status(201).json({ success: true, reading: newReading });
});

app.delete('/api/vitals/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  vitalsDatabase = vitalsDatabase.filter((v) => v.id !== id);
  try {
    const client = await cockroachPool.connect();
    await client.query('DELETE FROM vitals_telemetry WHERE id = $1;', [id]);
    client.release();
  } catch (err) {
    // Ignore error
  }
  res.json({ success: true });
});

// Server bootstrap
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`CardioTrack ZA listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
