import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plane, Sparkles, Map, Calendar, DollarSign, Share2,
  FileDown, ChevronRight, Star, ArrowRight, Globe, Zap
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

// ─── Data ────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Planning',
    description: 'Our advanced AI analyzes thousands of travel options to craft the perfect itinerary for your unique preferences.',
    color: 'from-brand-500 to-sky-500',
  },
  {
    icon: DollarSign,
    title: 'Smart Budgeting',
    description: 'Get detailed cost breakdowns across accommodation, food, activities, and transport — all within your budget.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    description: 'Visualize your entire trip on an interactive map with all activities pinpointed and routes optimized.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Calendar,
    title: 'Day-by-Day Schedule',
    description: 'Every hour planned with perfect timing — no more wondering what to do next on your vacation.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Share2,
    title: 'Save & Share',
    description: 'Save your itineraries to your account and share them with travel companions via a simple link.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: FileDown,
    title: 'PDF Export',
    description: 'Download a beautifully formatted PDF of your itinerary for offline access during your travels.',
    color: 'from-sky-500 to-cyan-500',
  },
]

const steps = [
  { number: '01', title: 'Enter Preferences', description: 'Tell us your destination, travel dates, budget, interests, and travel style.' },
  { number: '02', title: 'AI Generates', description: 'Our AI engine crafts a detailed, personalized itinerary in seconds.' },
  { number: '03', title: 'Review & Customize', description: 'Browse your day-by-day plan, regenerate days you want to change.' },
  { number: '04', title: 'Travel!', description: 'Download your PDF or access your plan anywhere on the go.' },
]

const destinations = [
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', tag: 'Romance' },
  { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', tag: 'Culture' },
  { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80', tag: 'City Life' },
  { city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', tag: 'Paradise' },
  { city: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80', tag: 'History' },
  { city: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80', tag: 'Beauty' },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Travel Blogger',
    quote: "TravelMate AI saved me 10 hours of planning for my Japan trip. The itinerary was so detailed and spot-on — it even suggested hidden gems I'd never have found!",
    rating: 5,
    avatar: 'SC',
    color: 'from-brand-500 to-sky-500',
  },
  {
    name: 'Marcus Williams',
    role: 'Software Engineer',
    quote: "I'm a budget traveler and the AI perfectly tailored everything to my $1500 limit. The budget breakdown was incredibly accurate.",
    rating: 5,
    avatar: 'MW',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Priya Sharma',
    role: 'Photographer',
    quote: "The photography interest filter is amazing! Every day had the perfect golden-hour spots and unique angles. My best travel photos came from this trip.",
    rating: 5,
    avatar: 'PS',
    color: 'from-purple-500 to-pink-500',
  },
]

const floatingChips = ['🗼 Paris', '🍣 Tokyo', '🏖️ Bali', '🗽 New York', '🏛️ Rome', '🌅 Santorini', '🦁 Safari', '🏔️ Alps']

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  const [destination, setDestination] = useState('')
  const navigate = useNavigate()

  const handlePlanTrip = () => {
    if (destination.trim()) {
      navigate(`/trip/new?destination=${encodeURIComponent(destination.trim())}`)
    } else {
      navigate('/trip/new')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePlanTrip()
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-navy-950 min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-600/20 blur-3xl animate-pulse-slow animation-delay-400" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-900/30 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            AI-Powered Travel Planning
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
          >
            Plan Your Perfect{' '}
            <span className="relative">
              <span className="gradient-text">Trip with AI</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 9C50 3 100 3 150 6C200 9 250 9 298 5" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop stopColor="#3b82f6"/>
                    <stop offset="1" stopColor="#0ea5e9"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Get personalized, day-by-day travel itineraries in seconds. Just tell us where
            you want to go and we'll handle the rest — completely free.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <div className="flex-1 relative">
              <Globe
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Where do you want to go?"
                className="w-full h-14 pl-11 pr-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                  backdrop-blur-sm text-sm sm:text-base transition-all"
              />
            </div>
            <Button
              variant="gradient"
              size="lg"
              onClick={handlePlanTrip}
              rightIcon={<ArrowRight size={18} />}
              className="h-14 px-8 rounded-2xl whitespace-nowrap shadow-glow-lg"
            >
              Plan My Trip
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-8 text-sm text-slate-400"
          >
            {[
              { value: '50K+', label: 'Trips Planned' },
              { value: '120+', label: 'Destinations' },
              { value: '4.9★', label: 'Rating' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-white font-bold text-lg">{value}</div>
                <div className="text-xs">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Floating chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-12 flex flex-wrap gap-2 justify-center"
          >
            {floatingChips.map((chip, i) => (
              <motion.button
                key={chip}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' },
                }}
                onClick={() => {
                  const dest = chip.replace(/[^\w\s]/g, '').trim()
                  navigate(`/trip/new?destination=${encodeURIComponent(dest)}`)
                }}
                className="px-4 py-2 rounded-full glass border border-white/15 text-white text-sm font-medium
                  hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer"
              >
                {chip}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-slate-500"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-brand-600 tracking-widest uppercase">Features</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              Everything you need to plan the{' '}
              <span className="gradient-text">perfect trip</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              From AI-generated itineraries to interactive maps — we've built all the tools
              that modern travelers actually need.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, description, color }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-brand-600 tracking-widest uppercase">How It Works</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              From idea to itinerary in{' '}
              <span className="gradient-text">60 seconds</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map(({ number, title, description }, idx) => (
              <motion.div key={number} variants={fadeUp} className="relative text-center">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+2rem)] w-full h-px bg-gradient-to-r from-brand-200 to-transparent" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-sky-500 text-white font-bold text-2xl shadow-glow mx-auto mb-5">
                  {number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── POPULAR DESTINATIONS ──────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-brand-600 tracking-widest uppercase">Destinations</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              Popular <span className="gradient-text">destinations</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Click any destination to start planning instantly.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {destinations.map(({ city, country, image, tag }) => (
              <motion.div
                key={city}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/trip/new?destination=${encodeURIComponent(`${city}, ${country}`)}`)}
                className="group cursor-pointer rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Tag */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {tag}
                  </span>
                  {/* Explore button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-semibold shadow-lg">
                      Explore <ArrowRight size={12} />
                    </div>
                  </div>
                  {/* City name */}
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white">{city}</h3>
                    <p className="text-slate-300 text-sm">{country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-brand-600 tracking-widest uppercase">Testimonials</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              Loved by <span className="gradient-text">travelers worldwide</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map(({ name, role, quote, rating, avatar, color }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-navy-950 to-brand-900 p-12 text-center shadow-2xl"
          >
            {/* BG orbs */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
                <Plane size={28} className="text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                Ready to Plan Your<br />
                <span className="gradient-text">Dream Trip?</span>
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-lg mx-auto">
                Join thousands of travelers who've discovered the smarter way to explore the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button variant="gradient" size="xl" rightIcon={<ArrowRight size={20} />} className="shadow-glow-lg">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/trip/new">
                  <Button variant="white" size="xl">
                    View Demo
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-slate-400 text-sm">No credit card required · Free forever</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
