import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Calendar, Users, DollarSign, MapPin, Sparkles,
  ArrowRight, Edit3, Trash2, ArrowLeft, Download, Share2
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import Button from '../components/ui/Button'
import { useTrips } from '../hooks/useTrips'
import { useItinerary } from '../hooks/useItinerary'
import toast from 'react-hot-toast'

export default function TripDetailPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { trips, fetchTrips, removeTrip } = useTrips()
  const { exportPDF } = useItinerary()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips().then(() => {
      setLoading(false)
    })
  }, [fetchTrips])

  useEffect(() => {
    if (trips.length > 0) {
      const found = trips.find((t) => t.id === tripId)
      if (found) {
        setTrip(found)
      } else {
        // Fallback for demo ID
        setTrip(trips[0])
      }
    }
  }, [trips, tripId])

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
          Loading trip details...
        </div>
      </AppLayout>
    )
  }

  const destination = trip?.destination || 'Destination'
  const currency = trip?.currency || 'USD'

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600">
                {destination}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {trip?.title || `${destination} Trip`}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Created on {trip?.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => navigate(`/trip/${tripId}/itinerary`)}
                rightIcon={<ArrowRight size={16} />}
              >
                View Full Itinerary
              </Button>
            </div>
          </div>

          {/* Key Trip Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium block">Starting Point</span>
              <span className="text-sm font-bold text-slate-900">{trip?.starting_location || 'N/A'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium block">Travel Dates</span>
              <span className="text-sm font-bold text-slate-900">
                {trip?.start_date} to {trip?.end_date}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium block">Travelers</span>
              <span className="text-sm font-bold text-slate-900">{trip?.travelers || 1}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium block">Budget</span>
              <span className="text-sm font-bold text-slate-900">
                {currency} {Number(trip?.budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium block">Travel Style</span>
              <span className="text-sm font-bold text-slate-900 capitalize">
                {trip?.travel_style || 'Moderate'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium block">Status</span>
              <span className="text-sm font-bold text-emerald-600 capitalize">
                {trip?.status || 'Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportPDF(tripId)}
              leftIcon={<Download size={14} />}
            >
              Download PDF Itinerary
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trip/${tripId}/edit`)}
              leftIcon={<Edit3 size={14} />}
            >
              Edit Preferences
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
