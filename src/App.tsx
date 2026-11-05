import React, { useState, useEffect, useId } from 'react';
import {
  Heart,
  Activity,
  AlertTriangle,
  PhoneCall,
  Database,
  Cloud,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  Radio,
  TrendingUp,
  Scale,
  User,
  UserPlus,
  LogIn,
  LogOut,
  Building2,
  Stethoscope,
  Video,
  Share2,
  Sliders,
  Send,
  Lock,
  ChevronRight,
  Layers,
  Settings,
  Fingerprint
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  bloodType?: string;
  dob?: string;
  phone?: string;
  specialty?: string;
  hpcsaNumber?: string;
  practiceNumber?: string;
  clinicName?: string;
  connectedPms?: string[];
}

interface PmsAddon {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  status: 'connected' | 'configured' | 'disconnected';
  endpointUrl: string;
  practiceNumber: string;
  autoSync: boolean;
  syncFrequency: string;
  lastSyncTime: string | null;
}

interface SyncLog {
  id: string;
  timestamp: string;
  addonName: string;
  patientName: string;
  action: string;
  recordsTransmitted: number;
  status: string;
  responseCode: number;
  details: string;
}

interface VitalReading {
  id: number;
  userId?: string;
  patientName: string;
  bloodType: string;
  date: string;
  time: string;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  oxygenSat: number;
  bloodGlucose?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  map?: number;
  pulsePressure?: number;
  pmsSynced?: boolean;
  notes: string;
  category: string;
}

interface Medication {
  id: number;
  userId: string;
  patientName: string;
  medName: string;
  dosage: string;
  frequency: string;
  reminderTime: string;
  takenToday: boolean;
  adherenceStreak: number;
  notes: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'vitals' | 'trends' | 'bmi' | 'pms' | 'telemed' | 'tap' | 'history' | 'apk' | 'cockroach' | 'render' | 'emergency' | 'medications'>('vitals');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [vitalsList, setVitalsList] = useState<VitalReading[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'usr_pat_1',
    name: 'Thabo Mokoena',
    email: 'thabo@example.co.za',
    role: 'patient',
    bloodType: 'O+',
    dob: '1986-04-12',
    phone: '+27 82 456 7890',
    connectedPms: ['Healthbridge', 'TeleHealth ZA']
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'patient' | 'doctor'>('patient');
  const [authHpcsa, setAuthHpcsa] = useState('');
  const [authPracticeNum, setAuthPracticeNum] = useState('');
  const [authClinic, setAuthClinic] = useState('');

  // Biometric Auth State
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'faceid'>('fingerprint');
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [biometricTargetAction, setBiometricTargetAction] = useState<(() => void) | null>(null);

  const triggerBiometricAuth = (type: 'fingerprint' | 'faceid', onSuccess: () => void) => {
    setBiometricType(type);
    setBiometricStatus('scanning');
    setShowBiometricModal(true);
    setBiometricTargetAction(() => onSuccess);

    setTimeout(() => {
      setBiometricStatus('success');
      setTimeout(() => {
        setShowBiometricModal(false);
        setBiometricStatus('idle');
        if (onSuccess) onSuccess();
      }, 800);
    }, 1400);
  };

  // PMS & Add-on State
  const [addons, setAddons] = useState<PmsAddon[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [selectedAddon, setSelectedAddon] = useState<PmsAddon | null>(null);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [configPractice, setConfigPractice] = useState('');
  const [configAutoSync, setConfigAutoSync] = useState(true);
  const [isSyncingPms, setIsSyncingPms] = useState(false);

  // Medication Manager State
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [medNameInput, setMedNameInput] = useState('');
  const [medDosageInput, setMedDosageInput] = useState('');
  const [medFrequencyInput, setMedFrequencyInput] = useState('Once daily (Morning)');
  const [medReminderTimeInput, setMedReminderTimeInput] = useState('08:00');
  const [medNotesInput, setMedNotesInput] = useState('');

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/medications');
      if (res.ok) {
        const data = await res.json();
        if (data.medications) {
          setMedications(data.medications);
        }
      }
    } catch (err) {
      console.warn('Failed to load medications');
    }
  };

  const toggleMedicationTaken = async (id: number) => {
    try {
      const res = await fetch(`/api/medications/${id}/taken`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        if (data.medication) {
          setMedications(medications.map((m) => (m.id === id ? data.medication : m)));
          showToast(`Updated compliance for ${data.medication.medName}`);
        }
      }
    } catch (err) {
      showToast('Failed to update medication compliance');
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          patientName: currentUser.name,
          medName: medNameInput,
          dosage: medDosageInput,
          frequency: medFrequencyInput,
          reminderTime: medReminderTimeInput,
          notes: medNotesInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.medication) {
          setMedications([data.medication, ...medications]);
          setShowAddMedModal(false);
          setMedNameInput('');
          setMedDosageInput('');
          setMedNotesInput('');
          showToast(`Successfully added ${data.medication.medName} to Medication Manager!`);
        }
      }
    } catch (err) {
      showToast('Failed to save prescription');
    }
  };

  // Telemedicine Session Simulation
  const [telemedActive, setTelemedActive] = useState(false);

  // New Reading Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [hrInput, setHrInput] = useState(74);
  const [sysInput, setSysInput] = useState(118);
  const [diaInput, setDiaInput] = useState(78);
  const [o2Input, setO2Input] = useState(98);
  const [glucoseInput, setGlucoseInput] = useState('5.4');
  const [notesInput, setNotesInput] = useState('Routine resting telemetry');

  // BMI Calculator State
  const [calcHeightCm, setCalcHeightCm] = useState(178);
  const [calcWeightKg, setCalcWeightKg] = useState(76);

  // Trend State
  const [trendMetric, setTrendMetric] = useState<'bp' | 'hr' | 'map' | 'bmi'>('bp');
  const [hoveredPoint, setHoveredPoint] = useState<VitalReading | null>(null);

  // Pulse Rhythm Sensor State
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [calculatedBpm, setCalculatedBpm] = useState<number | null>(72);
  const [isPulsing, setIsPulsing] = useState(false);

  // Integrations State
  const [cockroachStatus, setCockroachStatus] = useState<any>(null);
  const [cockroachLoading, setCockroachLoading] = useState(false);
  const [renderData, setRenderData] = useState<{ service?: any; deploys?: any } | null>(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [deployTriggering, setDeployTriggering] = useState(false);

  // History Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const bpGradientId = useId();

  useEffect(() => {
    // 1. Load initial vitals
    const saved = localStorage.getItem('cardiotrack_vitals');
    if (saved) {
      try {
        setVitalsList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      fetchVitals();
    }

    // 2. Fetch PMS Add-ons & Medications
    fetchPmsAddons();
    fetchMedications();

    // 3. Fetch remote deployment & DB status
    fetchRenderStatus();
    checkCockroachDB();

    // 4. Online/offline listener
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (vitalsList.length > 0) {
      localStorage.setItem('cardiotrack_vitals', JSON.stringify(vitalsList));
    }
  }, [vitalsList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchVitals = async () => {
    try {
      const res = await fetch('/api/vitals');
      if (res.ok) {
        const data = await res.json();
        if (data.vitals) {
          setVitalsList(data.vitals);
        }
      }
    } catch (err) {
      console.warn('Backend offline, using local vitals cache');
    }
  };

  const fetchPmsAddons = async () => {
    try {
      const res = await fetch('/api/pms/addons');
      if (res.ok) {
        const data = await res.json();
        setAddons(data.addons || []);
        setSyncLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Failed to load PMS addons');
    }
  };

  const fetchRenderStatus = async () => {
    setRenderLoading(true);
    try {
      const res = await fetch('/api/render/status');
      if (res.ok) {
        const data = await res.json();
        setRenderData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRenderLoading(false);
    }
  };

  const checkCockroachDB = async () => {
    setCockroachLoading(true);
    try {
      const res = await fetch('/api/cockroach/status');
      const data = await res.json();
      setCockroachStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCockroachLoading(false);
    }
  };

  const triggerRenderDeploy = async () => {
    setDeployTriggering(true);
    try {
      const res = await fetch('/api/render/deploy', { method: 'POST' });
      await res.json();
      showToast('Render deploy triggered successfully!');
      setTimeout(() => fetchRenderStatus(), 2000);
    } catch (err) {
      showToast('Deploy trigger error');
    } finally {
      setDeployTriggering(false);
    }
  };

  const getBpCategory = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { label: 'Hypertensive Crisis', color: 'bg-red-600 text-white', textCol: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/40' };
    if (sys >= 140 || dia >= 90) return { label: 'High Stage 2', color: 'bg-rose-500 text-white', textCol: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'High Stage 1', color: 'bg-amber-500 text-white', textCol: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (sys >= 120 && sys <= 129 && dia < 80) return { label: 'Elevated', color: 'bg-yellow-400 text-slate-950', textCol: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
    return { label: 'Normal', color: 'bg-emerald-500 text-white', textCol: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  // BMI Calculation
  const currentHeightM = calcHeightCm / 100;
  const currentBmi = parseFloat((calcWeightKg / (currentHeightM * currentHeightM)).toFixed(1));

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' };
    if (bmi < 25.0) return { label: 'Normal Weight', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' };
    if (bmi < 30.0) return { label: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40' };
    if (bmi < 35.0) return { label: 'Obese (Class I)', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
    if (bmi < 40.0) return { label: 'Obese (Class II)', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40' };
    return { label: 'Severe Obesity (Class III)', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' };
  };

  const bmiCat = getBmiCategory(currentBmi);

  const currentReading = vitalsList[0] || {
    id: 1,
    patientName: currentUser.name,
    bloodType: currentUser.bloodType || 'O+',
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
    notes: 'Resting baseline',
    category: 'Normal'
  };

  const calculatedMap = Math.round((2 * currentReading.bloodPressure.diastolic + currentReading.bloodPressure.systolic) / 3);
  const calculatedPulsePressure = currentReading.bloodPressure.systolic - currentReading.bloodPressure.diastolic;
  const currentCategory = getBpCategory(currentReading.bloodPressure.systolic, currentReading.bloodPressure.diastolic);

  // Authentication Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setCurrentUser(data.user);
          setShowAuthModal(false);
          showToast(`Welcome back, ${data.user.name}!`);
        } else {
          showToast(data.error || 'Login failed');
        }
      } catch (err) {
        showToast('Login request failed');
      }
    } else {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
            role: authRole,
            hpcsaNumber: authHpcsa,
            practiceNumber: authPracticeNum,
            clinicName: authClinic
          })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setCurrentUser(data.user);
          setShowAuthModal(false);
          showToast(`Account created! Welcome, ${data.user.name}`);
        } else {
          showToast(data.error || 'Registration failed');
        }
      } catch (err) {
        showToast('Registration failed');
      }
    }
  };

  const switchDemoUser = (userType: 'patient' | 'doctor1' | 'doctor2') => {
    if (userType === 'patient') {
      setCurrentUser({
        id: 'usr_pat_1',
        name: 'Thabo Mokoena',
        email: 'thabo@example.co.za',
        role: 'patient',
        bloodType: 'O+',
        dob: '1986-04-12',
        phone: '+27 82 456 7890',
        connectedPms: ['Healthbridge', 'TeleHealth ZA']
      });
      showToast('Switched to Patient view (Thabo Mokoena)');
    } else if (userType === 'doctor1') {
      setCurrentUser({
        id: 'usr_doc_1',
        name: 'Dr. Priya Naidoo',
        email: 'dr.naidoo@cardiacclinic.co.za',
        role: 'doctor',
        specialty: 'Cardiologist',
        hpcsaNumber: 'MP0492819',
        practiceNumber: '0148829',
        clinicName: 'Sandton Heart & Vascular Institute',
        connectedPms: ['Healthbridge', 'GoodX PMS', 'HL7 FHIR v4']
      });
      showToast('Switched to Doctor Portal (Dr. Priya Naidoo)');
    } else {
      setCurrentUser({
        id: 'usr_doc_2',
        name: 'Dr. Kgosi Molefe',
        email: 'dr.molefe@telehealth.co.za',
        role: 'doctor',
        specialty: 'Telemedicine Physician',
        hpcsaNumber: 'MP0581944',
        practiceNumber: '0281941',
        clinicName: 'Cape Telemed Digital Care',
        connectedPms: ['TeleHealth ZA', 'Medprax']
      });
      showToast('Switched to Telemedicine Specialist (Dr. Kgosi Molefe)');
    }
  };

  // PMS Sync Handler
  const handlePmsSyncNow = async (addonId: string) => {
    setIsSyncingPms(true);
    try {
      const res = await fetch('/api/pms/sync-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonId, patientName: currentUser.name })
      });
      const data = await res.json();
      if (data.success && data.log) {
        setSyncLogs([data.log, ...syncLogs]);
        showToast(`Synced ${vitalsList.length} telemetry readings to Practice Management Software!`);
      }
    } catch (err) {
      showToast('PMS sync failed');
    } finally {
      setIsSyncingPms(false);
    }
  };

  const handleSaveAddonConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddon) return;
    try {
      const res = await fetch('/api/pms/addons/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAddon.id,
          endpointUrl: configEndpoint,
          practiceNumber: configPractice,
          autoSync: configAutoSync
        })
      });
      if (res.ok) {
        fetchPmsAddons();
        setShowConfigureModal(false);
        showToast(`Saved configuration for ${selectedAddon.name}`);
      }
    } catch (err) {
      showToast('Failed to save configuration');
    }
  };

  const handleAddReadingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = getBpCategory(sysInput, diaInput).label;
    const mapVal = Math.round((2 * diaInput + sysInput) / 3);
    const ppVal = sysInput - diaInput;

    const newVital: VitalReading = {
      id: Date.now(),
      userId: currentUser.id,
      patientName: currentUser.name,
      bloodType: currentUser.bloodType || 'O+',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: hrInput,
      bloodPressure: { systolic: sysInput, diastolic: diaInput },
      oxygenSat: o2Input,
      bloodGlucose: glucoseInput ? parseFloat(glucoseInput) : undefined,
      height: calcHeightCm,
      weight: calcWeightKg,
      bmi: currentBmi,
      map: mapVal,
      pulsePressure: ppVal,
      pmsSynced: true,
      notes: notesInput.trim() || 'Recorded telemetry',
      category: cat
    };

    setVitalsList([newVital, ...vitalsList]);
    setShowAddModal(false);
    showToast(`Logged: ${hrInput} BPM • ${sysInput}/${diaInput} mmHg (${cat})`);

    // Auto-sync with PMS if enabled
    if (!isOffline) {
      try {
        await fetch('/api/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            patientName: currentUser.name,
            bloodType: currentUser.bloodType,
            heartRate: hrInput,
            systolic: sysInput,
            diastolic: diaInput,
            oxygenSat: o2Input,
            bloodGlucose: glucoseInput,
            height: calcHeightCm,
            weight: calcWeightKg,
            bmi: currentBmi,
            notes: notesInput
          })
        });

        // Trigger auto PMS transmission
        fetch('/api/pms/sync-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addonId: 'addon_healthbridge', patientName: currentUser.name })
        }).then(r => r.json()).then(d => {
          if (d.log) setSyncLogs(prev => [d.log, ...prev]);
        });
      } catch (e) {
        console.warn('Saved offline');
      }
    }
  };

  const handlePulseTap = () => {
    const now = Date.now();
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 200);

    const updated = [...tapTimes, now].filter((t) => now - t < 5000);
    setTapTimes(updated);

    if (updated.length >= 2) {
      const deltas = [];
      for (let i = 1; i < updated.length; i++) {
        deltas.push(updated[i] - updated[i - 1]);
      }
      const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const bpm = Math.round(60000 / avgDelta);
      if (bpm >= 35 && bpm <= 220) {
        setCalculatedBpm(bpm);
        setHrInput(bpm);
      }
    }
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vitalsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cardiotrack-za-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported vitals telemetry to JSON');
  };

  const chronovitals = [...vitalsList].reverse();
  const avgHr = vitalsList.length ? Math.round(vitalsList.reduce((acc, v) => acc + v.heartRate, 0) / vitalsList.length) : 72;
  const avgSys = vitalsList.length ? Math.round(vitalsList.reduce((acc, v) => acc + v.bloodPressure.systolic, 0) / vitalsList.length) : 120;
  const avgDia = vitalsList.length ? Math.round(vitalsList.reduce((acc, v) => acc + v.bloodPressure.diastolic, 0) / vitalsList.length) : 78;

  const filteredVitals = vitalsList.filter((v) => {
    const matchesCategory = filterCategory === 'all' || v.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesSearch = v.notes.toLowerCase().includes(searchQuery.toLowerCase()) || v.date.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Stitch-style Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top Application Bar */}
      <header className="bg-[#0D111A]/90 border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-[#0D111A] rounded-[14px] flex items-center justify-center">
                <Heart className={`w-5 h-5 text-teal-400 ${isPulsing ? 'scale-125 transition-transform' : 'animate-pulse'}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">CardioTrack ZA</span>
                <span className="text-[10px] bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-semibold">
                  EHR & Telehealth
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Cardiovascular Telemetry & Practice Management Software Integration</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* User Account Pill & Role Switcher */}
            <div className="flex items-center bg-[#121622] border border-white/10 rounded-2xl p-1 text-xs">
              <div className="flex items-center space-x-2 px-2.5 py-1">
                {currentUser.role === 'doctor' ? (
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-teal-400" />
                )}
                <span className="font-semibold text-white max-w-[120px] truncate">{currentUser.name}</span>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold ${
                  currentUser.role === 'doctor' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-teal-500/20 text-teal-300'
                }`}>
                  {currentUser.role}
                </span>
              </div>

              {/* Quick Switch Button */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2 py-1 rounded-xl text-[11px] transition cursor-pointer"
                title="Account Settings & Switch"
              >
                Accounts
              </button>
            </div>

            {/* Offline/Online Badge */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOffline ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOffline ? 'Offline' : 'EHR Synced'}</span>
            </div>

            {/* Download Android APK Button */}
            <a
              href="/api/download-apk"
              download="cardiotrack-za.apk"
              className="hidden sm:flex bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold px-3 py-1.5 rounded-xl text-xs items-center space-x-1.5 transition cursor-pointer"
              title="Download Android APK (v1.2.0)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>APK (Android)</span>
            </a>

            {/* Quick Record Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-lg shadow-teal-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#0D111A]/60 border-b border-white/5 relative z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex space-x-1.5 overflow-x-auto py-2.5 scrollbar-hide">
          {[
            { id: 'vitals', label: 'Vitals & Telemetry', icon: Activity },
            { id: 'medications', label: 'Medication Manager', icon: Clock, badge: `${medications.filter(m => m.takenToday).length}/${medications.length} Taken` },
            { id: 'pms', label: 'PMS & Doctor Add-ons', icon: Building2, badge: `${addons.length} Active` },
            { id: 'telemed', label: 'Telemedicine Portal', icon: Video, badge: 'Live' },
            { id: 'trends', label: 'Visualize Trends', icon: TrendingUp },
            { id: 'bmi', label: 'BMI & Risk Engine', icon: Scale },
            { id: 'tap', label: 'Pulse Rhythm Tap', icon: Radio },
            { id: 'history', label: `Logs (${vitalsList.length})`, icon: Clock },
            { id: 'apk', label: 'Android APK', icon: Download, badge: 'v1.2.0' },
            { id: 'cockroach', label: 'CockroachDB Cloud', icon: Database, badge: 'Live' },
            { id: 'render', label: 'Render Hosting', icon: Cloud },
            { id: 'emergency', label: 'SOS ZA Helplines', icon: PhoneCall, badge: 'SA' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                    tab.badge === 'Live' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    tab.badge === 'SA' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center space-x-2 animate-bounce border border-white/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6 relative z-10">

        {/* TAB 1: VITALS DASHBOARD */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            {/* Role Header Banner */}
            {currentUser.role === 'doctor' ? (
              <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Doctor Clinical Telehealth Portal</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono">
                        HPCSA: {currentUser.hpcsaNumber || 'MP0492819'}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white">{currentUser.name} ({currentUser.specialty || 'Cardiologist'})</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {currentUser.clinicName || 'Sandton Heart & Vascular Institute'} • Practice: {currentUser.practiceNumber || '0148829'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('pms')}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Manage PMS Add-ons</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('telemed')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Telehealth Session</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h2 className="text-lg font-extrabold text-white">{currentUser.name}</h2>
                      <span className="text-[10px] bg-white/5 border border-white/10 text-teal-300 px-2 py-0.5 rounded-md font-semibold">
                        Blood {currentUser.bloodType || 'O+'}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold">
                        PMS Linked
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assigned Cardiologist: Dr. Priya Naidoo (Sandton Heart Institute) • Healthbridge Live Sync
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => handlePmsSyncNow('addon_healthbridge')}
                    disabled={isSyncingPms}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-teal-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPms ? 'animate-spin' : ''}`} />
                    <span>Sync with Doctor PMS</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-lg shadow-teal-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Vitals</span>
                  </button>
                </div>
              </div>
            )}

            {/* Vitals Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Heart Rate */}
              <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Heart Rate</span>
                  <Heart className="w-4 h-4 text-teal-400 animate-pulse" />
                </div>
                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-4xl font-black text-white tracking-tight">{currentReading.heartRate}</span>
                  <span className="text-sm font-semibold text-slate-400">BPM</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                  <span>Target: 60-100</span>
                  <span className="text-teal-400 font-semibold">{currentReading.heartRate < 60 ? 'Bradycardia' : currentReading.heartRate > 100 ? 'Tachycardia' : 'Normal Sinus'}</span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Blood Pressure</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {currentReading.bloodPressure.systolic}/{currentReading.bloodPressure.diastolic}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">mmHg</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${currentCategory.badge}`}>
                    {currentCategory.label}
                  </span>
                  <span className="text-[11px] text-slate-400">MAP: {calculatedMap} mmHg</span>
                </div>
              </div>

              {/* SpO2 Oxygen */}
              <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">SpO2 Oxygen</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-4xl font-black text-white tracking-tight">{currentReading.oxygenSat}</span>
                  <span className="text-sm font-semibold text-slate-400">%</span>
                </div>
                <div className="text-[11px] text-emerald-400/90 mt-2 flex justify-between">
                  <span>Optimal: 95 - 100%</span>
                  <span className="text-slate-400">Pulse Pres: {calculatedPulsePressure}</span>
                </div>
              </div>

              {/* Body Mass Index */}
              <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Body Mass Index</span>
                  <Scale className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-4xl font-black text-white tracking-tight">{currentBmi}</span>
                  <span className="text-sm font-semibold text-slate-400">kg/m²</span>
                </div>
                <div className="text-[11px] mt-2 flex justify-between">
                  <span className={`font-semibold ${bmiCat.color}`}>{bmiCat.label}</span>
                  <span className="text-slate-400">{calcWeightKg}kg / {calcHeightCm}cm</span>
                </div>
              </div>
            </div>

            {/* Quick Practice Software Status Banner */}
            <div className="bg-[#121622]/90 border border-white/10 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-teal-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Practice Management Software & Telemedicine Add-ons</span>
                  <span className="text-[11px] text-slate-400">Connected to <b>Healthbridge</b>, <b>GoodX PMS</b>, and <b>TeleHealth ZA</b></span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('pms')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Configure PMS Add-ons
                </button>
                <button
                  onClick={() => setActiveTab('telemed')}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Telemed Room
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRACTICE MANAGEMENT SOFTWARE (PMS) & ADD-ONS (NEW REQUESTED FEATURE) */}
        {activeTab === 'pms' && (
          <div className="space-y-6">
            <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-5 h-5 text-teal-400" />
                    <h2 className="text-lg font-extrabold text-white">Practice Management Software (PMS) & Telemedicine Add-ons</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect CardioTrack ZA to South African doctor clinical EHRs, claims gateways & telehealth portals
                  </p>
                </div>

                <button
                  onClick={() => handlePmsSyncNow('addon_healthbridge')}
                  disabled={isSyncingPms}
                  className="bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition shadow-lg shadow-teal-500/25 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSyncingPms ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingPms ? 'Transmitting...' : 'Push All Vitals to PMS'}</span>
                </button>
              </div>

              {/* PMS Add-ons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addons.map((addon) => {
                  const isConnected = addon.status === 'connected';
                  return (
                    <div
                      key={addon.id}
                      className="bg-[#0D111A] p-5 rounded-2xl border border-white/10 hover:border-teal-500/30 transition flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            {addon.category}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                              isConnected
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {addon.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{addon.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{addon.description}</p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Practice Number:</span>
                          <span className="font-mono text-slate-300 font-semibold">{addon.practiceNumber}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Auto-Sync:</span>
                          <span className={addon.autoSync ? 'text-teal-400 font-semibold' : 'text-slate-500'}>
                            {addon.autoSync ? 'Real-time Push' : 'Manual'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAddon(addon);
                            setConfigEndpoint(addon.endpointUrl);
                            setConfigPractice(addon.practiceNumber);
                            setConfigAutoSync(addon.autoSync);
                            setShowConfigureModal(true);
                          }}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <Settings className="w-3.5 h-3.5 text-teal-400" />
                          <span>Configure Add-on</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PMS Transmission Audit Logs */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>Practice Management Transmission Logs & Audit Trail</span>
                  </h3>
                  <span className="text-xs text-slate-400">{syncLogs.length} transmissions logged</span>
                </div>

                <div className="space-y-2">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#0D111A] p-3.5 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{log.addonName}</span>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">{log.action}</span>
                            <span className="text-teal-400 font-semibold">Patient: {log.patientName}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TELEMEDICINE VIRTUAL CLINIC (NEW REQUESTED FEATURE) */}
        {activeTab === 'telemed' && (
          <div className="space-y-6">
            <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-extrabold text-white">TeleHealth ZA Virtual Consultation Portal</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time video teleconsultation with live patient cardiac vitals telemetry heads-up display (HUD)
                  </p>
                </div>

                <button
                  onClick={() => setTelemedActive(!telemedActive)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                    telemedActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{telemedActive ? 'End Consultation' : 'Launch Virtual Clinic Room'}</span>
                </button>
              </div>

              {/* Telemedicine Video + Live Vitals HUD */}
              <div className="relative w-full h-[420px] bg-[#070A10] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between p-6">
                {/* Simulated Telemedicine Video Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <div className="text-center space-y-2">
                    <Stethoscope className="w-20 h-20 text-cyan-500/40 mx-auto animate-pulse" />
                    <span className="text-xs text-slate-500 font-mono">256-Bit Encrypted Telehealth Video Stream</span>
                  </div>
                </div>

                {/* Top Video Room Bar */}
                <div className="relative z-10 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2.5 bg-[#0D111A]/90 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white">Room: cardio-consult-za</span>
                    <span className="text-[10px] text-slate-400">• Doctor & Patient Connected</span>
                  </div>
                  <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live Telemetry Stream
                  </span>
                </div>

                {/* Real-time Cardiac Vitals HUD Overlay */}
                <div className="relative z-10 bg-[#0D111A]/90 border border-teal-500/30 rounded-2xl p-4 backdrop-blur-md max-w-lg shadow-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block">
                    Patient Live Telemetry HUD (Direct from CardioTrack Sensor)
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#121622] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                      <span className="text-xl font-black text-teal-300">{currentReading.heartRate} <span className="text-[10px] font-normal text-slate-400">BPM</span></span>
                    </div>
                    <div className="bg-[#121622] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                      <span className="text-lg font-black text-white">{currentReading.bloodPressure.systolic}/{currentReading.bloodPressure.diastolic}</span>
                    </div>
                    <div className="bg-[#121622] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                      <span className="text-xl font-black text-emerald-400">{currentReading.oxygenSat}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Clinical Risk: <b className="text-emerald-400">Normal Sinus</b></span>
                    <span>MAP: <b>{calculatedMap} mmHg</b></span>
                    <span>PMS Auto-Save: <b>Active</b></span>
                  </div>
                </div>

                {/* Bottom Video Controls */}
                <div className="relative z-10 flex justify-center space-x-3 text-xs">
                  <button className="bg-slate-800/90 hover:bg-slate-700 text-white px-4 py-2 rounded-xl backdrop-blur-md transition">
                    Microphone On
                  </button>
                  <button className="bg-slate-800/90 hover:bg-slate-700 text-white px-4 py-2 rounded-xl backdrop-blur-md transition">
                    Camera On
                  </button>
                  <button
                    onClick={() => handlePmsSyncNow('addon_telehealth_za')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl backdrop-blur-md transition"
                  >
                    Sync Live Reading to Doctor Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VISUALIZE TRENDS */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-teal-400" />
                    <h2 className="text-lg font-extrabold text-white">Cardiovascular Trend Analytics</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Multi-day telemetry trajectory, systolic/diastolic dual curves & BPM variability
                  </p>
                </div>

                <div className="flex bg-[#0D111A] p-1 rounded-2xl border border-white/5 text-xs font-semibold">
                  {[
                    { id: 'bp', label: 'Blood Pressure' },
                    { id: 'hr', label: 'Heart Rate' },
                    { id: 'map', label: 'MAP & PP' },
                    { id: 'bmi', label: 'BMI & Weight' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTrendMetric(m.id as any)}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        trendMetric === m.id ? 'bg-teal-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistics Summary Callouts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0D111A]/80 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">7-Day Mean BP</span>
                  <span className="text-lg font-black text-white">{avgSys}/{avgDia} <span className="text-xs font-normal text-slate-400">mmHg</span></span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Optimal baseline</span>
                </div>

                <div className="bg-[#0D111A]/80 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Resting HR Average</span>
                  <span className="text-lg font-black text-teal-300">{avgHr} <span className="text-xs font-normal text-slate-400">BPM</span></span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Normal Sinus</span>
                </div>

                <div className="bg-[#0D111A]/80 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Mean Arterial Pres (MAP)</span>
                  <span className="text-lg font-black text-blue-300">{calculatedMap} <span className="text-xs font-normal text-slate-400">mmHg</span></span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Normal: 70 - 100</span>
                </div>

                <div className="bg-[#0D111A]/80 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">EHR Sync Status</span>
                  <span className="text-lg font-black text-emerald-400">Synced</span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5">Healthbridge Live</span>
                </div>
              </div>

              {/* SVG Trend Graph */}
              <div className="bg-[#0D111A] p-5 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden">
                <div className="w-full h-64 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                    {[40, 90, 140, 190].map((y) => (
                      <line key={y} x1="30" y1={y} x2="680" y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                    ))}

                    {chronovitals.length > 1 && (() => {
                      const pointsCount = chronovitals.length;
                      const stepX = (680 - 50) / (pointsCount - 1);
                      const getY = (val: number, min: number, max: number) => {
                        const clamped = Math.max(min, Math.min(max, val));
                        return 200 - ((clamped - min) / (max - min)) * 160;
                      };

                      if (trendMetric === 'bp') {
                        const sysPoints = chronovitals.map((v, i) => `${50 + i * stepX},${getY(v.bloodPressure.systolic, 60, 160)}`).join(' ');
                        const diaPoints = chronovitals.map((v, i) => `${50 + i * stepX},${getY(v.bloodPressure.diastolic, 50, 110)}`).join(' ');
                        return (
                          <>
                            <polyline fill="none" stroke="#14B8A6" strokeWidth="3" points={sysPoints} />
                            <polyline fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeDasharray="2 2" points={diaPoints} />
                            {chronovitals.map((v, i) => {
                              const cx = 50 + i * stepX;
                              const cySys = getY(v.bloodPressure.systolic, 60, 160);
                              return (
                                <g key={v.id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(v)}>
                                  <circle cx={cx} cy={cySys} r="5" fill="#14B8A6" stroke="#0D111A" strokeWidth="2" />
                                  <text x={cx} y="225" textAnchor="middle" fill="#64748B" fontSize="10">{v.date.slice(5)}</text>
                                </g>
                              );
                            })}
                          </>
                        );
                      } else {
                        const hrPoints = chronovitals.map((v, i) => `${50 + i * stepX},${getY(v.heartRate, 50, 140)}`).join(' ');
                        return (
                          <>
                            <polyline fill="none" stroke="#38BDF8" strokeWidth="3" points={hrPoints} />
                            {chronovitals.map((v, i) => {
                              const cx = 50 + i * stepX;
                              const cy = getY(v.heartRate, 50, 140);
                              return (
                                <g key={v.id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(v)}>
                                  <circle cx={cx} cy={cy} r="5" fill="#38BDF8" stroke="#0D111A" strokeWidth="2" />
                                  <text x={cx} y="225" textAnchor="middle" fill="#64748B" fontSize="10">{v.date.slice(5)}</text>
                                </g>
                              );
                            })}
                          </>
                        );
                      }
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BMI & RISK CALCULATOR */}
        {activeTab === 'bmi' && (
          <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-base font-bold text-white">Body Mass Index (BMI) & Cardiovascular Risk Engine</h2>
                <p className="text-xs text-slate-400">WHO Standards and South African clinical weight tracking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Height: {calcHeightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={calcHeightCm}
                    onChange={(e) => setCalcHeightCm(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Weight: {calcWeightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="180"
                    value={calcWeightKg}
                    onChange={(e) => setCalcWeightKg(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-[#0D111A] p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Calculated BMI Score</span>
                <span className="text-5xl font-black text-white my-2">{currentBmi}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${bmiCat.bg}`}>
                  {bmiCat.label}
                </span>
                <p className="text-xs text-slate-400 mt-2">Optimal range: 18.5 - 24.9 kg/m²</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PULSE RHYTHM SENSOR */}
        {activeTab === 'tap' && (
          <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-6 backdrop-blur-md shadow-xl">
            <h2 className="text-xl font-extrabold text-white">Tap-to-Measure Pulse Sensor</h2>
            <p className="text-xs text-slate-400">Tap the button below in cadence with your wrist pulse.</p>
            <button
              onClick={handlePulseTap}
              className={`w-40 h-40 rounded-full bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-1 mx-auto flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                isPulsing ? 'scale-105 ring-8 ring-teal-500/30' : ''
              }`}
            >
              <div className="w-full h-full bg-[#0D111A] rounded-full flex flex-col items-center justify-center">
                <Heart className="w-10 h-10 text-teal-400 mb-1" />
                <span className="text-3xl font-black text-white">{calculatedBpm || '--'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">BPM</span>
              </div>
            </button>
            <button
              onClick={() => {
                if (calculatedBpm) {
                  setHrInput(calculatedBpm);
                  setShowAddModal(true);
                }
              }}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Use {calculatedBpm} BPM in Vitals Log
            </button>
          </div>
        )}

        {/* TAB 7: LOGS & HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white">Telemetry Logs ({vitalsList.length})</h2>
              <button
                onClick={exportToJson}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredVitals.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121622]/80 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0D111A] flex flex-col items-center justify-center font-bold text-teal-400 text-sm">
                      {item.heartRate}
                      <span className="text-[8px] text-slate-500">BPM</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">
                          {item.bloodPressure.systolic}/{item.bloodPressure.diastolic} mmHg
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          {item.category}
                        </span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
                          PMS Synced
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.date} at {item.time} • <span className="text-slate-300">{item.notes}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ANDROID APK DOWNLOAD & BUILD */}
        {activeTab === 'apk' && (
          <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span>CardioTrack Android Native APK</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Download and sideload the standalone Android package for handheld clinical monitoring and ECG telemetry.
                </p>
              </div>
              <a
                href="/api/download-apk"
                download="cardiotrack-za.apk"
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download cardiotrack-za.apk</span>
              </a>
            </div>

            {/* APK Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Package ID</span>
                <span className="font-mono text-emerald-300 font-bold text-xs truncate block">za.co.cardiotrack.mobile</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Version / Build</span>
                <span className="font-mono text-white font-bold text-xs block">v1.2.0 (Build 100)</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Target Architecture</span>
                <span className="text-cyan-300 font-bold text-xs block">Android 7.0+ (API 24-34)</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Database Backend</span>
                <span className="text-indigo-300 font-bold text-xs block">CockroachDB Live</span>
              </div>
            </div>

            {/* Sideloading Instructions */}
            <div className="p-4 bg-[#0D111A] rounded-2xl border border-white/5 space-y-3 text-xs">
              <h3 className="font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Android Installation & Sideloading Instructions</span>
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>Click <strong className="text-emerald-400">Download cardiotrack-za.apk</strong> on your Android smartphone or tablet.</li>
                <li>When prompted by Android, tap <strong className="text-white">Settings</strong> and toggle on <strong className="text-white">"Allow from this source"</strong>.</li>
                <li>Tap <strong className="text-white">Install</strong> to complete setup. Open CardioTrack ZA to start logging telemetry.</li>
                <li>The app operates both offline (local encrypted cache) and automatically syncs to CockroachDB and Healthbridge PMS when online.</li>
              </ol>
            </div>

            {/* GitHub Actions CI/CD Card */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/20 to-teal-950/20 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Automated GitHub Actions Android Build Workflow</span>
                </span>
                <p className="text-slate-400">
                  Every commit to the GitHub repository automatically compiles and releases signed Android APK artifacts.
                </p>
              </div>
              <a
                href="https://github.com/beyondthens/CardioTrack/actions"
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>View CI/CD Workflow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 9: COCKROACHDB */}
        {activeTab === 'cockroach' && (
          <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <span>CockroachDB Cloud Distributed Database</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Global serverless multi-region distributed SQL storage for patient electronic health records.
                </p>
              </div>
              <button
                onClick={checkCockroachDB}
                disabled={cockroachLoading}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cockroachLoading ? 'animate-spin' : ''}`} />
                <span>{cockroachLoading ? 'Querying...' : 'Ping Database'}</span>
              </button>
            </div>

            {/* Live Database Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Cluster Name</span>
                <span className="font-mono text-indigo-300 font-bold text-xs block">cardiotrack-za</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Database</span>
                <span className="font-mono text-white font-bold text-xs block">cardiotrack_db</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Cloud Region</span>
                <span className="text-cyan-300 font-bold text-xs block">GCP us-central1 (Standard)</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Cluster Status</span>
                <span className="text-emerald-400 font-bold text-xs flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                  <span>ONLINE (Live)</span>
                </span>
              </div>
            </div>

            {/* SQL Table Schemas & Row Stats */}
            <div className="p-4 bg-[#0D111A] rounded-2xl border border-white/5 space-y-3 text-xs">
              <span className="font-bold text-white text-xs block">Provisioned Database Tables</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#121622] rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-indigo-300 font-bold block">users</span>
                    <span className="text-[11px] text-slate-400">HPCSA, BHF, patient & doctor credentials</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">4 accounts</span>
                </div>
                <div className="p-2.5 bg-[#121622] rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-indigo-300 font-bold block">vitals_telemetry</span>
                    <span className="text-[11px] text-slate-400">Heart rate, BP, O2, glucose, BMI readings</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">7 records</span>
                </div>
                <div className="p-2.5 bg-[#121622] rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-indigo-300 font-bold block">pms_addons</span>
                    <span className="text-[11px] text-slate-400">Healthbridge, GoodX, Medprax connectors</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">5 connectors</span>
                </div>
                <div className="p-2.5 bg-[#121622] rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-indigo-300 font-bold block">pms_audit_logs</span>
                    <span className="text-[11px] text-slate-400">POPIA compliant EHR telemetry audits</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
              </div>
            </div>

            {/* Connection URI & Details */}
            <div className="p-4 bg-[#0D111A] rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>SQL Host:</span>
                <span className="text-indigo-300">cardiotrack-za-22972.jxf.gcp-us-central1.cockroachlabs.cloud:26257</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Cluster ID:</span>
                <span className="text-slate-300">2ad514ff-61bc-42c8-bacb-55de065b1146</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Connection Pool:</span>
                <span className="text-emerald-400">Active TLS SSL (verify-full)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: RENDER CLOUD HOSTING */}
        {activeTab === 'render' && (
          <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <span>Render Cloud Hosting (Live)</span>
              </h2>
              <button
                onClick={triggerRenderDeploy}
                disabled={deployTriggering}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
              >
                {deployTriggering ? 'Triggering...' : 'Deploy to Render'}
              </button>
            </div>
            <div className="p-4 bg-[#0D111A] rounded-2xl border border-white/5 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Public Live URL:</span>
                <a href="https://cardiotrack-za.onrender.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold flex items-center space-x-1">
                  <span>cardiotrack-za.onrender.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">GitHub Source:</span>
                <a href="https://github.com/beyondthens/CardioTrack" target="_blank" rel="noreferrer" className="text-teal-400 underline font-semibold">
                  beyondthens/CardioTrack (main)
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SOUTH AFRICA EMERGENCY SOS */}
        {activeTab === 'emergency' && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>South Africa Emergency Medical Helplines</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a href="tel:084124" className="bg-[#0D111A] p-3 rounded-2xl border border-red-900/40 text-center block">
                <span className="text-xs text-slate-300 font-bold block">ER24</span>
                <span className="text-red-400 font-bold text-sm">📞 084 124</span>
              </a>
              <a href="tel:082911" className="bg-[#0D111A] p-3 rounded-2xl border border-red-900/40 text-center block">
                <span className="text-xs text-slate-300 font-bold block">Netcare 911</span>
                <span className="text-red-400 font-bold text-sm">📞 082 911</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB: MEDICATION MANAGER */}
        {activeTab === 'medications' && (
          <div className="bg-[#121622]/80 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <span>Medication Manager & Adherence Tracking</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage daily prescriptions, dosage, reminder schedules, and persistence in CockroachDB 'medications'.
                </p>
              </div>
              <button
                onClick={() => setShowAddMedModal(true)}
                className="bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prescription</span>
              </button>
            </div>

            {/* Adherence Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Total Prescriptions</span>
                <span className="text-white font-bold text-base block">{medications.length} active</span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Taken Today</span>
                <span className="text-emerald-400 font-bold text-base block">
                  {medications.filter((m) => m.takenToday).length} / {medications.length}
                </span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Adherence Rate</span>
                <span className="text-teal-300 font-bold text-base block">
                  {medications.length ? Math.round((medications.filter((m) => m.takenToday).length / medications.length) * 100) : 100}%
                </span>
              </div>
              <div className="p-3.5 bg-[#0D111A] rounded-2xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Database Sync</span>
                <span className="text-indigo-300 font-bold text-xs block">CockroachDB Live</span>
              </div>
            </div>

            {/* Medications List */}
            <div className="space-y-3">
              {medications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-[#0D111A] rounded-2xl border border-white/5">
                  <Clock className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No medications logged yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Add Prescription" to record your daily medications.</p>
                </div>
              ) : (
                medications.map((med) => (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      med.takenToday
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : 'bg-[#0D111A] border-white/10 hover:border-teal-500/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-white text-sm">{med.medName}</span>
                        <span className="text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                          {med.dosage}
                        </span>
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md font-mono">
                          ⏰ {med.reminderTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-400">Schedule:</strong> {med.frequency}
                      </p>
                      {med.notes && <p className="text-[11px] text-slate-400 italic">{med.notes}</p>}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-[11px] text-amber-300 font-bold block">🔥 {med.adherenceStreak} day streak</span>
                        <span className="text-[10px] text-slate-400">{med.patientName}</span>
                      </div>

                      <button
                        onClick={() => toggleMedicationTaken(med.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          med.takenToday
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{med.takenToday ? 'Taken Today ✓' : 'Mark Taken'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ADD MEDICATION MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0D14]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Add New Prescription & Reminder</h3>
                <p className="text-xs text-slate-400">Persists directly to CockroachDB 'medications' table</p>
              </div>
              <button onClick={() => setShowAddMedModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={medNameInput}
                  onChange={(e) => setMedNameInput(e.target.value)}
                  placeholder="e.g. Amlodipine, Lisinopril, or Aspirin"
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosageInput}
                    onChange={(e) => setMedDosageInput(e.target.value)}
                    placeholder="e.g. 5mg or 50ml"
                    className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder Time</label>
                  <input
                    type="time"
                    value={medReminderTimeInput}
                    onChange={(e) => setMedReminderTimeInput(e.target.value)}
                    className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                <select
                  value={medFrequencyInput}
                  onChange={(e) => setMedFrequencyInput(e.target.value)}
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Once daily (Morning)">Once daily (Morning)</option>
                  <option value="Once daily (Evening)">Once daily (Evening)</option>
                  <option value="Twice daily (Morning & Evening)">Twice daily (Morning & Evening)</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  value={medNotesInput}
                  onChange={(e) => setMedNotesInput(e.target.value)}
                  placeholder="e.g. Take with food. Monitor blood pressure weekly."
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none h-20 resize-none"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTHENTICATION / ACCOUNT SWITCHER MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0D14]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">
                  {authMode === 'login' ? 'Sign In to CardioTrack ZA' : 'Create New Account'}
                </h3>
                <p className="text-xs text-slate-400">Patient & Doctor Practice Telehealth Access</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            {/* Quick Demo Switcher */}
            <div className="bg-[#0D111A] p-3 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Quick Demo Account Switcher</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { switchDemoUser('patient'); setShowAuthModal(false); }}
                  className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-[11px] font-bold text-center"
                >
                  Patient (Thabo)
                </button>
                <button
                  type="button"
                  onClick={() => { switchDemoUser('doctor1'); setShowAuthModal(false); }}
                  className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[11px] font-bold text-center"
                >
                  Doctor (Dr. Naidoo)
                </button>
                <button
                  type="button"
                  onClick={() => { switchDemoUser('doctor2'); setShowAuthModal(false); }}
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-[11px] font-bold text-center"
                >
                  Telemed (Dr. Molefe)
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Dr. Sipho Khumalo or Sarah van der Merwe"
                      className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthRole('patient')}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          authRole === 'patient' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-[#0D111A] text-slate-400 border-white/5'
                        }`}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthRole('doctor')}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          authRole === 'doctor' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-[#0D111A] text-slate-400 border-white/5'
                        }`}
                      >
                        Doctor / Clinic
                      </button>
                    </div>
                  </div>
                  {authRole === 'doctor' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">HPCSA Reg #</label>
                        <input
                          type="text"
                          value={authHpcsa}
                          onChange={(e) => setAuthHpcsa(e.target.value)}
                          placeholder="MP0123456"
                          className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">BHF Practice #</label>
                        <input
                          type="text"
                          value={authPracticeNum}
                          onChange={(e) => setAuthPracticeNum(e.target.value)}
                          placeholder="0123456"
                          className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.co.za"
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => triggerBiometricAuth('fingerprint', () => {
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleAuthSubmit(fakeEvent);
                  })}
                  className="w-full bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-cyan-500/15 border border-teal-500/30 hover:border-teal-500/60 text-teal-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-teal-400 animate-pulse" />
                  <span>Verify with Biometrics (FaceID / Fingerprint)</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                  >
                    {authMode === 'login' ? 'Create Account' : 'Sign In'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
                  >
                    {authMode === 'login' ? 'Sign In (Password)' : 'Register'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BIOMETRIC AUTHENTICATION SCAN MODAL */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0D14]/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-teal-500/40 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-teal-500/20 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center relative overflow-hidden shadow-lg shadow-teal-500/20">
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/20 to-transparent animate-pulse" />
              <Fingerprint className={`w-10 h-10 text-teal-400 ${biometricStatus === 'scanning' ? 'animate-bounce' : 'scale-110'}`} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                {biometricStatus === 'success' ? 'Biometric Verified!' : 'Authenticating Secure Enclave'}
              </h3>
              <p className="text-xs text-slate-400">
                {biometricStatus === 'success'
                  ? 'Access granted to clinical telemetry records.'
                  : 'Place your finger on the sensor or look at the camera for FaceID...'}
              </p>
            </div>

            <div className="p-3 bg-[#0D111A] rounded-2xl border border-white/5 text-xs">
              {biometricStatus === 'success' ? (
                <div className="text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>POPIA Secure Auth Passed</span>
                </div>
              ) : (
                <div className="text-teal-300 font-medium flex items-center justify-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                  <span>Scanning biometric hardware...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURE PMS ADD-ON MODAL */}
      {showConfigureModal && selectedAddon && (
        <div className="fixed inset-0 z-50 bg-[#0A0D14]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Configure {selectedAddon.name}</h3>
                <p className="text-xs text-slate-400">Practice Management Software & Telemedicine API</p>
              </div>
              <button onClick={() => setShowConfigureModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleSaveAddonConfig} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">API Endpoint / Webhook URL</label>
                <input
                  type="url"
                  value={configEndpoint}
                  onChange={(e) => setConfigEndpoint(e.target.value)}
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Practice / BHF Number</label>
                <input
                  type="text"
                  value={configPractice}
                  onChange={(e) => setConfigPractice(e.target.value)}
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="autoSyncCheck"
                  checked={configAutoSync}
                  onChange={(e) => setConfigAutoSync(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-0"
                />
                <label htmlFor="autoSyncCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Automatically push patient vitals to this software in real-time
                </label>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConfigureModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD READING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0D14]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Record Vitals Reading</h3>
                <p className="text-xs text-slate-400">Syncs directly to Doctor PMS & CockroachDB</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleAddReadingSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    value={hrInput}
                    onChange={(e) => setHrInput(parseInt(e.target.value, 10) || 72)}
                    className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={o2Input}
                    onChange={(e) => setO2Input(parseInt(e.target.value, 10) || 98)}
                    className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="60"
                    max="250"
                    value={sysInput}
                    onChange={(e) => setSysInput(parseInt(e.target.value, 10) || 120)}
                    className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="40"
                    max="160"
                    value={diaInput}
                    onChange={(e) => setDiaInput(parseInt(e.target.value, 10) || 80)}
                    className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Context</label>
                <input
                  type="text"
                  placeholder="e.g. Post-consultation, morning resting check"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full bg-[#0D111A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/25"
                >
                  Save & Sync to Doctor PMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
