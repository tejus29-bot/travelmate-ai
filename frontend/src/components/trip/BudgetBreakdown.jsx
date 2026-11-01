import React from 'react'
import {
  DollarSign, Hotel, Utensils, Car, Compass,
  ShoppingBag, PieChart, TrendingUp, AlertCircle
} from 'lucide-react'

const categoryMeta = {
  accommodation: { label: 'Accommodation', icon: Hotel, color: 'bg-indigo-500', barColor: '#6366f1', textColor: 'text-indigo-600' },
  food: { label: 'Food & Dining', icon: Utensils, color: 'bg-amber-500', barColor: '#f59e0b', textColor: 'text-amber-600' },
  transportation: { label: 'Transportation', icon: Car, color: 'bg-emerald-500', barColor: '#10b981', textColor: 'text-emerald-600' },
  transport: { label: 'Transportation', icon: Car, color: 'bg-emerald-500', barColor: '#10b981', textColor: 'text-emerald-600' },
  activities: { label: 'Activities & Tours', icon: Compass, color: 'bg-blue-500', barColor: '#3b82f6', textColor: 'text-blue-600' },
  shopping: { label: 'Shopping & Misc', icon: ShoppingBag, color: 'bg-pink-500', barColor: '#ec4899', textColor: 'text-pink-600' },
  miscellaneous: { label: 'Miscellaneous', icon: ShoppingBag, color: 'bg-pink-500', barColor: '#ec4899', textColor: 'text-pink-600' },
}

export default function BudgetBreakdown({
  budgetBreakdown,
  totalBudget = 0,
  totalEstimated = 0,
  currency = 'USD'
}) {
  if (!budgetBreakdown) return null

  // Normalize entries
  const entries = Object.entries(budgetBreakdown).map(([key, val]) => {
    const meta = categoryMeta[key.toLowerCase()] || {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      icon: DollarSign,
      color: 'bg-slate-500',
      barColor: '#64748b',
      textColor: 'text-slate-600'
    }
    const amount = typeof val === 'object' ? Number(val.amount || 0) : Number(val || 0)
    return {
      key,
      ...meta,
      amount,
    }
  })

  const sumCategories = entries.reduce((acc, curr) => acc + curr.amount, 0)
  const displayTotal = totalEstimated || sumCategories || totalBudget || 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      {/* Header with Totals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PieChart size={20} className="text-brand-500" />
            Budget Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimated allocation across major travel expense categories
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Est. Total</span>
            <span className="text-base font-extrabold text-slate-900">
              {currency} {displayTotal.toLocaleString()}
            </span>
          </div>
          {totalBudget > 0 && (
            <div className="pl-4 border-l border-slate-200">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Target Budget</span>
              <span className="text-base font-semibold text-slate-600">
                {currency} {totalBudget.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Segment Color Progress Bar */}
      {displayTotal > 0 && (
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {entries.map((item) => {
              const percentage = displayTotal > 0 ? (item.amount / displayTotal) * 100 : 0
              if (percentage <= 0) return null
              return (
                <div
                  key={item.key}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.barColor,
                  }}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90 cursor-pointer"
                  title={`${item.label}: ${currency} ${item.amount.toLocaleString()} (${Math.round(percentage)}%)`}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Category breakdown grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {entries.map((item) => {
          const Icon = item.icon
          const percentage = displayTotal > 0 ? Math.round((item.amount / displayTotal) * 100) : 0

          return (
            <div
              key={item.key}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: `${item.barColor}15`, color: item.barColor }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold"
                >
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    {item.label}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {percentage}% of budget
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 block">
                  {currency} {item.amount.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
