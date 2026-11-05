'use client'

// Quick Actions Component
import { useStore } from '@/store/useStore-enhanced'
import { formatHeartRate } from '@/lib/utils'

export function QuickActions() {
  const { patientData, addReading, isOffline } = useStore()
  
  const handleQuickReading = () => {
    const newReading = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      heartRate: Math.floor(Math.random() * 120) + 50, // Random HR 50-170
      bloodPressure: {
        systolic: Math.floor(Math.random() * 50) + 90, // Random 90-140
        diastolic: Math.floor(Math.random() * 30) + 60, // Random 60-90
      },
      notes: 'Quick action reading'
    }
    
    addReading(newReading)
  }
  
  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-teal-700 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleQuickReading}
          className="bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 w-full"
        >
          ➕ Quick Add Reading
          <div className="mt-1 text-xs">
            {patientData.heartRate ? `Last: ${formatHeartRate(patientData.heartRate)}` : 'Tap to add'}
          </div>
        </button>
        
        <button
          className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 w-full"
        >
          📊 View History
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Offline: {isOffline ? '📡 Active' : '✅ Ready'}</span>
        </div>
      </div>
    </section>
  )
}