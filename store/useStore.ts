"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PatientData {
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

export interface ReadingItem {
  id?: number
  date: string
  time?: string
  heartRate: number
  bloodPressure: { systolic: number; diastolic: number }
  notes?: string
}

export interface AppStore {
  patientData: PatientData
  setPatientData: (data: Partial<PatientData>) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  isOffline: boolean
  setOfflineStatus: (offline: boolean) => void
  readingHistory: ReadingItem[]
  addReading: (reading: ReadingItem) => void
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

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      patientData: defaultPatientData,
      setPatientData: (partial) =>
        set((state) => ({
          patientData: { ...state.patientData, ...partial }
        })),
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      isOffline: typeof window !== 'undefined' ? !navigator.onLine : false,
      setOfflineStatus: (offline) => set({ isOffline: offline }),
      readingHistory: [],
      addReading: (reading) =>
        set((state) => ({
          readingHistory: [{ ...reading, id: reading.id || Date.now() }, ...state.readingHistory].slice(0, 100),
          patientData: {
            ...state.patientData,
            lastReading: reading.heartRate,
            heartRate: reading.heartRate,
            bloodPressure: reading.bloodPressure
          }
        })),
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date })
    }),
    {
      name: 'cardiotrack-storage',
      partialize: (state) => ({
        patientData: state.patientData,
        readingHistory: state.readingHistory
      })
    }
  )
)

if (typeof window !== 'undefined') {
  const handleOnlineStatus = () => {
    useStore.setState({ isOffline: !navigator.onLine })
  }
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
}

export default useStore
