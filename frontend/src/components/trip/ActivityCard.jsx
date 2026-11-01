import React from 'react'
import {
  Clock, MapPin, DollarSign, AlertCircle, Compass,
  Utensils, Hotel, Car, Camera, ShoppingBag, Landmark,
  Footprints, ChevronRight, CheckCircle2
} from 'lucide-react'
import Badge from '../ui/Badge'

const categoryIcons = {
  food: Utensils,
  dining: Utensils,
  restaurant: Utensils,
  sightseeing: Camera,
  activity: Compass,
  outdoor: Compass,
  adventure: Compass,
  culture: Landmark,
  museum: Landmark,
  history: Landmark,
  transport: Car,
  travel: Car,
  accommodation: Hotel,
  hotel: Hotel,
  shopping: ShoppingBag,
  leisure: Footprints,
  entertainment: Camera,
}

const categoryColors = {
  food: 'bg-amber-50 text-amber-700 border-amber-200',
  dining: 'bg-amber-50 text-amber-700 border-amber-200',
  sightseeing: 'bg-blue-50 text-blue-700 border-blue-200',
  activity: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  outdoor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  adventure: 'bg-teal-50 text-teal-700 border-teal-200',
  culture: 'bg-purple-50 text-purple-700 border-purple-200',
  museum: 'bg-purple-50 text-purple-700 border-purple-200',
  transport: 'bg-slate-100 text-slate-700 border-slate-200',
  accommodation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shopping: 'bg-pink-50 text-pink-700 border-pink-200',
  leisure: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  entertainment: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function ActivityCard({ activity, currency = 'USD', index = 0, onSelectLocation }) {
  if (!activity) return null

  const category = (activity.category || 'activity').toLowerCase()
  const Icon = categoryIcons[category] || Compass
  const colorClass = categoryColors[category] || 'bg-blue-50 text-blue-700 border-blue-200'

  const startTime = activity.start_time || activity.time_start || ''
  const endTime = activity.end_time || activity.time_end || ''
  const cost = activity.estimated_cost !== undefined ? activity.estimated_cost : (activity.cost || 0)
  const travelTime = activity.travel_time_from_previous || activity.travel_time_from_prev

  return (
    <div className="relative group">
      {/* Travel time indicator from previous activity */}
      {travelTime && travelTime !== 'N/A' && travelTime !== '0 min' && (
        <div className="flex items-center gap-2 my-2.5 ml-6 pl-4 border-l-2 border-dashed border-slate-300 text-xs text-slate-600">
          <Footprints size={13} className="text-slate-400" />
          <span className="font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {travelTime}
          </span>
        </div>
      )}

      {/* Main Activity Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-card hover:border-brand-200 transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Left: Category Icon + Title + Description */}
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass} shadow-xs`}>
              <Icon size={20} />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {activity.name}
                </h4>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border capitalize ${colorClass}`}>
                  {category}
                </span>
                {activity.booking_required && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle size={11} />
                    Booking Required
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {activity.description}
              </p>

              {/* Location button/link */}
              {activity.location && (
                <button
                  type="button"
                  onClick={() => onSelectLocation && onSelectLocation(activity.location)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 pt-1 font-medium group/loc text-left transition-colors"
                >
                  <MapPin size={13} className="text-brand-500 group-hover/loc:scale-110 transition-transform" />
                  <span className="underline decoration-slate-300 underline-offset-2">
                    {activity.location}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Time and Cost */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
            {startTime && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                <Clock size={12} className="text-slate-500" />
                <span>
                  {startTime} {endTime ? `- ${endTime}` : ''}
                </span>
              </div>
            )}

            <div className="text-right">
              <span className="text-xs text-slate-600 block">Est. Cost</span>
              <span className="text-sm font-bold text-slate-900">
                {Number(cost) === 0 ? (
                  <span className="text-emerald-600">Free</span>
                ) : (
                  `${currency} ${Number(cost).toLocaleString()}`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
