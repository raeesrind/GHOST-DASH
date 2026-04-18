/**
 * Public commands list page — no login required.
 * Accessible at /commands-list
 */
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Hash } from 'lucide-react'
import Navbar from '../components/Navbar'
import { ALL_COMMANDS, CATEGORIES, TOTAL_COMMANDS, TOTAL_WITH_SUBS } from '../data/commands'

const CAT_COLOR = {
  Moderation: '#ef4444',
  Leveling:   '#f59e0b',
  Fun:        '#a855f7',
  Actions:    '#ec4899',
  Utility:    '#3b82f6',
  Economy:    '#22c55e',
  Giveaway:   '#f97316',
  Minigames:  '#06b6d4',
  Owner:      '#540000',
}

function CommandCard({ cmd }) {
  const color = CAT_COLOR[cmd.category] || '#540000'
  const isSubcmd = !!cmd.parent
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ scale: 1.015, borderColor: `${color}66` }}
      className="rounded-xl p-4 transition-all duration-200 cursor-default"
      style={{
        background: isSubcmd ? 'rgba(13,14,17,0.9)' : 'rgba(22,24,32,0.85)',
        border: `1px solid ${isSubcmd ? 'rgba(84,0,0,0.12)' : 'rgba(84,0,0,0.2)'}`,
        marginLeft: isSubcmd ? '0' : '0',
      }}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isSubcmd && <span className="text-gray-600 text-xs font-mono shrink-0">↳</span>}
          <span className="font-mono font-bold text-sm" style={{ color }}>
            {isSubcmd ? `${cmd.parent} ${cmd.name}` : cmd.name}
          </span>
          {cmd.aliases.length > 0 && (
            <span className="text-xs text-gray-600 font-mono hidden sm:inline">
              {cmd.aliases.map(a => `/${a}`).join(' · ')}
            </span>
          )}
          {/* Type badge */}
          <span className="text-xs px-1.5 py-0.5 rounded font-mono shrink-0" style={{
            background: cmd.type==='slash'?'rgba(59,130,246,0.15)':cmd.type==='subcommand'?'rgba(168,85,247,0.15)':cmd.type==='group'?'rgba(245,158,11,0.15)':'rgba(84,0,0,0.12)',
            color: cmd.type==='slash'?'#60a5fa':cmd.type==='subcommand'?'#c084fc':cmd.type==='group'?'#fbbf24':'var(--c3)',
          }}>
            {cmd.type==='slash'?'/':cmd.type==='subcommand'?'sub':cmd.type==='group'?'grp':'pfx'}
          </span>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
          style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
        >
          {cmd.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed mb-3 min-h-[1.5rem]">
        {cmd.description || 'No description available.'}
      </p>

      {/* Usage */}
      {cmd.usage && (
        <div className="flex items-center gap-1.5">
          <Hash size={10} className="text-gray-600 shrink-0" />
          <code
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: `${color}12`, color: `${color}cc` }}
          >
            ?{cmd.usage}
          </code>
        </div>
      )}
    </motion.div>
  )
}

export default function CommandsList() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const seen = new Set()
    return ALL_COMMANDS.filter(cmd => {
      const key = `${cmd.name}-${cmd.category}-${cmd.parent||''}`
      if (seen.has(key)) return false
      seen.add(key)
      if (category !== 'all' && cmd.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return cmd.name.includes(q)
          || cmd.description.toLowerCase().includes(q)
          || cmd.aliases.some(a => a.includes(q))
          || (cmd.parent && cmd.parent.toLowerCase().includes(q))
      }
      return true
    })
  }, [search, category])

  const totalUnique = TOTAL_WITH_SUBS

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero banner */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(84,0,0,0.12) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(84,0,0,0.2)',
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(84,0,0,0.25)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/ghost.png" alt="GHOST" className="w-10 h-10 rounded-xl"
                 style={{ filter: 'drop-shadow(0 0 8px rgba(84,0,0,0.8))' }} />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Commands
            </h1>
          </div>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Browse all <span className="text-white font-semibold">{totalUnique}</span> GHOST bot commands.
            Use the search or filter by category.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Search bar */}
        <div className="relative max-w-xl mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search commands…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl text-sm text-white
                       focus:outline-none transition-all"
            style={{
              background: 'rgba(22,24,32,0.9)',
              border: '1px solid rgba(84,0,0,0.3)',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(139,0,0,0.7)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(84,0,0,0.3)'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 justify-start md:justify-center flex-wrap">
          {CATEGORIES.map(cat => {
            const count = cat.id === 'all'
              ? TOTAL_WITH_SUBS
              : ALL_COMMANDS.filter(c => c.category === cat.id).length
            const active = category === cat.id
            const color  = CAT_COLOR[cat.id] || '#540000'
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCategory(cat.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                           whitespace-nowrap transition-all duration-200 shrink-0"
                style={active ? {
                  background: `${color}22`,
                  border: `1px solid ${color}55`,
                  color,
                  boxShadow: `0 0 10px ${color}22`,
                } : {
                  background: 'rgba(22,24,32,0.8)',
                  border: '1px solid rgba(84,0,0,0.2)',
                  color: 'var(--tx-2)',
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className="text-xs rounded-full px-1.5 py-0.5 font-mono"
                  style={{
                    background: active ? `${color}30` : 'rgba(84,0,0,0.15)',
                    color: active ? color : '#6b7280',
                  }}
                >
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {filtered.length} command{filtered.length !== 1 ? 's' : ''}
            {search && <span> matching "<span className="text-gray-400">{search}</span>"</span>}
          </p>
          {(search || category !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategory('all') }}
              className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(cmd => (
              <CommandCard key={`${cmd.name}-${cmd.category}`} cmd={cmd} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-500"
          >
            <Search size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No commands found.</p>
            <button
              onClick={() => { setSearch(''); setCategory('all') }}
              className="mt-3 text-sm hover:underline"
              style={{ color: '#8b0000' }}
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="mt-16 py-8 text-center text-gray-600 text-sm"
        style={{ borderTop: '1px solid rgba(84,0,0,0.15)' }}
      >
        <img src="/ghost.png" alt="GHOST" className="w-5 h-5 inline-block mr-2 opacity-40" />
        GHOST Bot · {totalUnique} commands · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
