const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// In-memory vitals store
let vitals = [
  {
    id: 1,
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    heartRate: 74,
    bloodPressure: { systolic: 118, diastolic: 76 },
    oxygenSat: 98,
    bloodGlucose: 5.4,
    notes: 'Morning resting vitals check',
    category: 'Normal'
  },
  {
    id: 2,
    patientName: 'Thabo Mokoena',
    bloodType: 'O+',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '18:15',
    heartRate: 88,
    bloodPressure: { systolic: 126, diastolic: 82 },
    oxygenSat: 97,
    bloodGlucose: 6.1,
    notes: 'Post-commute measurement',
    category: 'Elevated'
  }
];

function getHtml() {
  const latest = vitals[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardioTrack ZA - Hosted on Render</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    .heart-beat { animation: pulse 1.2s infinite ease-in-out; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 flex flex-col items-center justify-start">
  <div class="w-full max-w-md mx-auto space-y-4">
    <!-- Header -->
    <header class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center">
      <div class="w-12 h-12 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20 mb-3">
        <span class="text-2xl heart-beat">💓</span>
      </div>
      <span class="text-[10px] uppercase font-bold tracking-widest text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
        Live on Render Cloud
      </span>
      <h1 class="text-2xl font-black text-white mt-2">CardioTrack ZA</h1>
      <p class="text-xs text-slate-400">South Africa Cardiovascular Telemetry & Vitals Companion</p>
    </header>

    <!-- Vitals Telemetry Card -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Current Reading</span>
        <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          ${latest.category}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span class="text-xs text-teal-400 font-semibold block mb-1">Heart Rate</span>
          <div class="flex items-baseline space-x-1">
            <span class="text-3xl font-extrabold text-white" id="hrDisplay">${latest.heartRate}</span>
            <span class="text-xs text-slate-400 font-semibold">BPM</span>
          </div>
          <span class="text-[10px] text-slate-500 mt-1 block">Resting target: 60-100</span>
        </div>

        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span class="text-xs text-blue-400 font-semibold block mb-1">Blood Pressure</span>
          <div class="flex items-baseline space-x-1">
            <span class="text-2xl font-extrabold text-white">${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}</span>
            <span class="text-xs text-slate-400 font-semibold">mmHg</span>
          </div>
          <span class="text-[10px] text-emerald-400 mt-1 block">${latest.category}</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="pt-2">
        <button onclick="logQuickVital()" class="w-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold py-3 rounded-2xl text-xs transition shadow-lg shadow-teal-500/20">
          ➕ Quick Log Telemetry Reading
        </button>
      </div>
    </div>

    <!-- CockroachDB & Cloud Sync Badge -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-xs space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 font-medium">CockroachDB API:</span>
        <span class="text-indigo-400 font-bold font-mono">CCDB1_... (Configured)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 font-medium">GitHub Repository:</span>
        <a href="https://github.com/beyondthens/CardioTrack" target="_blank" class="text-teal-400 underline font-semibold">
          beyondthens/CardioTrack
        </a>
      </div>
    </div>

    <!-- South Africa Emergency SOS Contacts -->
    <div class="bg-red-950/40 border border-red-500/30 rounded-3xl p-5 text-xs space-y-3">
      <div class="flex items-center space-x-2 text-red-400 font-bold">
        <span>🚨</span>
        <span>South Africa Emergency SOS Medical Helplines</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <a href="tel:084124" class="bg-slate-900 p-2.5 rounded-xl border border-red-900/40 text-center hover:border-red-500 transition block">
          <span class="text-[11px] text-slate-300 font-bold block">ER24</span>
          <span class="text-red-400 font-bold">📞 084 124</span>
        </a>
        <a href="tel:082911" class="bg-slate-900 p-2.5 rounded-xl border border-red-900/40 text-center hover:border-red-500 transition block">
          <span class="text-[11px] text-slate-300 font-bold block">Netcare 911</span>
          <span class="text-red-400 font-bold">📞 082 911</span>
        </a>
        <a href="tel:10177" class="bg-slate-900 p-2.5 rounded-xl border border-red-900/40 text-center hover:border-red-500 transition block">
          <span class="text-[11px] text-slate-300 font-bold block">Public EMS</span>
          <span class="text-slate-300 font-bold">📞 10177</span>
        </a>
        <a href="tel:112" class="bg-slate-900 p-2.5 rounded-xl border border-red-900/40 text-center hover:border-red-500 transition block">
          <span class="text-[11px] text-slate-300 font-bold block">Mobile SOS</span>
          <span class="text-slate-300 font-bold">📞 112</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    function logQuickVital() {
      const bpm = Math.floor(Math.random() * 20) + 70;
      fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartRate: bpm, systolic: 118, diastolic: 78, notes: 'Quick vital from mobile web' })
      }).then(() => {
        document.getElementById('hrDisplay').innerText = bpm;
        alert('Vitals logged! Heart Rate: ' + bpm + ' BPM');
      });
    }
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health endpoint for Render health checks
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'cardiotrack-za', time: new Date().toISOString() }));
    return;
  }

  // API Vitals
  if (req.url === '/api/vitals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ vitals }));
    return;
  }

  if (req.url === '/api/vitals' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const newReading = {
          id: Date.now(),
          patientName: parsed.patientName || 'Thabo Mokoena',
          bloodType: parsed.bloodType || 'O+',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          heartRate: parsed.heartRate || 72,
          bloodPressure: { systolic: parsed.systolic || 120, diastolic: parsed.diastolic || 80 },
          oxygenSat: parsed.oxygenSat || 98,
          category: parsed.systolic >= 140 ? 'High' : 'Normal',
          notes: parsed.notes || 'Recorded via mobile'
        };
        vitals = [newReading, ...vitals];
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, reading: newReading }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Serve Main UI
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(getHtml());
});

server.listen(PORT, HOST, () => {
  console.log(`CardioTrack ZA listening on http://${HOST}:${PORT}`);
});
