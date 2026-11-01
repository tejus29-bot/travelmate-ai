import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Calendar, Users, DollarSign, Sparkles,
  ArrowRight, ArrowLeft, Check, Compass, Utensils,
  Hotel, Car, Clock, ShieldCheck, Heart
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useItinerary } from '../hooks/useItinerary'
import { useTrips } from '../hooks/useTrips'
import toast from 'react-hot-toast'

const interestOptions = [
  { id: 'Adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'Food', label: 'Food & Dining', emoji: '🍜' },
  { id: 'Nature', label: 'Nature & Parks', emoji: '🌿' },
  { id: 'History', label: 'History & Heritage', emoji: '🏛️' },
  { id: 'Shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'Culture', label: 'Culture & Arts', emoji: '🎭' },
  { id: 'Nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'Photography', label: 'Photography', emoji: '📸' },
  { id: 'Beach', label: 'Beach & Sea', emoji: '🏖️' },
  { id: 'Relaxation', label: 'Spa & Relaxation', emoji: '🧖' },
]

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']

const travelStyles = [
  { id: 'budget', label: 'Budget', desc: 'Hostels, public transit, street food & free sights', emoji: '💰' },
  { id: 'moderate', label: 'Moderate', desc: '3-4★ hotels, mixed dining, paid attractions', emoji: '⭐' },
  { id: 'luxury', label: 'Luxury', desc: '5★ resorts, private tours & fine dining experiences', emoji: '👑' },
]

const intensities = [
  { id: 'relaxed', label: 'Relaxed', desc: '2-3 activities/day, late mornings & leisurely meals', emoji: '😌' },
  { id: 'balanced', label: 'Balanced', desc: '4-5 activities/day, balanced mix of rest and sights', emoji: '⚖️' },
  { id: 'packed', label: 'Action-Packed', desc: '6+ activities/day, early starts to see everything', emoji: '🏃' },
]

const accommodationTypes = ['Hotel', 'Hostel', 'Resort', 'Airbnb / Apartment', 'Boutique Hotel']
const transportationTypes = ['Public Transit', 'Rental Car', 'Taxi / Rideshare', 'Walking', 'Mixed']
const dietaryOptions = ['No restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free']

export default function TripBuilderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { generate, generating } = useItinerary()
  const { addTrip } = useTrips()

  // Pre-fill from navigation state if available (e.g., from landing page destination card)
  const queryParams = new URLSearchParams(location.search)
  const prefilledDestination = queryParams.get('destination') || location.state?.destination || ''

  const [step, setStep] = useState(1)

  // Form State
  const [formData, setFormData] = useState({
    destination: prefilledDestination,
    starting_location: '',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelers: 2,
    budget: 2500,
    currency: 'USD',
    travel_style: 'moderate',
    interests: ['Food', 'Culture', 'Sightseeing'],
    activity_intensity: 'balanced',
    accommodation_type: 'Hotel',
    transportation: 'Mixed',
    dietary: ['No restrictions'],
    additional_instructions: '',
  })

  const [generatingMessageIndex, setGeneratingMessageIndex] = useState(0)

  const loadingMessages = [
    'Analyzing destination geography & attractions...',
    'Optimizing route schedule to minimize travel time...',
    'Matching local restaurants and dining hotspots...',
    'Balancing budget allocations & estimated expenses...',
    'Polishing day-by-day itinerary with expert tips...',
  ]

  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleInterest = (id) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(id)
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== id) : [...prev.interests, id],
      }
    })
  }

  const toggleDietary = (item) => {
    setFormData((prev) => {
      const exists = prev.dietary.includes(item)
      return {
        ...prev,
        dietary: exists ? prev.dietary.filter((d) => d !== item) : [...prev.dietary, item],
      }
    })
  }

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.destination.trim()) {
        toast.error('Please enter a destination')
        return false
      }
      if (!formData.starting_location.trim()) {
        toast.error('Please enter your starting location')
        return false
      }
      if (!formData.start_date || !formData.end_date) {
        toast.error('Please select both departure and return dates')
        return false
      }
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        toast.error('Return date cannot be earlier than departure date')
        return false
      }
    }
    if (currentStep === 2) {
      if (!formData.budget || formData.budget <= 0) {
        toast.error('Please enter a valid budget')
        return false
      }
    }
    if (currentStep === 3) {
      if (formData.interests.length === 0) {
        toast.error('Please select at least one interest')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1))
    }
  }

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const handleGenerate = async () => {
    // Start interval to cycle fun loading messages
    const timer = setInterval(() => {
      setGeneratingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2500)

    try {
      // 1. Create or prepare trip in database / store
      const tripPayload = {
        title: `${formData.destination} Trip`,
        destination: formData.destination,
        starting_location: formData.starting_location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        travelers: Number(formData.travelers),
        budget: Number(formData.budget),
        currency: formData.currency,
        travel_style: formData.travel_style,
        preferences: {
          interests: formData.interests,
          accommodation_type: formData.accommodation_type,
          transportation: formData.transportation,
          dietary: formData.dietary,
          activity_intensity: formData.activity_intensity,
          additional_instructions: formData.additional_instructions,
        },
      }

      const trip = await addTrip(tripPayload)
      const tripId = trip?.id || `trip-${Date.now()}`

      // 2. Request AI generation
      const genPayload = {
        ...tripPayload,
        trip_id: tripId,
      }

      const result = await generate(genPayload)
      clearInterval(timer)

      // 3. Navigate to itinerary view
      navigate(`/trip/${tripId}/itinerary`, {
        state: { tripData: tripPayload, initialItinerary: result?.data },
      })
    } catch (err) {
      clearInterval(timer)
      toast.error('Could not generate itinerary. Please try again.')
    }
  }

  return (
    <AppLayout>
      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white px-4">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={28} className="text-brand-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
            Crafting Your Personalized Itinerary
          </h3>
          <p className="text-sm text-slate-300 mt-2 text-center max-w-sm h-6 transition-all duration-300">
            {loadingMessages[generatingMessageIndex]}
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Step Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'Where & When'}
              {step === 2 && 'Budget & Style'}
              {step === 3 && 'Interests & Vibe'}
              {step === 4 && 'Food & Transit'}
              {step === 5 && 'Review & Generate'}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-sky-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Form Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-6"
        >
          {/* STEP 1: WHERE & WHEN */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Where would you like to go?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tell us your dream destination, departure point, and travel dates.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Destination"
                  placeholder="e.g. Paris, France or Tokyo, Japan"
                  value={formData.destination}
                  onChange={(e) => updateForm('destination', e.target.value)}
                  leftIcon={<MapPin size={16} />}
                  required
                />

                <Input
                  label="Starting Location (Home City / Airport)"
                  placeholder="e.g. New York (JFK) or London (LHR)"
                  value={formData.starting_location}
                  onChange={(e) => updateForm('starting_location', e.target.value)}
                  leftIcon={<Compass size={16} />}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Departure Date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateForm('start_date', e.target.value)}
                    leftIcon={<Calendar size={16} />}
                    required
                  />
                  <Input
                    label="Return Date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateForm('end_date', e.target.value)}
                    leftIcon={<Calendar size={16} />}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Number of Travelers
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateForm('travelers', num)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          formData.travelers === num
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num === 5 ? '5+' : num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUDGET & STYLE */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Budget & Travel Style
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  How much would you like to spend and how do you prefer to travel?
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input
                      label="Total Travel Budget"
                      type="number"
                      min="100"
                      step="50"
                      value={formData.budget}
                      onChange={(e) => updateForm('budget', Number(e.target.value))}
                      leftIcon={<DollarSign size={16} />}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateForm('currency', e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      {currencies.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Travel Style
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {travelStyles.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => updateForm('travel_style', style.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          formData.travel_style === style.id
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{style.emoji}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{style.label}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{style.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INTERESTS & VIBE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  What excites you?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select your interests and how you pace your travel days.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Your Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((item) => {
                      const selected = formData.interests.includes(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleInterest(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            selected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{item.emoji}</span>
                          <span>{item.label}</span>
                          {selected && <Check size={13} className="ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Activity Intensity
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {intensities.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => updateForm('activity_intensity', item.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          formData.activity_intensity === item.id
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="text-xl block mb-1">{item.emoji}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{item.label}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Preferred Accommodation Type
                  </label>
                  <select
                    value={formData.accommodation_type}
                    onChange={(e) => updateForm('accommodation_type', e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    {accommodationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FOOD & TRANSIT */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Food & Transportation
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Specify dietary needs and how you want to move around.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dietary Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((item) => {
                      const selected = formData.dietary.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleDietary(item)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            selected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Transportation Preference
                  </label>
                  <select
                    value={formData.transportation}
                    onChange={(e) => updateForm('transportation', e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    {transportationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Special Requests or Extra Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Traveling with kids, need wheelchair accessible spots, prefer hidden gems over tourist traps..."
                    value={formData.additional_instructions}
                    onChange={(e) => updateForm('additional_instructions', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & GENERATE */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Ready to Generate!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Review your travel details before our AI builds your day-by-day itinerary.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Destination</span>
                    <span className="text-sm font-bold text-slate-900">{formData.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">From</span>
                    <span className="text-sm font-bold text-slate-900">{formData.starting_location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Dates</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formData.start_date} to {formData.end_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Travelers & Budget</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formData.travelers} • {formData.currency} {Number(formData.budget).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Style & Pace</span>
                    <span className="text-sm font-bold text-slate-900 capitalize">
                      {formData.travel_style} • {formData.activity_intensity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Accommodation & Transit</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formData.accommodation_type} • {formData.transportation}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-xs font-medium block mb-1.5">Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.interests.map((int) => (
                      <span
                        key={int}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700"
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={prevStep}
                leftIcon={<ArrowLeft size={16} />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                variant="primary"
                size="md"
                onClick={nextStep}
                rightIcon={<ArrowRight size={16} />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="lg"
                onClick={handleGenerate}
                loading={generating}
                leftIcon={<Sparkles size={18} />}
              >
                Generate My Itinerary
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
