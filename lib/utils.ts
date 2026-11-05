"use client"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatHeartRate(rate: number): string {
  return `${rate} bpm`
}

export function formatBloodPressure(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic} mmHg`
}

export function getBloodPressureCategory(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) return 'Normal'
  if (systolic < 130 && diastolic < 80) return 'Elevated'
  if (systolic < 140 || diastolic < 90) return 'High Stage 1'
  if (systolic < 160 || diastolic < 100) return 'High Stage 2'
  return 'Hypertensive Crisis'
}

export function getBloodPressureColor(category: string): string {
  switch (category) {
    case 'Normal': return 'text-green-600'
    case 'Elevated': return 'text-yellow-600'
    case 'High Stage 1': return 'text-orange-600'
    case 'High Stage 2': return 'text-red-600'
    case 'Hypertensive Crisis': return 'text-red-800'
    default: return 'text-gray-600'
  }
}

export function generateErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function parseApiResponse<T>(response: Response): Promise<T> {
  return response.json().catch(() => {
    throw new Error('Failed to parse API response')
  })
}

export function handleApiError(error: any): never {
  console.error('API Error:', error)
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error('Network error. Please check your connection.')
  }
  
  if (error.status === 401) {
    throw new Error('Authentication required')
  }
  
  if (error.status === 403) {
    throw new Error('Access denied')
  
  }
  
  if (error.status >= 500) {
    throw new Error('Server error. Please try again later.')
  }
  
  throw error
}

export function calculateAverage<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0
  const sum = array.reduce((acc, item) => acc + (item[key] as number), 0)
  return sum / array.length
}

export function calculateReadingAverage(readings: Array<{ heartRate: number; bloodPressure: { systolic: number; diastolic: number } }>) {
  if (readings.length === 0) return null
  
  const avgHeartRate = readings.reduce((acc, reading) => acc + reading.heartRate, 0) / readings.length
  const avgSystolic = readings.reduce((acc, reading) => acc + reading.bloodPressure.systolic, 0) / readings.length
  const avgDiastolic = readings.reduce((acc, reading) => acc + reading.bloodPressure.diastolic, 0) / readings.length
  
  return {
    heartRate: Math.round(avgHeartRate),
    bloodPressure: {
      systolic: Math.round(avgSystolic),
      diastolic: Math.round(avgDiastolic)
    }
  }
}

export function exportDataToJSON<T>(data: T, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
  
  const exportName = `${filename}-${new Date().toISOString().split('T')[0]}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportName)
  linkElement.click()
}

export function importDataFromJSON<T>(event: React.ChangeEvent<HTMLInputElement>): Promise<T> {
  return new Promise((resolve, reject) => {
    const file = event.target.files?.[0]
    if (!file) {
      reject(new Error('No file selected'))
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}