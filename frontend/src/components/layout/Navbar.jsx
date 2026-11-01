import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Plane, LayoutDashboard, Map, User, LogOut, ChevronDown, Menu, X, Sparkles, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trip/new', label: 'Plan Trip', icon: Sparkles },
]

export default function Navbar() {
  const { user, signOut, getDisplayName, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  const displayName = getDisplayName()
  const avatarLetter = displayName?.charAt(0).toUpperCase() || 'T'

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to={user ? '/dashboard' : '/'}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Plane size={18} className="text-white" />
              </div>
              <span className="font-bold text-navy-950 text-lg leading-none">
                TravelMate<span className="gradient-text"> AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isDemoMode && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode
                </span>
              )}

              {user ? (
                <>
                  {/* User avatar dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {avatarLetter}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-slate-100 overflow-hidden py-1"
                        >
                          <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <User size={15} className="text-slate-400" /> Profile
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Settings size={15} className="text-slate-400" /> Settings
                          </Link>
                          <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={15} /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile hamburger */}
                  <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-sm hover:shadow-glow transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'}`
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                ))}
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <User size={17} /> Profile
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
