import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Sparkles, ChevronDown, RefreshCw,
  Sun, Compass, Clock, MapPin
} from 'lucide-react'
import ActivityCard from './ActivityCard'
import Button from '../ui/Button'

export default function DayCard({
  day,
  currency = 'USD',
  onRegenerateDay,
  onSelectLocation,
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isRegenerating, setIsRegenerating] = useState(false)

  if (!day) return null

  const activities = day.activities || []
  const dayNumber = day.day_number || 1
  const theme = day.theme || 'Exploration & Sightseeing'
  const dateStr = day.date || ''

  const totalCost = activities.reduce((sum, act) => {
    const cost = act.estimated_cost !== undefined ? act.estimated_cost : (act.cost || 0)
    return sum + Number(cost)
  }, 0)

  const handleRegenerate = async (e) => {
    e.stopPropagation()
    if (!onRegenerateDay) return
    setIsRegenerating(true)
    try {
      await onRegenerateDay(dayNumber)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
      {/* Day Header Accordion Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Day number badge */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sky-600 text-white flex flex-col items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-sky-100">Day</span>
            <span className="text-lg leading-none">{dayNumber}</span>
          </div>

          <div className="space-y-0.5 truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {theme}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {dateStr && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-brand-500" />
                  {dateStr}
                </span>
              )}
              <span>•</span>
              <span>{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</span>
              <span>•</span>
              <span>Est. {currency} {totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right side: Regenerate button + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRegenerateDay && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              title="Regenerate this day's itinerary"
              className="p-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 border border-slate-200/80 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={isRegenerating ? 'animate-spin text-brand-600' : ''} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {/* Activities list accordion content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 sm:p-6 space-y-3 bg-white">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No activities planned for this day yet.
                </div>
              ) : (
                activities.map((activity, idx) => (
                  <ActivityCard
                    key={activity.id || idx}
                    activity={activity}
                    currency={currency}
                    index={idx}
                    onSelectLocation={onSelectLocation}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
