const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

let vitals = [
  { id: 1, date: '2026-11-05', time: '08:30', heartRate: 74, bloodPressure: { systolic: 118, diastolic: 76 }, oxygenSat: 98, bmi: 24.0, category: 'Normal', notes: 'Resting baseline' },
  { id: 2, date: '2026-11-04', time: '18:15', heartRate: 88, bloodPressure: { systolic: 126, diastolic: 82 }, oxygenSat: 97, bmi: 24.1, category: 'Elevated', notes: 'Post-commute' },
  { id: 3, date: '2026-11-03', time: '09:00', heartRate: 70, bloodPressure: { systolic: 115, diastolic: 74 }, oxygenSat: 99, bmi: 24.0, category: 'Normal', notes: 'Morning resting' },
  { id: 4, date: '2026-11-02', time: '19:40', heartRate: 82, bloodPressure: { systolic: 122, diastolic: 80 }, oxygenSat: 98, bmi: 24.1, category: 'Elevated', notes: 'Post-dinner' },
  { id: 5, date: '2026-11-01', time: '08:10', heartRate: 68, bloodPressure: { systolic: 114, diastolic: 72 }, oxygenSat: 99, bmi: 24.0, category: 'Normal', notes: 'Restful sleep' },
  { id: 6, date: '2026-10-31', time: '17:30', heartRate: 94, bloodPressure: { systolic: 132, diastolic: 84 }, oxygenSat: 97, bmi: 24.2, category: 'High Stage 1', notes: 'Post-workout' },
  { id: 7, date: '2026-10-30', time: '08:45', heartRate: 72, bloodPressure: { systolic: 116, diastolic: 75 }, oxygenSat: 98, bmi: 24.1, category: 'Normal', notes: 'Morning check' }
];

function getHtml() {
  const latest = vitals[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardioTrack ZA - Stitch Edition (Render Cloud)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    .heart-beat { animation: pulse 1.2s infinite ease-in-out; }
  </style>
</head>
<body class="bg-[#0A0D14] text-slate-100 min-h-screen p-4 flex flex-col items-center justify-start">
  <div class="w-full max-w-xl mx-auto space-y-4">
    <!-- Header with Google Stitch Design -->
    <header class="bg-[#121622] border border-white/10 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
      <div class="flex items-center space-x-3.5">
        <div class="w-12 h-12 bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <span class="text-2xl heart-beat">💓</span>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-xl font-black text-white">CardioTrack ZA</h1>
            <span class="text-[10px] bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">Stitch UI</span>
          </div>
          <p class="text-xs text-slate-400">Cardiovascular Vitals, BMI Engine & Telemetry Trends</p>
        </div>
      </div>
      <span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
        Live Render
      </span>
    </header>

    <!-- Navigation Tabs -->
    <div class="flex bg-[#121622] p-1 rounded-2xl border border-white/5 text-xs font-semibold">
      <button onclick="showSection('vitals')" id="tab-vitals" class="flex-1 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold transition">Vitals</button>
      <button onclick="showSection('trends')" id="tab-trends" class="flex-1 py-2 rounded-xl text-slate-400 hover:text-white transition">Trends</button>
      <button onclick="showSection('bmi')" id="tab-bmi" class="flex-1 py-2 rounded-xl text-slate-400 hover:text-white transition">BMI Engine</button>
      <button onclick="showSection('sos')" id="tab-sos" class="flex-1 py-2 rounded-xl text-red-400 hover:text-red-300 transition">SOS ZA</button>
    </div>

    <!-- SECTION 1: VITALS -->
    <div id="sec-vitals" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-[#121622] p-4 rounded-2xl border border-white/10">
          <span class="text-xs text-teal-400 font-bold block mb-1">Heart Rate</span>
          <div class="flex items-baseline space-x-1">
            <span class="text-3xl font-black text-white" id="hrDisplay">${latest.heartRate}</span>
            <span class="text-xs text-slate-400 font-semibold">BPM</span>
          </div>
          <span class="text-[10px] text-emerald-400 mt-1 block">Normal Sinus</span>
        </div>

        <div class="bg-[#121622] p-4 rounded-2xl border border-white/10">
          <span class="text-xs text-blue-400 font-bold block mb-1">Blood Pressure</span>
          <div class="flex items-baseline space-x-1">
            <span class="text-3xl font-black text-white">${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}</span>
            <span class="text-xs text-slate-400 font-semibold">mmHg</span>
          </div>
          <span class="text-[10px] text-emerald-400 mt-1 block">AHA ${latest.category}</span>
        </div>
      </div>

      <div class="bg-[#121622] p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
        <div>
          <span class="text-slate-400 block">Body Mass Index (BMI):</span>
          <span class="text-purple-400 font-bold text-base">24.0 kg/m² (Normal Weight)</span>
        </div>
        <button onclick="quickLog()" class="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition">
          + Record Telemetry
        </button>
      </div>
    </div>

    <!-- SECTION 2: TRENDS -->
    <div id="sec-trends" class="hidden bg-[#121622] p-5 rounded-3xl border border-white/10 space-y-4">
      <div class="flex justify-between items-center text-xs">
        <h3 class="font-bold text-white text-sm">7-Day Systolic & Diastolic Telemetry Trend</h3>
        <span class="text-teal-400 font-semibold">Mean: 119/77 mmHg</span>
      </div>
      <div class="h-44 w-full bg-[#0D111A] rounded-2xl border border-white/5 p-3 flex items-end justify-between space-x-2">
        ${vitals.map(v => `
          <div class="flex-1 flex flex-col items-center space-y-1">
            <span class="text-[9px] text-teal-400 font-bold">${v.bloodPressure.systolic}</span>
            <div class="w-full bg-teal-500/80 rounded-t-lg" style="height: ${(v.bloodPressure.systolic - 80) * 1.8}px"></div>
            <div class="w-full bg-blue-500/60 rounded-b-lg" style="height: ${(v.bloodPressure.diastolic - 40) * 1.4}px"></div>
            <span class="text-[8px] text-slate-500">${v.date.slice(5)}</span>
          </div>
        `).reverse().join('')}
      </div>
      <div class="flex justify-between text-[10px] text-slate-400">
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 bg-teal-500 rounded"></span><span>Systolic</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 bg-blue-500 rounded"></span><span>Diastolic</span></span>
        <span>AHA Target &lt;120/80 mmHg</span>
      </div>
    </div>

    <!-- SECTION 3: BMI ENGINE -->
    <div id="sec-bmi" class="hidden bg-[#121622] p-5 rounded-3xl border border-white/10 space-y-4">
      <h3 class="font-bold text-white text-sm">Interactive BMI & Body Mass Engine</h3>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Height (cm): <span id="hVal" class="text-teal-400 font-bold">178</span></label>
          <input type="range" min="130" max="210" value="178" id="hInput" oninput="calcBmi()" class="w-full accent-teal-400 bg-slate-800 rounded">
        </div>
        <div>
          <label class="block text-slate-400 mb-1">Weight (kg): <span id="wVal" class="text-purple-400 font-bold">76</span></label>
          <input type="range" min="40" max="150" value="76" id="wInput" oninput="calcBmi()" class="w-full accent-purple-400 bg-slate-800 rounded">
        </div>
      </div>
      <div class="bg-[#0D111A] p-4 rounded-2xl border border-white/5 text-center">
        <span class="text-xs text-slate-400 block">Calculated BMI Score</span>
        <span id="bmiScore" class="text-4xl font-black text-white my-1 block">24.0</span>
        <span id="bmiLabel" class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">Normal Weight (Optimal)</span>
      </div>
    </div>

    <!-- SECTION 4: SOUTH AFRICA EMERGENCY SOS -->
    <div id="sec-sos" class="hidden bg-red-950/40 border border-red-500/30 rounded-3xl p-5 text-xs space-y-3">
      <span class="font-bold text-red-400 text-sm block">🚨 South Africa 24/7 Medical Helplines</span>
      <div class="grid grid-cols-2 gap-2.5">
        <a href="tel:084124" class="bg-[#0D111A] p-3 rounded-2xl border border-red-900/40 text-center block hover:border-red-500 transition">
          <span class="text-[11px] text-slate-300 font-bold block">ER24 National</span>
          <span class="text-red-400 font-bold">📞 084 124</span>
        </a>
        <a href="tel:082911" class="bg-[#0D111A] p-3 rounded-2xl border border-red-900/40 text-center block hover:border-red-500 transition">
          <span class="text-[11px] text-slate-300 font-bold block">Netcare 911</span>
          <span class="text-red-400 font-bold">📞 082 911</span>
        </a>
        <a href="tel:10177" class="bg-[#0D111A] p-3 rounded-2xl border border-red-900/40 text-center block hover:border-red-500 transition">
          <span class="text-[11px] text-slate-300 font-bold block">Public EMS</span>
          <span class="text-slate-300 font-bold">📞 10177</span>
        </a>
        <a href="tel:112" class="bg-[#0D111A] p-3 rounded-2xl border border-red-900/40 text-center block hover:border-red-500 transition">
          <span class="text-[11px] text-slate-300 font-bold block">Cellular SOS</span>
          <span class="text-slate-300 font-bold">📞 112</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    function showSection(sec) {
      ['vitals', 'trends', 'bmi', 'sos'].forEach(s => {
        document.getElementById('sec-' + s).classList.add('hidden');
        document.getElementById('tab-' + s).className = 'flex-1 py-2 rounded-xl text-slate-400 hover:text-white transition';
      });
      document.getElementById('sec-' + sec).classList.remove('hidden');
      document.getElementById('tab-' + sec).className = 'flex-1 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold transition';
    }

    function calcBmi() {
      const h = parseFloat(document.getElementById('hInput').value);
      const w = parseFloat(document.getElementById('wInput').value);
      document.getElementById('hVal').innerText = h;
      document.getElementById('wVal').innerText = w;
      const bmi = (w / ((h/100) * (h/100))).toFixed(1);
      document.getElementById('bmiScore').innerText = bmi;
      const label = document.getElementById('bmiLabel');
      if (bmi < 18.5) { label.innerText = 'Underweight'; label.className = 'text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold'; }
      else if (bmi < 25) { label.innerText = 'Normal Weight'; label.className = 'text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold'; }
      else if (bmi < 30) { label.innerText = 'Overweight'; label.className = 'text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-bold'; }
      else { label.innerText = 'Obese'; label.className = 'text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold'; }
    }

    function quickLog() {
      const bpm = Math.floor(Math.random() * 20) + 70;
      document.getElementById('hrDisplay').innerText = bpm;
      alert('Vitals logged! Heart Rate: ' + bpm + ' BPM');
    }
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'cardiotrack-za', time: new Date().toISOString() }));
    return;
  }

  if (req.url === '/api/vitals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ vitals }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(getHtml());
});

server.listen(PORT, HOST, () => {
  console.log(`CardioTrack ZA listening on http://${HOST}:${PORT}`);
});
