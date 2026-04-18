/**
 * Public live statistics page — /statistics
 * Polls /public-stats every 15 seconds for real bot data.
 */
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Server, Users, Terminal, Clock, Wifi, TrendingUp,
  Activity, Zap, RefreshCw, Circle,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { getPublicStats } from '../api'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K'
  return n.toLocaleString()
}

function formatUptime(startTs) {
  if (!startTs) return '—'
  const s = Math.floor(Date.now() / 1000 - startTs)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function timeAgo(ts) {
  if (!ts) return 'Never'
  const s = Math.floor(Date.now() / 1000 - ts)
  if (s < 5)  return 'just now'
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

const CAT_COLORS = [
  '#ef4444','#f59e0b','#a855f7','#3b82f6',
  '#22c55e','#ec4899','#f97316','#06b6d4','#540000',
]

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    if (!value && value !== 0) return
    const start = prev.current
    const end   = value
    const steps = 40
    const step  = (end - start) / steps
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplay(Math.round(start + step * i))
      if (i >= steps) { setDisplay(end); clearInterval(id) }
    }, duration / steps)
    prev.current = end
    return () => clearInterval(id)
  }, [value])

  return <>{fmt(display)}</>
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#540000', live = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, borderColor: `${color}66` }}
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(22,24,32,0.85)',
        border: `1px solid ${color}28`,
        boxShadow: `0 0 20px ${color}10`,
      }}
    >
      {/* Glow bg */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: `radial-gradient(ellipse at top left, ${color}0a, transparent 70%)` }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">{label}</p>
          <p className="text-3xl font-extrabold text-white leading-none">
            {value !== null && value !== undefined
              ? <Counter value={typeof value === 'number' ? value : 0} />
              : '—'}
          </p>
          {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <Icon size={18} style={{ color }} />
          </div>
          {live && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
         style={{ background: 'rgba(13,14,17,0.95)', border: '1px solid rgba(84,0,0,0.4)' }}>
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || 'var(--c3)' }}>
          {p.name}: <span className="font-bold text-white">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Statistics() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  async function fetchData(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    try {
      const r = await getPublicStats()
      setData(r.data)
      setLastUpdate(Date.now())
    } catch {
      // keep stale data
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(() => fetchData(), 15000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const bot     = data?.bot     || {}
  const totals  = data?.totals  || {}
  const online  = bot.online && (Date.now() / 1000 - (bot.last_seen || 0)) < 90

  // Pie chart data
  const pieData = useMemo(() =>
    (data?.category_breakdown || []).slice(0, 6).map((c, i) => ({
      name: c.category, value: c.count, pct: c.pct, color: CAT_COLORS[i],
    })), [data])

  // Hourly chart — last 12 hours for readability
  const hourlyData = useMemo(() =>
    (data?.hourly_activity || []).slice(-12), [data])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ── Hero banner ── */}
      <div className="relative py-14 px-4 text-center overflow-hidden"
           style={{ background: 'linear-gradient(180deg, rgba(84,0,0,0.1) 0%, transparent 100%)',
                    borderBottom: '1px solid rgba(84,0,0,0.2)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 -translate-y-1/2
                        rounded-full blur-3xl pointer-events-none"
             style={{ background: 'rgba(84,0,0,0.2)' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-xs font-semibold"
               style={{ background: 'rgba(84,0,0,0.2)', border: '1px solid rgba(139,0,0,0.4)', color: 'var(--c3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE PLATFORM METRICS
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Bot Statistics
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Transparent, real-time insights into GHOST's growth, usage, and performance
            across the Discord ecosystem.
          </p>

          {/* Refresh + last update */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium
                         text-gray-400 hover:text-white transition-colors"
              style={{ background: 'rgba(22,24,32,0.8)', border: '1px solid rgba(84,0,0,0.3)' }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            {lastUpdate && (
              <span className="text-xs text-gray-600">
                Updated {timeAgo(lastUpdate / 1000)} · auto-refreshes every 15s
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse"
                   style={{ background: 'rgba(22,24,32,0.6)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* ── Top stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Server}    label="Total Servers"
                value={bot.guild_count || totals.guilds}
                sub={`${totals.guilds} synced to dashboard`}
                color="#540000"  live
              />
              <StatCard
                icon={Users}     label="Total Users"
                value={bot.user_count || totals.members}
                sub="cached by bot"
                color="#8b0000"  live
              />
              <StatCard
                icon={Terminal}  label="Commands Run"
                value={totals.commands_run}
                sub={`${fmt(totals.commands_today)} today`}
                color="#b30000"  live
              />
              <StatCard
                icon={Clock}     label="Uptime"
                value={null}
                sub={formatUptime(bot.uptime_start)}
                color="#540000"
              />
            </div>

            {/* ── Secondary cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Wifi}       label="Latency"        value={Math.round(bot.latency_ms || 0)} sub="ms ping"          color="#3b82f6" />
              <StatCard icon={Activity}   label="Commands / Hour" value={totals.commands_hour}           sub="last 60 minutes"  color="#a855f7" />
              <StatCard icon={Zap}        label="Commands Today"  value={totals.commands_today}          sub="last 24 hours"    color="#f59e0b" />
              <StatCard icon={TrendingUp} label="Available Cmds"  value={totals.total_commands_available} sub="170 top-level · 214 with subs" color="#22c55e" />
            </div>

            {/* ── Bot status banner ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-5 flex flex-wrap items-center gap-4"
              style={{
                background: online ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${online ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-400' : 'bg-red-500'} animate-pulse`} />
              <span className="font-semibold text-white">{online ? '🟢 Bot Online' : '🔴 Bot Offline'}</span>
              <span className="text-gray-400 text-sm">Ping: <span className="text-white font-mono">{Math.round(bot.latency_ms || 0)}ms</span></span>
              <span className="text-gray-400 text-sm">Uptime: <span className="text-white">{bot.uptime_pct?.toFixed(2) || '—'}%</span></span>
              <span className="text-gray-400 text-sm">Last seen: <span className="text-white">{timeAgo(bot.last_seen)}</span></span>
              <span className="ml-auto text-xs text-gray-600 font-mono">
                {data?.generated_at ? new Date(data.generated_at * 1000).toLocaleTimeString() : ''}
              </span>
            </motion.div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Hourly activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(22,24,32,0.85)', border: '1px solid rgba(84,0,0,0.2)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">24h Activity Volume</h2>
                  <span className="text-xs text-gray-500">Commands per hour (UTC)</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8b0000" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#8b0000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(84,0,0,0.15)" />
                    <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} interval={2} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" name="Commands"
                          stroke="#8b0000" fill="url(#aGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(22,24,32,0.85)', border: '1px solid rgba(84,0,0,0.2)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Usage by Category</h2>
                  <span className="text-xs text-gray-500">Distribution of executions</span>
                </div>
                {pieData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                             dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {pieData.map((c, i) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                          <span className="text-xs text-gray-300 flex-1 truncate">{c.name}</span>
                          <span className="text-xs font-mono text-gray-500">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                    No command data yet — use the bot to populate this chart.
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Top commands bar chart ── */}
            {data?.top_commands?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(22,24,32,0.85)', border: '1px solid rgba(84,0,0,0.2)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Top Commands</h2>
                  <span className="text-xs text-gray-500">All-time usage</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.top_commands} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(84,0,0,0.12)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#e5e7eb', fontSize: 11 }} width={100} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Uses" radius={[0, 6, 6, 0]}>
                      {data.top_commands.map((_, i) => (
                        <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* ── Build info ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(22,24,32,0.85)', border: '1px solid rgba(84,0,0,0.2)' }}
            >
              <h2 className="text-white font-semibold mb-5">Build Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'API WRAPPER', value: data?.build?.library || 'discord.py 2.7.1',   href: 'https://discordpy.readthedocs.io' },
                  { label: 'RUNTIME',     value: `Python ${data?.build?.python || '3.13'}`,    href: 'https://python.org' },
                  { label: 'DATABASE',    value: data?.build?.database || 'SQLite (aiosqlite)', href: 'https://sqlite.org' },
                  { label: 'PLATFORM',    value: data?.build?.platform || 'Windows / Linux',   href: null },
                ].map(({ label, value, href }) => (
                  <div key={label}
                       className="rounded-xl p-4 text-center"
                       style={{ background: 'rgba(87,66,63,0.12)', border: '1px solid rgba(84,0,0,0.2)' }}>
                    <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium">{label}</p>
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer"
                         className="text-sm font-semibold hover:underline"
                         style={{ color: 'var(--c3)' }}>
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-white">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm"
              style={{ borderTop: '1px solid rgba(84,0,0,0.15)' }}>
        <img src="/ghost.png" alt="GHOST" className="w-5 h-5 inline-block mr-2 opacity-40" />
        GHOST Bot Statistics · Live data · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
