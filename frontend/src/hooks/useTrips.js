import { useState, useCallback } from 'react'
import { getTrips, createTrip, getTrip, updateTrip, deleteTrip } from '../services/api'
import toast from 'react-hot-toast'

// Demo trips for when API is not available
const DEMO_TRIPS = [
  {
    id: 'demo-trip-1',
    title: 'Paris Getaway',
    destination: 'Paris, France',
    start_date: '2024-06-15',
    end_date: '2024-06-22',
    travelers: 2,
    budget: 3000,
    currency: 'USD',
    travel_style: 'Moderate',
    status: 'planned',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-trip-2',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    start_date: '2024-08-10',
    end_date: '2024-08-20',
    travelers: 1,
    budget: 4000,
    currency: 'USD',
    travel_style: 'Budget',
    status: 'completed',
    created_at: new Date().toISOString(),
  },
]

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTrips()
      setTrips(Array.isArray(data) ? data : data?.trips || [])
    } catch (err) {
      // Fall back to demo trips if API unavailable
      console.warn('API unavailable, using demo trips:', err.message)
      setTrips(DEMO_TRIPS)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const addTrip = useCallback(async (tripData) => {
    setLoading(true)
    try {
      const newTrip = await createTrip(tripData)
      setTrips((prev) => [newTrip, ...prev])
      toast.success('Trip created!')
      return { data: newTrip, error: null }
    } catch (err) {
      toast.error(err.message || 'Failed to create trip')
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTrip = useCallback(async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTrip(tripId)
      return { data, error: null }
    } catch (err) {
      const demoTrip = DEMO_TRIPS.find((t) => t.id === tripId)
      if (demoTrip) return { data: demoTrip, error: null }
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const editTrip = useCallback(async (tripId, updates) => {
    try {
      const updated = await updateTrip(tripId, updates)
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, ...updated } : t))
      )
      toast.success('Trip updated!')
      return { data: updated, error: null }
    } catch (err) {
      toast.error(err.message || 'Failed to update trip')
      return { data: null, error: err }
    }
  }, [])

  const removeTrip = useCallback(async (tripId) => {
    try {
      await deleteTrip(tripId)
      setTrips((prev) => prev.filter((t) => t.id !== tripId))
      toast.success('Trip deleted')
      return { error: null }
    } catch (err) {
      toast.error(err.message || 'Failed to delete trip')
      return { error: err }
    }
  }, [])

  return {
    trips,
    loading,
    error,
    fetchTrips,
    addTrip,
    fetchTrip,
    editTrip,
    removeTrip,
  }
}

export default useTrips
