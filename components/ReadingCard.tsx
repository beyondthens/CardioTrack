'use client'

// Enhanced Reading Card Component
import { useStore } from '@/store/useStore-enhanced'
import { formatHeartRate, formatBloodPressure, getBloodPressureCategory, getBloodPressureColor } from '@/lib/utils'

export function ReadingCard({ reading }: { reading: any }) {
  const { isOffline } = useStore()
  
  const { systolic, diastolic } = reading.bloodPressure || { systolic: 0, diastolic: 0 }
  const { label, color } = getBloodPressureCategory(systolic, diastolic)
  const { formattedHeartRate, formattedBP } = {
    formattedHeartRate: `${reading.heartRate} BPM`,
    formattedBP: `${systolic}/${diastolic} mmHg`
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:border-teal-500 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-teal-700">
            {reading.date ? new Date(reading.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'Unknown Date'}
          </h3>
          <p className="text-sm text-gray-500">
            {reading.time || ''}
          </div>
        </div>
        <div className="text-sm">
          {isOffline ? (
            <span className="status-indicator status-offline">
              📡 Offline
            </span>
          ) : (
            <span className="status-indicator status-online">
              ✅ Online
            </span>
          )}
        </div>
      </div>
      
      <div className="text-3xl font-bold text-teal-600 mb-2">
        {formattedHeartRate}
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-500 mb-1">Blood Pressure</div>
        <div className={`flex items-center ${color}`}>
          <span className="text-lg font-medium">{systolic}</span>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-lg font-medium">{diastolic}</span>
          <span className="text-xs text-gray-400">mmHg</span>
        </div>
        <p className={`text-xs ${color}`}>
          {label}
        </div>
      </div>
      
      <div className="text-xs text-gray-400">
        {reading.notes || 'No notes'}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          className="w-full bg-teal-100 text-teal-700 py-2 px-4 rounded-lg hover:bg-teal-200 transition-colors text-sm"
          onClick={() => {
            // Open reading details
            window.location.hash = `reading-${reading.id}`
          }}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export function EmptyState({ hasReadings }: { hasReadings: boolean }) {
  if (hasReadings) {
    return null
  }
  
  return (
    <div className="text-center py-12">
      <div className="text-4xl text-gray-300 mb-4">💓</div>
      <h3 className="text-xl font-medium text-gray-500 mb-2">No readings yet</h3>
      <p className="text-gray-400 text-sm mb-6">
        Start tracking your heart health by adding your first reading
      </div>
      <button
        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        onClick={() => window.location.hash = '#add-reading'}
      >
        Add First Reading
      </button>
    </div>
  )
}

export function ReadingHistoryList({ readings }: { readings: any[] }) {
  if (readings.length === 0) {
    return <EmptyState hasReadings={false} />
  }
  
  return (
    <div className="space-y-4">
      {readings.map((reading) => (
        <ReadingCard key={reading.id} reading={reading} />
      ))}
    </div>
  )
}