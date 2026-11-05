"use client"

import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface PatientData {
  name: string
  dob: string
  bloodType: string
  lastReading?: number
  heartRate?: number
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  medications?: string[]
  allergies?: string[]
}

interface AppStore {
  // Patient data (persisted)
  patientData: PatientData
  setPatientData: (data: Partial<PatientData>) => void
  
  // UI state (not persisted)
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // Offline status
  isOffline: boolean
  setOfflineStatus: (offline: boolean) => void
  
  // Reading history (persisted)
  readingHistory: Array<{ date: string; heartRate: number; bloodPressure: { systolic: number; diastolic: number } }>
  addReading: (reading: { date: string; heartRate: number; bloodPressure: { systolic: number; diastolic: number } }) => void
  
  // Selected date for readings
  selectedDate: string
  setSelectedDate: (date: string) => void
}

const defaultPatientData: PatientData = {
  name: '',
  dob: '',
  bloodType: '',
  lastReading: undefined,
  heartRate: undefined,
  bloodPressure: undefined,
  medications: [],
  allergies: []
}

const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Patient data with defaults
      patientData: defaultPatientData,
      setPatientData: (partial) =>
        set((state) => ({
          patientData: { ...state.patientData, ...partial }
        })),
      
      // UI state
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Offline status
      isOffline: typeof window !== 'undefined' ? !navigator.onLine : false,
      setOfflineStatus: (offline) => set({ isOffline: offline }),
      
      // Reading history
      readingHistory: [],
      addReading: (reading) =>
        set((state) => ({
          readingHistory: [reading, ...state.readingHistory].slice(0, 100),
          patientData: {
            ...state.patientData,
            lastReading: reading.heartRate,
            heartRate: reading.heartRate,
            bloodPressure: reading.bloodPressure
          }
        })),
      
      // Selected date
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date })
    }),
    {
      name: 'cardiotrack-storage',
      partialize: (state) => ({
        patientData: state.patientData,
        readingHistory: state.readingHistory
      })
    } as PersistOptions<AppStore>
  )
)

// Subscribe to online/offline status
if (typeof window !== 'undefined') {
  const handleOnlineStatus = () => {
    useStore.setState({ isOffline: !navigator.onLine })
  }
  
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
}

export default useStore