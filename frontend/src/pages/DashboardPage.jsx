import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Plus, Search, Calendar, MapPin, Globe,
  TrendingUp, Compass, SlidersHorizontal, ArrowRight
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import TripCard from '../components/trip/TripCard'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useTrips } from '../hooks/useTrips'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, getDisplayName } = useAuth()
  const { trips, loading, fetchTrips, removeTrip } = useTrips()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStyle, setFilterStyle] = useState('all')

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const displayName = getDisplayName()

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      (t.destination || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStyle =
      filterStyle === 'all' ||
      (t.travel_style || '').toLowerCase() === filterStyle.toLowerCase()

    return matchesSearch && matchesStyle
  })

  // Calculate stats
  const totalTrips = trips.length
  const totalDays = trips.reduce((acc, t) => {
    if (!t.start_date || !t.end_date) return acc + 1
    const s = new Date(t.start_date)
    const e = new Date(t.end_date)
    const d = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1)
    return acc + (isNaN(d) ? 1 : d)
  }, 0)

  const uniqueDestinations = new Set(
    trips.map((t) => (t.destination || '').split(',')[0].trim()).filter(Boolean)
  ).size

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-300 backdrop-blur-md border border-white/10">
                <Sparkles size={12} className="text-brand-400" />
                AI Travel Concierge Active
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {displayName} ✈️
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                Ready to explore the world? Plan your next personalized trip with smart scheduling, budget tracking, and real-time interactive maps.
              </p>
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate('/trip/new')}
              leftIcon={<Plus size={18} />}
              className="flex-shrink-0"
            >
              Plan New Trip
            </Button>
          </div>
        </div>

        {/* Travel Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Compass size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{totalTrips}</span>
              <span className="text-xs text-slate-500 block font-medium">Total Trips</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{totalDays}</span>
              <span className="text-xs text-slate-500 block font-medium">Days Planned</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Globe size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">{uniqueDestinations}</span>
              <span className="text-xs text-slate-500 block font-medium">Destinations</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">GPT-4o</span>
              <span className="text-xs text-slate-500 block font-medium">AI Planner Engine</span>
            </div>
          </div>
        </div>

        {/* Trips Section Header & Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Saved Itineraries</h2>
              <p className="text-xs text-slate-500">
                Manage, regenerate, or share your travel plans
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 w-48 sm:w-64"
                />
              </div>

              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="all">All Styles</option>
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          {/* Trips Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-6 space-y-4">
                  <div className="h-40 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm my-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Compass size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? 'No trips match your search' : 'No trips planned yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching for a different destination or clear your filters.'
                  : 'Start by crafting your first AI-generated itinerary. It only takes 30 seconds!'}
              </p>
              <div className="pt-2">
                <Button
                  variant="gradient"
                  onClick={() => navigate('/trip/new')}
                  leftIcon={<Sparkles size={16} />}
                >
                  Create Your First Trip
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={removeTrip}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
