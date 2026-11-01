import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor – attach Supabase token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
        } else {
          const demoLoggedIn = localStorage.getItem('travelmate_demo_logged_in')
          if (demoLoggedIn === 'true') {
            config.headers.Authorization = 'Bearer demo-token'
          }
        }
      } else {
        // Demo mode: attach a demo token
        config.headers.Authorization = 'Bearer demo-token'
      }
    } catch (_) {
      // Silently continue without auth header
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    const normalizedError = new Error(message)
    normalizedError.status = error.response?.status
    normalizedError.data = error.response?.data
    return Promise.reject(normalizedError)
  }
)

// ─── Itinerary ───────────────────────────────────────────────────────────────

export const generateItinerary = async (tripData) => {
  const response = await apiClient.post('/api/itinerary/generate', tripData)
  return response.data
}

export const regenerateItinerary = async (tripId) => {
  const response = await apiClient.post(`/api/itinerary/${tripId}/regenerate`)
  return response.data
}

export const regenerateDay = async (tripId, dayNumber) => {
  const response = await apiClient.post(`/api/itinerary/${tripId}/day/${dayNumber}/regenerate`)
  return response.data
}

export const getItinerary = async (tripId) => {
  const response = await apiClient.get(`/api/itinerary/${tripId}`)
  return response.data
}

export const getSharedItinerary = async (token) => {
  const response = await apiClient.get(`/api/shared/${token}`)
  return response.data
}

export const downloadPDF = async (tripId) => {
  const response = await apiClient.get(`/api/itinerary/${tripId}/pdf`, {
    responseType: 'blob',
  })
  return response.data
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export const getTrips = async () => {
  const response = await apiClient.get('/api/trips')
  return response.data
}

export const createTrip = async (tripData) => {
  const response = await apiClient.post('/api/trips', tripData)
  return response.data
}

export const getTrip = async (tripId) => {
  const response = await apiClient.get(`/api/trips/${tripId}`)
  return response.data
}

export const updateTrip = async (tripId, updates) => {
  const response = await apiClient.put(`/api/trips/${tripId}`, updates)
  return response.data
}

export const deleteTrip = async (tripId) => {
  const response = await apiClient.delete(`/api/trips/${tripId}`)
  return response.data
}

// ─── Destinations ─────────────────────────────────────────────────────────────

export const getDestinations = async (query) => {
  const response = await apiClient.get('/api/destinations', { params: { q: query } })
  return response.data
}

export default apiClient
