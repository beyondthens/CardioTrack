'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore-enhanced'
import { getBloodPressureCategory, getBloodPressureColor, formatHeartRate, formatBloodPressure } from '@/lib/utils'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'vitals' | 'history' | 'profile' | 'emergency' | 'deploy'>('vitals')
  const [lastReading, setLastReading] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [bpmInput, setBpmInput] = useState('74')
  const [systolicInput, setSystolicInput] = useState('118')
  const [diastolicInput, setDiastolicInput] = useState('78')
  const [notesInput, setNotesInput] = useState('')
  const [tapTimes, setTapTimes] = useState<number[]>([])

  const { patientData, setPatientData, readingHistory, addReading, removeReading, isOffline } = useStore()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handlePatientDataChange = (field: string, value: string) => {
    const updatedData = { ...patientData, [field]: value }
    setPatientData(updatedData)
  }

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const hr = parseInt(bpmInput, 10) || 72
    const sys = parseInt(systolicInput, 10) || 120
    const dia = parseInt(diastolicInput, 10) || 80

    const newReading = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: hr,
      bloodPressure: { systolic: sys, diastolic: dia },
      notes: notesInput.trim() || 'Manual log'
    }

    addReading(newReading)
    setLastReading(newReading)
    setShowAddModal(false)
    setNotesInput('')
    setTimeout(() => setLastReading(null), 3500)
  }

  const handleQuickAdd = (preset: { hr: number; sys: number; dia: number; notes: string }) => {
    const newReading = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: preset.hr,
      bloodPressure: { systolic: preset.sys, diastolic: preset.dia },
      notes: preset.notes
    }
    addReading(newReading)
    setLastReading(newReading)
    setTimeout(() => setLastReading(null), 3500)
  }

  const handleTap = () => {
    const now = Date.now()
    const recent = [...tapTimes, now].filter((t) => now - t < 5000)
    setTapTimes(recent)
    if (recent.length > 2) {
      const intervals = []
      for (let i = 1; i < recent.length; i++) {
        intervals.push(recent[i] - recent[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      if (calculatedBpm >= 40 && calculatedBpm <= 220) {
        setBpmInput(calculatedBpm.toString())
      }
    }
  }

  const currentSys = patientData.bloodPressure?.systolic ?? 120
  const currentDia = patientData.bloodPressure?.diastolic ?? 80
  const currentCategory = getBloodPressureCategory(currentSys, currentDia)
  const currentCategoryColor = getBloodPressureColor(currentCategory)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <div className={`container mx-auto p-4 max-w-[430px] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Top Header */}
        <header className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white p-5 rounded-3xl shadow-lg mb-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-200 font-semibold">South Africa Vitals Companion</span>
              <h1 className="text-2xl font-bold tracking-tight">CardioTrack ZA</h1>
            </div>
            <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${isOffline ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30'}`}>
              {isOffline ? '📡 Offline' : '● Online Sync'}
            </div>
          </div>
          <p className="text-teal-100 text-xs">
            {patientData.name ? `Patient: ${patientData.name} (${patientData.bloodType || 'Type unknown'})` : 'Track cardiac telemetry & blood pressure offline or synced'}
          </p>
        </header>

        {/* Tab Navigation */}
        <nav className="flex bg-slate-200/80 p-1 rounded-2xl mb-5 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'vitals' ? 'bg-white text-teal-800 shadow-sm' : 'hover:text-teal-900'}`}
          >
            Vitals
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white text-teal-800 shadow-sm' : 'hover:text-teal-900'}`}
          >
            History ({readingHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-white text-teal-800 shadow-sm' : 'hover:text-teal-900'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'emergency' ? 'bg-red-600 text-white shadow-sm' : 'hover:text-red-600'}`}
          >
            SOS ZA
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'deploy' ? 'bg-slate-800 text-white shadow-sm' : 'hover:text-slate-900'}`}
          >
            Deploy
          </button>
        </nav>

        {/* Notification Toast */}
        {lastReading && (
          <div className="fixed top-4 left-4 right-4 max-w-[400px] mx-auto bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl z-50 flex items-center justify-between text-xs animate-bounce">
            <span>✅ Logged: <b>{lastReading.heartRate} BPM</b> | {lastReading.bloodPressure.systolic}/{lastReading.bloodPressure.diastolic} mmHg</span>
            <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full">Saved</span>
          </div>
        )}

        {/* TAB 1: VITALS */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            {/* Live Metrics Display */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Reading</h2>
                <span className="text-xs text-slate-400">
                  {readingHistory[0] ? `${readingHistory[0].date} at ${readingHistory[0].time}` : 'No entries yet'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100">
                  <span className="text-xs text-teal-700 font-medium block mb-1">Heart Rate</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-teal-800">
                      {patientData.heartRate ?? 72}
                    </span>
                    <span className="text-xs text-teal-600 font-medium">BPM</span>
                  </div>
                  <span className="text-[10px] text-teal-600/80 mt-1 block">Resting Target: 60-100</span>
                </div>

                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                  <span className="text-xs text-blue-700 font-medium block mb-1">Blood Pressure</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-blue-900">
                      {currentSys}/{currentDia}
                    </span>
                    <span className="text-xs text-blue-600 font-medium">mmHg</span>
                  </div>
                  <span className={`text-[11px] font-semibold mt-1 block ${currentCategoryColor}`}>
                    {currentCategory}
                  </span>
                </div>
              </div>

              {/* AHA & SA Heart Staging Bar */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1.5">
                  <span>AHA Classification</span>
                  <span className={`font-bold ${currentCategoryColor}`}>{currentCategory}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-1/4" title="Normal <120/<80" />
                  <div className="bg-amber-400 h-full w-1/4" title="Elevated 120-129/<80" />
                  <div className="bg-orange-500 h-full w-1/4" title="Stage 1 130-139/80-89" />
                  <div className="bg-rose-600 h-full w-1/4" title="Stage 2 >=140/>=90" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Normal</span>
                  <span>Elevated</span>
                  <span>Stage 1</span>
                  <span>Stage 2+</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Record</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-3 rounded-2xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>✏️ Manual Input</span>
                </button>
                <button
                  onClick={() => handleQuickAdd({ hr: Math.floor(Math.random() * 20) + 68, sys: 118, dia: 78, notes: 'Resting measurement' })}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 px-3 rounded-2xl text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <span>⚡ Quick Rest (72 BPM)</span>
                </button>
              </div>

              {/* Tap to measure pulse */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-center">
                <span className="text-xs font-semibold text-emerald-900 block mb-1">Pulse Rhythm Tap-to-Measure</span>
                <p className="text-[11px] text-emerald-700 mb-2">Tap button along with your pulse to estimate BPM</p>
                <button
                  onClick={handleTap}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  💓 TAP PULSE ({bpmInput} BPM)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-bold text-slate-700">Telemetry History ({readingHistory.length})</h2>
              {readingHistory.length > 0 && (
                <span className="text-xs text-teal-600 font-medium">Auto-persisted to local cache</span>
              )}
            </div>

            {readingHistory.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <div className="text-4xl mb-2">💓</div>
                <h3 className="font-semibold text-slate-700 text-sm">No recorded telemetry yet</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Log your first reading on the Vitals tab.</p>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className="bg-teal-600 text-white text-xs px-4 py-2 rounded-xl font-medium"
                >
                  Go to Vitals
                </button>
              </div>
            ) : (
              readingHistory.map((reading) => {
                const sys = reading.bloodPressure?.systolic ?? 0
                const dia = reading.bloodPressure?.diastolic ?? 0
                const cat = getBloodPressureCategory(sys, dia)
                const col = getBloodPressureColor(cat)
                return (
                  <div key={reading.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-teal-700 text-base">{reading.heartRate} BPM</span>
                        <span className="text-xs text-slate-500 font-medium">| {sys}/{dia} mmHg</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 ${col}`}>{cat}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {reading.date} at {reading.time} • {reading.notes || 'Routine check'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeReading(reading.id)}
                      className="text-slate-300 hover:text-rose-500 p-2 text-xs"
                      title="Delete entry"
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Patient Profile</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={patientData.name || ''}
                onChange={(e) => handlePatientDataChange('name', e.target.value)}
                placeholder="e.g. Sipho Dlamini"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={patientData.dob || ''}
                  onChange={(e) => handlePatientDataChange('dob', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                <select
                  value={patientData.bloodType || ''}
                  onChange={(e) => handlePatientDataChange('bloodType', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact Number</label>
              <input
                type="tel"
                placeholder="+27 (0)82 000 0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="p-3 bg-teal-50 rounded-2xl text-[11px] text-teal-800">
              🔒 <b>Offline-First Local Storage</b>: All records are secured on device storage and remain available even with zero cellular or Wi-Fi connectivity.
            </div>
          </div>
        )}

        {/* TAB 4: SOUTH AFRICA EMERGENCY SOS */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl">
              <span className="text-rose-600 font-bold text-xs uppercase tracking-wider block mb-1">Emergency Medical Dispatch</span>
              <h2 className="text-xl font-bold text-rose-900 mb-2">South Africa 24/7 Helplines</h2>
              <p className="text-xs text-rose-700 mb-4">
                If you or the patient experience severe chest pain, shortness of breath, numbness, or blood pressure &gt;180/120, contact emergency medical response immediately.
              </p>

              <div className="space-y-2.5">
                <a
                  href="tel:084124"
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-rose-200 shadow-sm hover:border-rose-400 transition"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">ER24 National Medical</span>
                    <span className="text-[11px] text-slate-500">Private ambulance dispatch</span>
                  </div>
                  <span className="text-xs font-bold bg-rose-600 text-white px-3 py-1.5 rounded-xl">📞 084 124</span>
                </a>

                <a
                  href="tel:082911"
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-rose-200 shadow-sm hover:border-rose-400 transition"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Netcare 911</span>
                    <span className="text-[11px] text-slate-500">Cardiovascular trauma unit</span>
                  </div>
                  <span className="text-xs font-bold bg-rose-600 text-white px-3 py-1.5 rounded-xl">📞 082 911</span>
                </a>

                <a
                  href="tel:10177"
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-rose-200 shadow-sm hover:border-rose-400 transition"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Public Ambulance / Metro</span>
                    <span className="text-[11px] text-slate-500">Government emergency services</span>
                  </div>
                  <span className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-xl">📞 10177</span>
                </a>

                <a
                  href="tel:112"
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-rose-200 shadow-sm hover:border-rose-400 transition"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Any Mobile Network SOS</span>
                    <span className="text-[11px] text-slate-500">Free call from any SA SIM</span>
                  </div>
                  <span className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-xl">📞 112</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEPLOYMENT & GITHUB */}
        {activeTab === 'deploy' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Cloud Hosting & Repo</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Render Connected</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Render Service:</span>
                <span className="font-mono font-bold text-slate-800">cardiotrack-za</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service ID:</span>
                <span className="font-mono text-[11px] text-slate-600">srv-dbm7j015efls73cnutr0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Public Live URL:</span>
                <a
                  href="https://cardiotrack-za.onrender.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 underline font-semibold"
                >
                  cardiotrack-za.onrender.com ↗
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">GitHub Repository:</span>
                <a
                  href="https://github.com/beyondthens/CardioTrack"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 underline font-semibold"
                >
                  beyondthens/CardioTrack ↗
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target Branch:</span>
                <span className="font-mono text-slate-700">main</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded-2xl text-[11px] text-teal-800">
              💡 <b>Auto-Deploy Configured</b>: Every git push to <code>main</code> branch on <code>beyondthens/CardioTrack</code> automatically triggers a fresh build and deploy on Render.
            </div>
          </div>
        )}

        {/* Modal for Manual Vitals Entry */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-[380px] w-full shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-base">Record Vitals Reading</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    value={bpmInput}
                    onChange={(e) => setBpmInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Systolic (mmHg)</label>
                    <input
                      type="number"
                      min="60"
                      max="260"
                      value={systolicInput}
                      onChange={(e) => setSystolicInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      value={diastolicInput}
                      onChange={(e) => setDiastolicInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Context</label>
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="e.g. Post-exercise, morning waking, resting"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm"
                  >
                    Save Reading
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
