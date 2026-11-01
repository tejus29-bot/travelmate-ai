import React from 'react'
import { Link } from 'react-router-dom'
import { Plane, Twitter, Github, Linkedin, Heart } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', to: '/#features' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Changelog', to: '/changelog' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
  ],
  Support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
}

const socials = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/tejus29-bot', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center shadow-glow">
                <Plane size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">TravelMate AI</span>
            </Link>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered travel planning that creates personalized, day-by-day itineraries
              tailored to your interests, budget, and schedule.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center justify-center md:justify-start">
            <a
              href="https://github.com/tejus29-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
            >
              <Github size={14} className="text-slate-400 group-hover:text-white transition-colors" />
              <span>@tejus29-bot</span>
            </a>
          </div>
          <p className="flex items-center justify-center gap-1 text-center">
            Made With <Heart size={12} className="text-red-400 fill-red-400" /> By TEJUS CHOURASIYA
          </p>
          <p className="text-center md:text-right">
            © {new Date().getFullYear()} TravelMate AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
