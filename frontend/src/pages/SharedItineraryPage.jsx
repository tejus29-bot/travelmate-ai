import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Plane, Sparkles, MapPin, Calendar, Users, DollarSign,
  Download, ArrowRight, Compass, ShieldCheck
} from 'lucide-react'
import DayCard from '../components/trip/DayCard'
import BudgetBreakdown from '../components/trip/BudgetBreakdown'
import ItineraryMap from '../components/trip/ItineraryMap'
import Button from '../components/ui/Button'
import { getSharedItinerary, downloadPDF } from '../services/api'
import { DEMO_ITINERARY } from '../hooks/useItinerary'
import toast from 'react-hot-toast'

export default function SharedItineraryPage() {
  const { token } = useParams()
  const [itinerary, setItinerary] = useState(null)
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadShared() {
      try {
        const data = await getSharedItinerary(token)
        if (data?.itinerary) {
          setItinerary(data.itinerary)
          setTrip(data.trip)
        } else {
          setItinerary(DEMO_ITINERARY)
        }
      } catch (err) {
        // Fallback gracefully
        setItinerary(DEMO_ITINERARY)
      } finally {
        setLoading(false)
      }
    }
    loadShared()
  }, [token])

  const currentItin = itinerary || DEMO_ITINERARY
  const destination = currentItin.destination || 'Destination'
  const tripTitle = currentItin.trip_title || currentItin.title || `${destination} Travel Itinerary`
  const days = currentItin.days || []
  const currency = currentItin.currency || 'USD'

  const handleDownload = async () => {
    try {
      toast.loading('Preparing PDF...', { id: 'pdf-toast' })
      const blob = await downloadPDF(trip?.id || 'demo')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `travelmate-${destination.toLowerCase().replace(/ /g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!', { id: 'pdf-toast' })
    } catch {
      toast.error('Download not available in preview mode', { id: 'pdf-toast' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Loading shared itinerary...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner CTA */}
      <div className="bg-navy-950 text-white px-4 py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center font-bold">
              <Plane size={14} />
            </div>
            <span>
              This travel itinerary was created with <strong>TravelMate AI</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signup">
              <Button variant="gradient" size="xs" rightIcon={<ArrowRight size={12} />}>
                Plan Your Own Trip Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Header Hero */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600">
                <MapPin size={12} />
                {destination}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {tripTitle}
              </h1>
              {currentItin.summary && (
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {currentItin.summary}
                </p>
              )}
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={handleDownload}
              leftIcon={<Download size={16} />}
            >
              Download PDF
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Total Days</span>
              <span className="text-sm font-bold text-slate-900">{days.length} Days</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Activities</span>
              <span className="text-sm font-bold text-slate-900">
                {days.reduce((acc, d) => acc + (d.activities?.length || 0), 0)} Sights & Meals
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Est. Budget</span>
              <span className="text-sm font-bold text-slate-900">
                {currency} {Number(currentItin.total_estimated_budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Shared View</span>
              <span className="text-sm font-bold text-brand-600">Public Link</span>
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        {currentItin.budget_breakdown && (
          <BudgetBreakdown
            budgetBreakdown={currentItin.budget_breakdown}
            totalBudget={currentItin.total_estimated_budget}
            currency={currency}
          />
        )}

        {/* Schedule & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-2">Day-by-Day Schedule</h2>
            {days.map((day, idx) => (
              <DayCard
                key={day.day_number || idx}
                day={day}
                currency={currency}
                defaultExpanded={idx === 0}
              />
            ))}
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <ItineraryMap destination={destination} days={days} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Generated with ❤️ by TravelMate AI
      </footer>
    </div>
  )
}
