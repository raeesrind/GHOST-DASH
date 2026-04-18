import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Save, ChevronDown, ChevronUp,
  Shield, Clock, Hash, Copy, Check, X,
  ToggleLeft, ToggleRight, SlidersHorizontal,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getCommands, updateCommand } from '../api'
import Toggle from '../components/Toggle'
import { ALL_COMMANDS, CATEGORIES, TOTAL_COMMANDS, TOTAL_WITH_SUBS } from '../data/commands'

// ── Category colour map ───────────────────────────────────────────────────────
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
  Core:       '#6b7280',
  Tasks:      '#6b7280',
}

// ── Single command card ───────────────────────────────────────────────────────
function CommandCard({ cmd, config, onSave }) {
  const [expanded, setExpanded] = useState(false)
  const [enabled,  setEnabled]  = useState(config?.enabled ?? true)
  const [cooldown, setCooldown] = useState(String(config?.cooldown ?? 0))
  const [roles,    setRoles]    = useState(config?.roles ?? '[]')
  const [saving,   setSaving]   = useState(false)
  const [copied,   setCopied]   = useState(false)

  const dirty = enabled  !== (config?.enabled  ?? true)
             || cooldown !== String(config?.cooldown ?? 0)
             || roles    !== (config?.roles    ?? '[]')

  const color = CAT_COLOR[cmd.category] || '#540000'

  async function save() {
    setSaving(true)
    try {
      await onSave({ command_name: cmd.name, enabled, cooldown: Number(cooldown) || 0, roles })
      toast.success(`/${cmd.name} saved`)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function copyUsage() {
    navigator.clipboard.writeText(`?${cmd.usage || cmd.name}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all duration-200 overflow-hidden
        ${!enabled ? 'opacity-50' : ''}
        ${expanded ? 'border-opacity-60' : 'border-opacity-20'}
      `}
      style={{
        background: 'rgba(22,24,32,0.85)',
        borderColor: expanded ? color : 'rgba(84,0,0,0.25)',
        boxShadow: expanded ? `0 0 12px ${color}22` : 'none',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Toggle */}
        <Toggle enabled={enabled} onChange={v => { setEnabled(v) }} />

        {/* Name + category badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {cmd.parent && <span className="text-gray-600 text-xs font-mono shrink-0">↳</span>}
            <span className="font-mono font-semibold text-sm" style={{ color }}>
              {cmd.parent ? `${cmd.parent} ${cmd.name}` : cmd.name}
            </span>
            {cmd.aliases.length > 0 && (
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">
                ({cmd.aliases.map(a => `/${a}`).join(', ')})
              </span>
            )}
            {/* Type pill */}
            <span className="text-xs px-1.5 py-0.5 rounded font-mono shrink-0" style={{
              background: cmd.type==='slash'?'rgba(59,130,246,0.15)':cmd.type==='subcommand'?'rgba(168,85,247,0.15)':cmd.type==='group'?'rgba(245,158,11,0.15)':'rgba(84,0,0,0.15)',
              color: cmd.type==='slash'?'#60a5fa':cmd.type==='subcommand'?'#c084fc':cmd.type==='group'?'#fbbf24':'var(--c3)',
            }}>
              {cmd.type==='slash'?'/slash':cmd.type==='subcommand'?'sub':cmd.type==='group'?'group':'prefix'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
              style={{ background:`${color}22`, color, border:`1px solid ${color}44` }}>
              {cmd.category}
            </span>
          </div>
          {cmd.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{cmd.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Copy usage */}
          <button
            onClick={copyUsage}
            title="Copy usage"
            className="text-gray-600 hover:text-gray-300 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>

          {/* Save button — only when dirty */}
          <AnimatePresence>
            {dirty && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold
                           text-white transition-colors"
                style={{ background: color }}
              >
                <Save size={11} />
                {saving ? '…' : 'Save'}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Expand */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── Expanded config ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t px-4 py-4 space-y-4"
            style={{ borderColor: `${color}30` }}
          >
            {/* Usage */}
            {cmd.usage && (
              <div className="flex items-center gap-2 text-xs">
                <Hash size={12} className="text-gray-500" />
                <span className="text-gray-500">Usage:</span>
                <code
                  className="px-2 py-0.5 rounded font-mono text-xs"
                  style={{ background: `${color}15`, color }}
                >
                  ?{cmd.usage}
                </code>
              </div>
            )}

            {/* Cooldown */}
            <div className="flex items-center gap-3">
              <Clock size={13} className="text-gray-500 shrink-0" />
              <label className="text-xs text-gray-400 w-28 shrink-0">Cooldown (seconds)</label>
              <input
                type="number" min={0} max={3600}
                value={cooldown}
                onChange={e => setCooldown(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg text-sm text-white font-mono
                           focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg)',
                  border: `1px solid ${color}40`,
                }}
              />
              <span className="text-xs text-gray-600">0 = no cooldown</span>
            </div>

            {/* Required roles */}
            <div className="flex items-start gap-3">
              <Shield size={13} className="text-gray-500 shrink-0 mt-1.5" />
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1.5">
                  Required Role IDs
                  <span className="text-gray-600 ml-1">(JSON array — leave [] for everyone)</span>
                </label>
                <input
                  type="text"
                  value={roles}
                  onChange={e => setRoles(e.target.value)}
                  placeholder='["123456789012345678"]'
                  className="w-full px-3 py-1.5 rounded-lg text-sm text-white font-mono
                             focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    border: `1px solid ${color}40`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Commands() {
  const { activeGuild } = useOutletContext()
  const [configs,  setConfigs]  = useState({})
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('all')
  const [filter,   setFilter]   = useState('all')   // all | enabled | disabled
  const [loading,  setLoading]  = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selected, setSelected] = useState(new Set())

  // Load configs from backend
  useEffect(() => {
    if (!activeGuild) return
    setLoading(true)
    getCommands(activeGuild.id)
      .then(r => {
        const map = {}
        r.data.forEach(c => { map[c.command_name] = c })
        setConfigs(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeGuild])

  const handleSave = useCallback(async (payload) => {
    if (!activeGuild) return
    await updateCommand(activeGuild.id, payload)
    setConfigs(prev => ({
      ...prev,
      [payload.command_name]: { ...(prev[payload.command_name] || {}), ...payload },
    }))
  }, [activeGuild])

  // Deduplicate and filter — include subcommands under their parent
  const filtered = useMemo(() => {
    const seen = new Set()
    return ALL_COMMANDS.filter(cmd => {
      const key = `${cmd.name}-${cmd.category}-${cmd.parent || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      if (category !== 'all' && cmd.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        const parentMatch = cmd.parent && cmd.parent.toLowerCase().includes(q)
        if (!cmd.name.includes(q) && !cmd.description.toLowerCase().includes(q)
            && !cmd.aliases.some(a => a.includes(q)) && !parentMatch) return false
      }
      const cfg = configs[cmd.name]
      if (filter === 'enabled'  && cfg?.enabled === false) return false
      if (filter === 'disabled' && cfg?.enabled !== false) return false
      return true
    })
  }, [search, category, filter, configs])

  // Bulk enable/disable
  async function bulkToggle(enable) {
    if (!activeGuild) return
    const targets = bulkMode && selected.size > 0
      ? filtered.filter(c => selected.has(c.name))
      : filtered
    const promises = targets.map(cmd =>
      handleSave({ command_name: cmd.name, enabled: enable,
                   cooldown: configs[cmd.name]?.cooldown ?? 0,
                   roles: configs[cmd.name]?.roles ?? '[]' })
    )
    await Promise.allSettled(promises)
    toast.success(`${enable ? 'Enabled' : 'Disabled'} ${targets.length} commands`)
    setSelected(new Set())
  }

  const totalCount    = TOTAL_WITH_SUBS
  const enabledCount  = ALL_COMMANDS.filter(c => !c.parent && configs[c.name]?.enabled !== false).length
  const disabledCount = ALL_COMMANDS.filter(c => !c.parent && configs[c.name]?.enabled === false).length

  if (!activeGuild) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <SlidersHorizontal size={32} className="opacity-30" />
        <p>Select a server from the sidebar to manage commands.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Control</h1>
          <p className="text-gray-500 text-sm mt-1">
            {TOTAL_COMMANDS} top-level · {TOTAL_WITH_SUBS} total (with subcommands) · {enabledCount} enabled · {disabledCount} disabled
          </p>
        </div>
        {/* Bulk actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setBulkMode(b => !b); setSelected(new Set()) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        border transition-colors
                        ${bulkMode
                          ? 'bg-ghost-red/20 border-ghost-red text-white'
                          : 'border-ghost-border text-gray-400 hover:text-white'}`}
          >
            <SlidersHorizontal size={12} />
            {bulkMode ? `Bulk (${selected.size || 'all'})` : 'Bulk Edit'}
          </button>
          <button
            onClick={() => bulkToggle(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       border border-green-800 text-green-400 hover:bg-green-900/20 transition-colors"
          >
            <ToggleRight size={12} /> Enable All
          </button>
          <button
            onClick={() => bulkToggle(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <ToggleLeft size={12} /> Disable All
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const count = cat.id === 'all'
            ? ALL_COMMANDS.length
            : ALL_COMMANDS.filter(c => c.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                          whitespace-nowrap transition-all shrink-0
                          ${category === cat.id
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white bg-ghost-card border border-ghost-border'}`}
              style={category === cat.id ? {
                background: `${CAT_COLOR[cat.id] || '#540000'}22`,
                border: `1px solid ${CAT_COLOR[cat.id] || '#540000'}66`,
                color: CAT_COLOR[cat.id] || 'var(--c3)',
              } : {}}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className="text-xs opacity-60 ml-0.5">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search commands, descriptions, aliases…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white
                       focus:outline-none transition-colors"
            style={{
              background: 'rgba(22,24,32,0.9)',
              border: '1px solid rgba(84,0,0,0.3)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {['all', 'enabled', 'disabled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize
                ${filter === f
                  ? 'bg-ghost-red text-white'
                  : 'text-gray-400 hover:text-white border border-ghost-border'}`}
              style={filter === f ? {} : { background: 'rgba(22,24,32,0.9)' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-600">
        Showing {filtered.length} of {TOTAL_WITH_SUBS} commands
        {search && <span> matching "<span className="text-gray-400">{search}</span>"</span>}
      </p>

      {/* Command list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse"
                 style={{ background: 'rgba(22,24,32,0.6)' }} />
          ))}
        </div>
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(cmd => (
              <div key={`${cmd.name}-${cmd.category}`} className="relative">
                {/* Bulk select checkbox */}
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selected.has(cmd.name)}
                    onChange={e => {
                      setSelected(prev => {
                        const next = new Set(prev)
                        e.target.checked ? next.add(cmd.name) : next.delete(cmd.name)
                        return next
                      })
                    }}
                    className="absolute left-2 top-4 z-10 accent-ghost-red"
                    style={{ accentColor: '#540000' }}
                  />
                )}
                <div style={{ marginLeft: bulkMode ? '28px' : '0' }}>
                  <CommandCard
                    cmd={cmd}
                    config={configs[cmd.name]}
                    onSave={handleSave}
                  />
                </div>
              </div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-500"
            >
              <Search size={32} className="mx-auto mb-3 opacity-20" />
              <p>No commands match your search.</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-sm text-ghost-red hover:underline"
                  style={{ color: 'var(--brand-h)' }}
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
