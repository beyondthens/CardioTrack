"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BloodPressure {
  systolic: number
  diastolic: number
}

interface Reading {
  id: number
  date: string
  time: string
  heartRate: number
  bloodPressure: BloodPressure
  notes?: string
}

interface PatientData {
  name: string
  dob: string
  bloodType: string
  lastReading?: number
  heartRate?: number
  bloodPressure?: BloodPressure
  medications?: string[]
  allergies?: string[]
}

interface AppStore {
  // Patient data (persisted)
  patientData: PatientData
  setPatientData: (data: Partial<PatientData>) => void
  
  // UI state
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // Offline status
  isOffline: boolean
  setOfflineStatus: (offline: boolean) => void
  
  // Reading history (persisted)
  readingHistory: Reading[]
  addReading: (reading: Omit<Reading, 'id'>) => void
  removeReading: (id: number) => void
  clearReadings: () => void
  
  // Current reading
  currentReading: Reading | null
  setCurrentReading: (reading: Reading | null) => void
  
  // App settings
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  
  // Notifications
  notifications: string[]
  addNotification: (message: string) => void
  removeNotification: (message: string) => void
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
      // Patient data
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
        set((state) => {
          const newReading = { ...reading, id: Date.now() }
          const updatedHistory = [newReading, ...state.readingHistory].slice(0, 100)
          return {
            readingHistory: updatedHistory,
            patientData: {
              ...state.patientData,
              lastReading: newReading.heartRate,
              heartRate: newReading.heartRate,
              bloodPressure: newReading.bloodPressure
            }
          }
        }),
      
      removeReading: (id) =>
        set((state) => ({
          readingHistory: state.readingHistory.filter(r => r.id !== id)
        })),
      
      clearReadings: () => set({ readingHistory: [] }),
      
      // Current reading
      currentReading: null,
      setCurrentReading: (reading) => set({ currentReading: reading }),
      
      // Theme
      theme: typeof window !== 'undefined' && localStorage.getItem('cardiotrack-theme') === 'dark' ? 'dark' : 'light',
      setTheme: (theme) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cardiotrack-theme', theme)
        }
        return set({ theme })
      },
      
      // Notifications
      notifications: [],
      addNotification: (message) =>
        set((state) => ({
          notifications: [...state.notifications, message]
        })),
      
      removeNotification: (message) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n !== message)
        }))
    }),
    {
      name: 'cardiotrack-storage-enhanced',
      partialize: (state) => ({
        patientData: state.patientData,
        readingHistory: state.readingHistory,
        theme: state.theme
      })
    }
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
