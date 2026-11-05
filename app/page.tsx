"use client"

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [lastReading, setLastReading] = useState<any>(null)
  const { patientData, setPatientData, readingHistory, addReading, isOffline } = useStore()
  
  useEffect(() => {
    setIsVisible(true)
    
    // Load persisted state from localStorage (offline-first)
    const savedData = localStorage.getItem('cardiotrack-patient-data')
    if (savedData) {
      setPatientData(JSON.parse(savedData))
    }
  }, [setPatientData])
  
  const handlePatientDataChange = (field: string, value: string) => {
    const updatedData = { ...patientData, [field]: value }
    setPatientData(updatedData)
    localStorage.setItem('cardiotrack-patient-data', JSON.stringify(updatedData))
  }
  
  const handleAddReading = () => {
    const newReading = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      heartRate: 72,
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      notes: "Initial reading"
    }
    
    addReading(newReading)
    setLastReading(newReading)
    
    // Show notification
    setTimeout(() => setLastReading(null), 3000)
  }
  
  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-green-600' }
    if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'text-yellow-600' }
    if (systolic < 140 || diastolic < 90) return { label: 'High Stage 1', color: 'text-orange-600' }
    if (systolic < 160 || diastolic < 100) return { label: 'High Stage 2', color: 'text-red-600' }
    return { label: 'Hypertensive Crisis', color: 'text-red-800' }
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className={`container mx-auto p-4 max-w-[430px] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-800 mb-2">CardioTrack ZA</h1>
          <p className="text-gray-600">Your personal heart health companion</p>
          {isOffline && (
            <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              📡 Offline Mode
            </div>
          )}
        </header>
        
        {/* Patient Information Card */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">Patient Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={patientData.name || ''}
                onChange={(e) => handlePatientDataChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter patient name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={patientData.dob || ''}
                onChange={(e) => handlePatientDataChange('dob', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <select
                value={patientData.bloodType || ''}
                onChange={(e) => handlePatientDataChange('bloodType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select blood type</option>
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
        </section>
        
        {/* Reading Status Card */}
        {lastReading && (
          <div className="fixed bottom-4 left-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg z-50 animate-pulse">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">✅</div>
              <div>
                <strong>Reading Added!</strong> Heart rate: {lastReading.heartRate} BPM on {lastReading.date}
              </div>
            </div>
          </div>
        )}
        
        {/* Current Reading Card */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">Current Reading</h2>
          
          {patientData.heartRate ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Heart Rate:</span>
                <span className="text-2xl font-bold text-teal-600">{patientData.heartRate} BPM</span>
              </div>
              
              {patientData.bloodPressure && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Blood Pressure:</span>
                  <span className="text-lg font-semibold">
                    {patientData.bloodPressure.systolic}/{patientData.bloodPressure.diastolic} mmHg
                  </span>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBloodPressureCategory(
                  patientData.bloodPressure?.systolic || 120,
                  patientData.bloodPressure?.diastolic || 80
                ).color} ${getBloodPressureCategory(
                  patientData.bloodPressure?.systolic || 120,
                  patientData.bloodPressure?.diastolic || 80
                ).className}">
                  {getBloodPressureCategory(
                    patientData.bloodPressure?.systolic || 120,
                    patientData.bloodPressure?.diastolic || 80
                  ).label}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">💓</div>
              <p className="text-gray-500">No reading data available</p>
              <p className="text-gray-400 text-sm mt-2">Add your first reading to get started</p>
            </div>
          )}
        </section>
        
        {/* Quick Actions */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleAddReading}
              className="bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1"
            >
              ➕ Add Reading
            </button>
            <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1">
              📊 View History
            </button>
          </div>
        
        {/* Status indicator */}
        <div className="mt-4 text-center">
          <span className={`status-indicator ${isOffline ? 'status-offline' : 'status-online'}`}>
            {isOffline ? '📡 Offline' : '✅ Online'}
          </span>
        </div>
      </div>
    </main>
  )
}