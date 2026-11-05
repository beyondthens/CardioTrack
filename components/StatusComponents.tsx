'use client'

// Enhanced Status Components
import { useStore } from '@/store/useStore-enhanced'

export function OfflineStatus() {
  const { isOffline, setOfflineStatus } = useStore()
  
  if (isOffline) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <span className="mr-2">📡</span>
        Offline Mode
        <button
          onClick={() => setOfflineStatus(false)}
          className="ml-2 text-yellow-600 hover:text-yellow-800 font-bold"
          aria-label="Go online"
        >
          ⟳
        </button>
      </div>
    )
  }
  
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      <span className="mr-2">✅</span>
      Online
    </div>
  )
}

export function NotificationCenter() {
  const { notifications, removeNotification } = useStore()
  
  if (notifications.length === 0) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-lg mb-2 animate-slide-up"
        >
          <div className="flex items-center justify-between">
            <div>{notification}</div>
            <button
              onClick={() => removeNotification(notification)}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner() {
  const { isLoading, setLoading } = useStore()
  
  if (!isLoading) {
    return null
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="mt-3 text-center text-gray-700">Loading...</p>
      </div>
    </div>
  )
}

export default function StatusComponents() {
  return (
    <div>
      <OfflineStatus />
      <NotificationCenter />
      <LoadingSpinner />
    </div>
  )
}
