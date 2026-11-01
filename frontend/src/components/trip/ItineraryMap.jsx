import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Navigation, Compass } from 'lucide-react'

// Known destination fallback coordinates for instant smooth rendering
const cityCoordinates = {
  paris: [48.8566, 2.3522],
  tokyo: [35.6762, 139.6503],
  'new york': [40.7128, -74.006],
  nyc: [40.7128, -74.006],
  bali: [-8.4095, 115.1889],
  rome: [41.9028, 12.4964],
  santorini: [36.3932, 25.4615],
  london: [51.5074, -0.1278],
  dubai: [25.2048, 55.2708],
  barcelona: [41.3879, 2.1699],
  amsterdam: [52.3676, 4.9041],
  kyoto: [35.0116, 135.7681],
  'cape town': [-33.9249, 18.4241],
  default: [48.8566, 2.3522],
}

// Generate colored HTML marker icons
function createCustomPin(color = '#3b82f6', number = 1) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 700;
          font-size: 11px;
          font-family: Inter, system-ui, sans-serif;
        ">${number}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const dayColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

// Component to dynamically adjust map bounds when markers change
function MapBoundsUpdater({ markers }) {
  const map = useMap()

  useEffect(() => {
    if (!markers || markers.length === 0) return
    try {
      const bounds = L.latLngBounds(markers.map((m) => m.position))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    } catch (e) {
      // silently handle bounds error
    }
  }, [markers, map])

  return null
}

export default function ItineraryMap({
  destination = '',
  days = [],
  selectedLocation = null
}) {
  // Find base coordinates for the destination
  const defaultCenter = useMemo(() => {
    const lower = (destination || '').toLowerCase()
    for (const [key, coords] of Object.entries(cityCoordinates)) {
      if (lower.includes(key)) return coords
    }
    return cityCoordinates.default
  }, [destination])

  // Extract markers from days and activities with synthesized offsets around center
  const markers = useMemo(() => {
    const result = []
    let markerCount = 1

    days.forEach((day, dayIndex) => {
      const dayColor = dayColors[dayIndex % dayColors.length]
      const activities = day.activities || []

      activities.forEach((act, actIndex) => {
        // Slight pseudo-random geographic scatter based on index if exact coords aren't provided
        const latOffset = (Math.sin(dayIndex * 10 + actIndex) * 0.02)
        const lngOffset = (Math.cos(dayIndex * 10 + actIndex) * 0.025)

        result.push({
          id: `${dayIndex}-${actIndex}`,
          dayNumber: day.day_number || dayIndex + 1,
          name: act.name,
          location: act.location || destination,
          category: act.category,
          time: act.start_time || act.time_start || '',
          position: [defaultCenter[0] + latOffset, defaultCenter[1] + lngOffset],
          color: dayColor,
          number: markerCount++,
        })
      })
    })

    return result
  }, [days, defaultCenter, destination])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[480px] lg:h-[620px]">
      {/* Map Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Compass size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              Interactive Itinerary Map
            </h4>
            <p className="text-xs text-slate-500">
              {destination} • {markers.length} pinned locations
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            Day 1
          </span>
          {days.length > 1 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Day 2
            </span>
          )}
          {days.length > 2 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Day 3+
            </span>
          )}
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createCustomPin(marker.color, marker.number)}
            >
              <Popup>
                <div className="p-1 max-w-[220px]">
                  <span
                    style={{ backgroundColor: marker.color }}
                    className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1"
                  >
                    Day {marker.dayNumber} • #{marker.number}
                  </span>
                  <h5 className="font-bold text-sm text-slate-900 leading-tight">
                    {marker.name}
                  </h5>
                  {marker.location && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={11} className="flex-shrink-0 text-slate-400" />
                      <span className="truncate">{marker.location}</span>
                    </p>
                  )}
                  {marker.time && (
                    <p className="text-[11px] text-slate-600 font-medium mt-1">
                      Time: {marker.time}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          <MapBoundsUpdater markers={markers} />
        </MapContainer>
      </div>
    </div>
  )
}
