"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BloodPressure {
  systolic: number
  diastolic: number
}

export interface Reading {
  id: number
  date: string
  time: string
  heartRate: number
  bloodPressure: BloodPressure
  notes?: string
}

export interface PatientData {
  name: string
  dob: string
  bloodType: string
  lastReading?: number
  heartRate?: number
  bloodPressure?: BloodPressure
  medications?: string[]
  allergies?: string[]
}

export interface AppStore {
  patientData: PatientData
  setPatientData: (data: Partial<PatientData>) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  isOffline: boolean
  setOfflineStatus: (offline: boolean) => void
  readingHistory: Reading[]
  addReading: (reading: Omit<Reading, 'id'>) => void
  removeReading: (id: number) => void
  clearReadings: () => void
  currentReading: Reading | null
  setCurrentReading: (reading: Reading | null) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
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
          readingHistory: state.readingHistory.filter((r) => r.id !== id)
        })),
      clearReadings: () => set({ readingHistory: [] }),
      currentReading: null,
      setCurrentReading: (reading) => set({ currentReading: reading }),
      theme: typeof window !== 'undefined' && localStorage.getItem('cardiotrack-theme') === 'dark' ? 'dark' : 'light',
      setTheme: (theme) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cardiotrack-theme', theme)
        }
        return set({ theme })
      },
      notifications: [],
      addNotification: (message) =>
        set((state) => ({
          notifications: [...state.notifications, message]
        })),
      removeNotification: (message) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n !== message)
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

if (typeof window !== 'undefined') {
  const handleOnlineStatus = () => {
    useStore.setState({ isOffline: !navigator.onLine })
  }
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
}

export default useStore
