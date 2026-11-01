import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, Users, DollarSign, MapPin, Sparkles,
  ArrowRight, Trash2, Edit3, Share2, MoreVertical
} from 'lucide-react'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

// Curated high quality imagery per destination keyword
const destinationImages = {
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
}

function getDestinationImage(destination) {
  if (!destination) return destinationImages.default
  const lower = destination.toLowerCase()
  for (const [key, url] of Object.entries(destinationImages)) {
    if (lower.includes(key)) return url
  }
  return destinationImages.default
}

export default function TripCard({ trip, onDelete, onShare }) {
  const navigate = useNavigate()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const destination = trip.destination || 'Uncharted Destination'
  const imageUrl = getDestinationImage(destination)
  const currency = trip.currency || 'USD'
  const budget = Number(trip.budget || 0).toLocaleString()

  const calculateDays = () => {
    if (!trip.start_date || !trip.end_date) return null
    try {
      const start = new Date(trip.start_date)
      const end = new Date(trip.end_date)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    } catch {
      return null
    }
  }

  const durationDays = calculateDays()

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(trip.id)
      toast.success('Trip deleted')
      setDeleteModalOpen(false)
    } catch {
      toast.error('Failed to delete trip')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShareClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (onShare) {
      onShare(trip)
    } else {
      const shareUrl = `${window.location.origin}/shared/${trip.share_token || trip.id}`
      navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover overflow-hidden flex flex-col cursor-pointer transition-all"
        onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
      >
        {/* Destination Image & Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-black/20" />

          {/* Top Chips */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-navy-900 shadow-sm">
              <MapPin size={12} className="text-brand-500" />
              {destination.split(',')[0]}
            </span>
            <div className="flex items-center gap-1.5">
              {trip.travel_style && (
                <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/40 backdrop-blur-md text-white border border-white/20">
                  {trip.travel_style}
                </span>
              )}
            </div>
          </div>

          {/* Destination Title on bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-bold tracking-tight drop-shadow-sm truncate">
              {trip.title || destination}
            </h3>
            <p className="text-xs text-slate-200 truncate flex items-center gap-1 mt-0.5">
              <span>{trip.starting_location ? `From ${trip.starting_location}` : destination}</span>
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Calendar size={14} className="text-brand-500 flex-shrink-0" />
                <span className="truncate">
                  {trip.start_date ? `${trip.start_date} ${durationDays ? `(${durationDays}d)` : ''}` : 'Dates TBD'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Users size={14} className="text-brand-500 flex-shrink-0" />
                <span>{trip.travelers || 1} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
              </div>
            </div>

            {/* Budget Row */}
            <div className="flex items-center justify-between pt-1 text-sm border-t border-slate-100">
              <span className="text-xs text-slate-500">Estimated Budget</span>
              <span className="font-semibold text-slate-900 flex items-center">
                <span className="text-xs text-slate-500 mr-1">{currency}</span>
                {budget}
              </span>
            </div>
          </div>

          {/* Card Actions */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleShareClick}
                title="Share Trip"
                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Share2 size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/trip/${trip.id}/edit`)
                }}
                title="Edit Trip"
                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteModalOpen(true)
                }}
                title="Delete Trip"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700 transition-colors">
              View Itinerary
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Trip"
        description="Are you sure you want to delete this trip and its itinerary? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
          >
            Delete Trip
          </Button>
        </div>
      </Modal>
    </>
  )
}
