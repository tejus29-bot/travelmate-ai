import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Calendar, Shield, Save, LogOut,
  Sparkles, Check, Globe, DollarSign, Compass
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, getDisplayName, signOut, updateProfile } = useAuth()

  const [fullName, setFullName] = useState(getDisplayName() || '')
  const [preferredCurrency, setPreferredCurrency] = useState('USD')
  const [defaultTravelStyle, setDefaultTravelStyle] = useState('moderate')
  const [saving, setSaving] = useState(false)

  const email = user?.email || 'demo@travelmate.ai'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'November 2024'

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (updateProfile) {
        await updateProfile({ full_name: fullName })
      }
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal traveler information and planning preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left card: User Avatar & Quick Info */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-sky-500 text-white flex items-center justify-center text-3xl font-bold shadow-glow">
              {fullName?.charAt(0)?.toUpperCase() || 'T'}
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{fullName}</h3>
              <p className="text-xs text-slate-500">{email}</p>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-emerald-600">Active Explorer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member Since</span>
                <span className="font-medium">{memberSince}</span>
              </div>
            </div>

            <div className="w-full pt-4">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleSignOut}
                leftIcon={<LogOut size={14} />}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Right card: Profile Edit Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Personal Information
              </h3>

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />

              <Input
                label="Email Address"
                value={email}
                disabled
                leftIcon={<Mail size={16} />}
                helperText="Email cannot be changed directly in demo mode."
              />

              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 pt-4">
                Travel Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Default Travel Style
                  </label>
                  <select
                    value={defaultTravelStyle}
                    onChange={(e) => setDefaultTravelStyle(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="budget">Budget Friendly</option>
                    <option value="moderate">Moderate & Balanced</option>
                    <option value="luxury">Luxury & Premium</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="dark"
                  loading={saving}
                  leftIcon={<Save size={16} />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
