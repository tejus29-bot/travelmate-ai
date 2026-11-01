import { useState, useCallback } from 'react'
import { generateItinerary, regenerateItinerary, regenerateDay, getItinerary, downloadPDF } from '../services/api'
import toast from 'react-hot-toast'

// Demo itinerary data
export const DEMO_ITINERARY = {
  id: 'demo-itinerary-1',
  trip_id: 'demo-trip-1',
  destination: 'Paris, France',
  title: 'Paris Getaway',
  start_date: '2024-06-15',
  end_date: '2024-06-22',
  travelers: 2,
  budget: 3000,
  currency: 'USD',
  travel_style: 'Moderate',
  is_demo: true,
  travel_tips: [
    'Buy a Paris Museum Pass for savings on major attractions.',
    'Metro is the best way to get around – buy a carnet (book of 10 tickets).',
    'Most museums are free on the first Sunday of each month.',
    'Book restaurants in advance, especially for dinner.',
    'The Eiffel Tower is free to visit from outside – amazing at night!',
  ],
  budget_breakdown: {
    accommodation: { amount: 900, percentage: 30, label: 'Accommodation' },
    food: { amount: 600, percentage: 20, label: 'Food & Dining' },
    transport: { amount: 450, percentage: 15, label: 'Transport' },
    activities: { amount: 750, percentage: 25, label: 'Activities & Tours' },
    shopping: { amount: 300, percentage: 10, label: 'Shopping & Misc' },
  },
  days: [
    {
      day_number: 1,
      date: '2024-06-15',
      theme: 'Arrival & Eiffel Tower',
      activities: [
        {
          id: 'a1',
          time_start: '14:00',
          time_end: '15:30',
          name: 'Check-in at Hotel Le Marais',
          description: 'Check into your boutique hotel in the heart of Le Marais district. Drop your bags and freshen up.',
          location: 'Le Marais, Paris',
          category: 'accommodation',
          cost: 180,
          booking_required: true,
          travel_time_from_prev: null,
        },
        {
          id: 'a2',
          time_start: '16:00',
          time_end: '18:00',
          name: 'Eiffel Tower Visit',
          description: 'Head to the iconic Eiffel Tower. Book summit tickets in advance for breathtaking views of Paris.',
          location: 'Champ de Mars, 5 Avenue Anatole France, Paris',
          category: 'activity',
          cost: 29,
          booking_required: true,
          travel_time_from_prev: '25 min by Metro',
        },
        {
          id: 'a3',
          time_start: '19:30',
          time_end: '21:00',
          name: 'Dinner at Café de Flore',
          description: 'Iconic Parisian café on Boulevard Saint-Germain. Enjoy classic French cuisine and people-watch.',
          location: '172 Boulevard Saint-Germain, Paris',
          category: 'food',
          cost: 55,
          booking_required: false,
          travel_time_from_prev: '20 min by Metro',
        },
      ],
    },
    {
      day_number: 2,
      date: '2024-06-16',
      theme: 'Louvre & Seine',
      activities: [
        {
          id: 'a4',
          time_start: '09:00',
          time_end: '09:30',
          name: 'Breakfast at Angelina Paris',
          description: 'Famous tearoom known for its rich hot chocolate and Mont-Blanc pastry. A Paris institution.',
          location: '226 Rue de Rivoli, Paris',
          category: 'food',
          cost: 22,
          booking_required: false,
          travel_time_from_prev: null,
        },
        {
          id: 'a5',
          time_start: '10:00',
          time_end: '14:00',
          name: 'Louvre Museum',
          description: 'World\'s largest art museum. See the Mona Lisa, Venus de Milo, and thousands of masterpieces. Pre-book timed entry tickets.',
          location: 'Rue de Rivoli, 75001 Paris',
          category: 'activity',
          cost: 22,
          booking_required: true,
          travel_time_from_prev: '5 min walk',
        },
        {
          id: 'a6',
          time_start: '15:00',
          time_end: '17:00',
          name: 'Seine River Cruise',
          description: 'A 1-hour Bateaux Mouches cruise along the Seine, passing Notre-Dame, Musée d\'Orsay, and more.',
          location: 'Pont de l\'Alma, Paris',
          category: 'activity',
          cost: 18,
          booking_required: false,
          travel_time_from_prev: '15 min walk',
        },
        {
          id: 'a7',
          time_start: '19:00',
          time_end: '21:30',
          name: 'Dinner in Montmartre',
          description: 'Explore the charming streets of Montmartre. Dine at a local bistro with views of Sacré-Cœur.',
          location: 'Montmartre, Paris',
          category: 'food',
          cost: 45,
          booking_required: false,
          travel_time_from_prev: '30 min by Metro',
        },
      ],
    },
    {
      day_number: 3,
      date: '2024-06-17',
      theme: 'Versailles Day Trip',
      activities: [
        {
          id: 'a8',
          time_start: '08:30',
          time_end: '09:00',
          name: 'Early Train to Versailles',
          description: 'Take the RER C train from Paris to Versailles Château. Go early to beat the crowds.',
          location: 'Gare d\'Austerlitz, Paris',
          category: 'transport',
          cost: 8,
          booking_required: false,
          travel_time_from_prev: null,
        },
        {
          id: 'a9',
          time_start: '09:30',
          time_end: '14:00',
          name: 'Palace of Versailles',
          description: 'Explore the opulent royal palace, Hall of Mirrors, and the magnificent gardens. Pre-book tickets.',
          location: 'Palace of Versailles, Versailles',
          category: 'activity',
          cost: 21,
          booking_required: true,
          travel_time_from_prev: '40 min by RER C',
        },
        {
          id: 'a10',
          time_start: '15:00',
          time_end: '16:30',
          name: 'Return to Paris',
          description: 'Take the RER C back to Paris. Stop at Luxembourg Gardens for an evening stroll.',
          location: 'RER C Train',
          category: 'transport',
          cost: 8,
          booking_required: false,
          travel_time_from_prev: null,
        },
        {
          id: 'a11',
          time_start: '19:00',
          time_end: '21:00',
          name: 'Le Comptoir du Relais',
          description: 'One of Paris\'s most beloved bistros in Saint-Germain-des-Prés. Classic French menu.',
          location: '9 Carrefour de l\'Odéon, Paris',
          category: 'food',
          cost: 50,
          booking_required: true,
          travel_time_from_prev: '20 min by Metro',
        },
      ],
    },
  ],
}

export function useItinerary() {
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const fetchItinerary = useCallback(async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getItinerary(tripId)
      setItinerary(data)
      return { data, error: null }
    } catch (err) {
      console.warn('API unavailable, using demo itinerary')
      setItinerary(DEMO_ITINERARY)
      return { data: DEMO_ITINERARY, error: null }
    } finally {
      setLoading(false)
    }
  }, [])

  const generate = useCallback(async (tripData) => {
    setGenerating(true)
    setError(null)
    try {
      const data = await generateItinerary(tripData)
      setItinerary(data)
      toast.success('Itinerary generated!')
      return { data, error: null }
    } catch (err) {
      console.warn('API unavailable, returning demo itinerary')
      const demo = { ...DEMO_ITINERARY, destination: tripData.destination || 'Your Destination' }
      setItinerary(demo)
      toast.success('Demo itinerary loaded!')
      return { data: demo, error: null }
    } finally {
      setGenerating(false)
    }
  }, [])

  const regenerate = useCallback(async (tripId) => {
    setGenerating(true)
    try {
      const data = await regenerateItinerary(tripId)
      setItinerary(data)
      toast.success('Itinerary regenerated!')
      return { data, error: null }
    } catch (err) {
      toast.error(err.message || 'Failed to regenerate')
      return { data: null, error: err }
    } finally {
      setGenerating(false)
    }
  }, [])

  const regenerateSingleDay = useCallback(async (tripId, dayNumber) => {
    try {
      const data = await regenerateDay(tripId, dayNumber)
      setItinerary((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.day_number === dayNumber ? { ...d, ...data } : d
          ),
        }
      })
      toast.success(`Day ${dayNumber} regenerated!`)
      return { data, error: null }
    } catch (err) {
      toast.error(err.message || 'Failed to regenerate day')
      return { data: null, error: err }
    }
  }, [])

  const exportPDF = useCallback(async (tripId) => {
    try {
      toast.loading('Preparing PDF...', { id: 'pdf-toast' })
      const blob = await downloadPDF(tripId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `travelmate-itinerary-${tripId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!', { id: 'pdf-toast' })
      return { error: null }
    } catch (err) {
      toast.error('PDF download failed. Try again.', { id: 'pdf-toast' })
      return { error: err }
    }
  }, [])

  return {
    itinerary,
    loading,
    generating,
    error,
    fetchItinerary,
    generate,
    regenerate,
    regenerateSingleDay,
    exportPDF,
    setItinerary,
  }
}

export default useItinerary
