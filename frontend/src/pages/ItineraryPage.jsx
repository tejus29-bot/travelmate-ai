import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Download, Share2, RefreshCw, Calendar,
  Users, DollarSign, MapPin, Compass, AlertCircle,
  Lightbulb, ArrowLeft, Check, Layers, Printer
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import DayCard from '../components/trip/DayCard'
import BudgetBreakdown from '../components/trip/BudgetBreakdown'
import ItineraryMap from '../components/trip/ItineraryMap'
import Button from '../components/ui/Button'
import { useItinerary, DEMO_ITINERARY } from '../hooks/useItinerary'
import { useTrips } from '../hooks/useTrips'
import toast from 'react-hot-toast'

export default function ItineraryPage() {
  const { tripId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const {
    itinerary,
    loading,
    generating,
    fetchItinerary,
    regenerate,
    regenerateSingleDay,
    exportPDF,
    setItinerary,
  } = useItinerary()

  const { getTripById } = useTrips()

  const [tripDetails, setTripDetails] = useState(location.state?.tripData || null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeTab, setActiveTab] = useState('itinerary') // 'itinerary' | 'budget' | 'map'
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load itinerary on mount
  useEffect(() => {
    if (location.state?.initialItinerary) {
      setItinerary(location.state.initialItinerary)
    } else if (tripId) {
      fetchItinerary(tripId)
    }
  }, [tripId, location.state, fetchItinerary, setItinerary])

  // Current display data (fallback to DEMO_ITINERARY if not loaded)
  const currentItinerary = itinerary || DEMO_ITINERARY
  const destination = currentItinerary.destination || tripDetails?.destination || 'Destination'
  const tripTitle = currentItinerary.trip_title || currentItinerary.title || `${destination} Itinerary`
  const currency = currentItinerary.currency || tripDetails?.currency || 'USD'
  const days = currentItinerary.days || []
  const tips = currentItinerary.travel_tips || []

  const totalBudget = tripDetails?.budget || currentItinerary.total_estimated_budget || 0
  const isDemo = currentItinerary.is_demo || tripTitle.includes('[DEMO]')

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/shared/${tripId || 'demo'}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Shareable link copied to clipboard!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleRegenerateDay = async (dayNumber) => {
    await regenerateSingleDay(tripId || 'demo', dayNumber)
  }

  const handleRegenerateAll = async () => {
    if (!window.confirm('Regenerate the entire itinerary with fresh AI recommendations?')) return
    await regenerate(tripId || 'demo')
  }

  const handleDownloadPDF = async () => {
    await exportPDF(tripId || 'demo')
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb / Back */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertCircle size={12} />
                Demo Itinerary
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {days.length} Days Planned
            </span>
          </div>
        </div>

        {/* Demo Mode Notice Banner if active */}
        {isDemo && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Demo Mode Active</h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  This itinerary was generated using realistic sample data. Add your <code>OPENAI_API_KEY</code> in the backend environment file to enable live AI personalization.
                </p>
              </div>
            </div>
            <Link to="/trip/new">
              <Button variant="secondary" size="sm" className="flex-shrink-0 border-amber-300 bg-white">
                Plan Another Trip
              </Button>
            </Link>
          </div>
        )}

        {/* Itinerary Header Hero */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600">
                <MapPin size={12} />
                {destination}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {tripTitle}
              </h1>
              {currentItinerary.summary && (
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {currentItinerary.summary}
                </p>
              )}
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center flex-wrap gap-2.5 flex-shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyShareLink}
                leftIcon={copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              >
                {copied ? 'Copied!' : 'Share'}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadPDF}
                leftIcon={<Download size={16} />}
              >
                Download PDF
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleRegenerateAll}
                loading={generating}
                leftIcon={<RefreshCw size={16} />}
              >
                Regenerate Trip
              </Button>
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Duration</span>
              <span className="text-sm font-bold text-slate-900">{days.length} Days</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Total Activities</span>
              <span className="text-sm font-bold text-slate-900">
                {days.reduce((acc, d) => acc + (d.activities?.length || 0), 0)} Sights & Meals
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Est. Total Expense</span>
              <span className="text-sm font-bold text-slate-900">
                {currency} {Number(currentItinerary.total_estimated_budget || totalBudget).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Pacing</span>
              <span className="text-sm font-bold text-slate-900 capitalize">
                {tripDetails?.preferences?.activity_intensity || 'Balanced'}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Breakdown Section */}
        {currentItinerary.budget_breakdown && (
          <BudgetBreakdown
            budgetBreakdown={currentItinerary.budget_breakdown}
            totalBudget={totalBudget}
            totalEstimated={currentItinerary.total_estimated_budget}
            currency={currency}
          />
        )}

        {/* Two-Column Day Schedule + Interactive Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Day Cards (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-lg font-bold text-slate-900">Day-by-Day Schedule</h2>
              <span className="text-xs text-slate-500">
                Click any day to expand or regenerate
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
                ))}
              </div>
            ) : days.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
                No schedule days found. Try regenerating the itinerary.
              </div>
            ) : (
              days.map((day, idx) => (
                <DayCard
                  key={day.day_number || idx}
                  day={day}
                  currency={currency}
                  onRegenerateDay={handleRegenerateDay}
                  onSelectLocation={(loc) => setSelectedLocation(loc)}
                  defaultExpanded={idx === 0}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Interactive Map (5 cols on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <ItineraryMap
              destination={destination}
              days={days}
              selectedLocation={selectedLocation}
            />

            {/* Travel Tips Card */}
            {tips.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-500" />
                  Local Travel Tips for {destination}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
