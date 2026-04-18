/**
 * Public live status page — /status
 * Polls /public-status every 10 seconds.
 * Modelled after bumblebeebot.xyz/status
 */
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  CheckCircle, AlertTriangle, XCircle, Clock,
  Wifi, Database, Globe, Terminal, LayoutDashboard,
  RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { getPublicStatus } from '../api'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatUptime(secs) {
  if (!secs) return '—'
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function timeAgo(ts) {
  if (!ts) return '—'
  const s = Math.floor(Date.now() / 1000 - ts)
  if (s < 5)    return 'just now'
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400)return `${Math.floor(s / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString()
}

function fmtDate(ts) {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  operational: { label: 'Operational', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  Icon: CheckCircle  },
  degraded:    { label: 'Degraded',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', Icon: AlertTriangle },
  outage:      { label: 'Outage',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  Icon: XCircle       },
  offline:     { label: 'Offline',     color: '#6b7280', bg: 'rgba(107,114,128,0.1)',border: 'rgba(107,114,128,0.3)',Icon: XCircle       },
}

const INCIDENT_CFG = {
  investigating: { label: 'Investigating', color: '#ef4444' },
  monitoring:    { label: 'Monitoring',    color: '#f59e0b' },
  resolved:      { label: 'Resolved',      color: '#22c55e' },
}

const SEVERITY_CFG = {
  critical: { label: 'Critical', color: '#ef4444' },
  major:    { label: 'Major',    color: '#f97316' },
  minor:    { label: 'Minor',    color: '#f59e0b' },
}

const COMPONENT_ICONS = {
  gateway:   Wifi,
  api:       Globe,
  database:  Database,
  dashboard: LayoutDashboard,
  commands:  Terminal,
}

// ── Overall banner ────────────────────────────────────────────────────────────
function OverallBanner({ overall, uptime_pct, uptime_seconds, last_seen }) {
  const cfg = STATUS_CFG[overall] || STATUS_CFG.operational
  const Icon = cfg.Icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-8 text-center relative overflow-hidden"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: `radial-gradient(ellipse at center, ${cfg.color}08, transparent 70%)` }} />

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: `${cfg.color}20`, border: `2px solid ${cfg.color}60` }}
      >
        <Icon size={28} style={{ color: cfg.color }} />
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
        {overall === 'operational' ? 'ALL SYSTEMS OPERATIONAL' :
         overall === 'degraded'    ? 'PARTIAL SYSTEM DEGRADATION' :
         overall === 'outage'      ? 'SYSTEM OUTAGE DETECTED' :
                                     'BOT OFFLINE'}
      </h2>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        {overall === 'operational'
          ? 'GHOST is currently running smoothly. No major outages reported in the last 24 hours.'
          : overall === 'degraded'
          ? 'Some components are experiencing elevated latency. Engineers are monitoring.'
          : 'One or more components are experiencing issues. We are investigating.'}
      </p>

      <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: cfg.color }}>{uptime_pct?.toFixed(2) || '—'}%</p>
          <p className="text-xs text-gray-500 mt-0.5">30-day uptime</p>
        </div>
        <div className="w-px h-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{formatUptime(uptime_seconds)}</p>
          <p className="text-xs text-gray-500 mt-0.5">current uptime</p>
        </div>
        <div className="w-px h-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">{timeAgo(last_seen)}</p>
          <p className="text-xs text-gray-500 mt-0.5">last heartbeat</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Component card ────────────────────────────────────────────────────────────
function ComponentCard({ comp, index }) {
  const cfg  = STATUS_CFG[comp.status] || STATUS_CFG.operational
  const Icon = COMPONENT_ICONS[comp.icon] || Globe
  const StatusIcon = cfg.Icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-xl p-5 flex items-center gap-4 transition-all duration-200"
      style={{
        background: 'rgba(22,24,32,0.9)',
        border: `1px solid ${cfg.border}`,
      }}
    >
      {/* Component icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
        <Icon size={18} style={{ color: cfg.color }} />
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{comp.name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{comp.description}</p>
      </div>

      {/* Latency */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-xs text-gray-500">LATENCY</p>
        <p className="text-sm font-mono font-bold" style={{ color: cfg.color }}>
          {comp.latency_ms > 0 ? `${Math.round(comp.latency_ms)}ms` : '—'}
        </p>
      </div>

      {/* Uptime */}
      <div className="text-right shrink-0 hidden md:block">
        <p className="text-xs text-gray-500">UPTIME</p>
        <p className="text-sm font-bold text-white">{comp.uptime}</p>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0"
           style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <StatusIcon size={13} style={{ color: cfg.color }} />
        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
    </motion.div>
  )
}

// ── Incident card ─────────────────────────────────────────────────────────────
function IncidentCard({ incident }) {
  const [open, setOpen] = useState(false)
  const scfg = INCIDENT_CFG[incident.status] || INCIDENT_CFG.resolved
  const sevcfg = SEVERITY_CFG[incident.severity] || SEVERITY_CFG.minor

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(22,24,32,0.9)', border: '1px solid rgba(84,0,0,0.2)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        {/* Status dot */}
        <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
             style={{ background: scfg.color, boxShadow: `0 0 6px ${scfg.color}` }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{incident.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${sevcfg.color}20`, color: sevcfg.color }}>
              {sevcfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{fmtDate(incident.created_at)}</p>
        </div>

        <span className="text-xs px-2 py-1 rounded-lg font-semibold shrink-0"
              style={{ background: `${scfg.color}15`, color: scfg.color }}>
          {scfg.label.toUpperCase()}
        </span>
        {open ? <ChevronUp size={14} className="text-gray-500 shrink-0" />
              : <ChevronDown size={14} className="text-gray-500 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-4 border-t"
            style={{ borderColor: 'rgba(84,0,0,0.15)' }}
          >
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{incident.description}</p>
            {incident.resolved_at && (
              <p className="text-xs text-gray-600 mt-2">
                Resolved: {fmtDate(incident.resolved_at)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
         style={{ background: 'rgba(13,14,17,0.97)', border: '1px solid rgba(84,0,0,0.4)' }}>
      <p className="text-gray-400 mb-1 font-mono">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold text-white">{p.value}ms</span>
        </p>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StatusPage() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  async function fetchData(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    try {
      const r = await getPublicStatus()
      setData(r.data)
      setLastUpdate(Date.now())
    } catch {
      // keep stale
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(() => fetchData(), 10000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const overall = data?.overall || 'operational'
  const overallCfg = STATUS_CFG[overall] || STATUS_CFG.operational

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <div className="relative py-12 px-4 text-center overflow-hidden"
           style={{
             background: 'linear-gradient(180deg, rgba(84,0,0,0.08) 0%, transparent 100%)',
             borderBottom: '1px solid rgba(84,0,0,0.15)',
           }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 -translate-y-1/2
                        rounded-full blur-3xl pointer-events-none"
             style={{ background: `${overallCfg.color}15` }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold"
               style={{ background: 'rgba(84,0,0,0.2)', border: '1px solid rgba(139,0,0,0.4)', color: 'var(--c3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE STATUS
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            System Status
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time health of all GHOST bot components.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
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
                Updated {timeAgo(lastUpdate / 1000)} · auto-refreshes every 10s
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse"
                   style={{ background: 'rgba(22,24,32,0.6)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Overall banner */}
            <OverallBanner
              overall={overall}
              uptime_pct={data?.uptime_pct}
              uptime_seconds={data?.uptime_seconds}
              last_seen={data?.last_seen}
            />

            {/* Component status */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Component Status</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse"
                       style={{ background: overallCfg.color }} />
                  <span className="text-xs font-medium" style={{ color: overallCfg.color }}>
                    {overallCfg.label}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {(data?.components || []).map((comp, i) => (
                  <ComponentCard key={comp.name} comp={comp} index={i} />
                ))}
              </div>
            </section>

            {/* Latency chart */}
            {data?.latency_chart?.length > 1 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-lg">API Latency</h2>
                  <span className="text-xs text-gray-500">Last 24 hours</span>
                </div>
                <div className="rounded-2xl p-5"
                     style={{ background: 'rgba(22,24,32,0.9)', border: '1px solid rgba(84,0,0,0.2)' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data.latency_chart}>
                      <defs>
                        <linearGradient id="gwGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dbGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(84,0,0,0.12)" />
                      <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} interval={3} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} unit="ms" />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                      <Area type="monotone" dataKey="gateway" name="Gateway"
                            stroke="#22c55e" fill="url(#gwGrad)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="api" name="REST API"
                            stroke="#3b82f6" fill="url(#apiGrad)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="db" name="Database"
                            stroke="#a855f7" fill="url(#dbGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* No chart data yet */}
            {(!data?.latency_chart || data.latency_chart.length <= 1) && (
              <section>
                <h2 className="text-white font-bold text-lg mb-4">API Latency</h2>
                <div className="rounded-2xl p-10 text-center"
                     style={{ background: 'rgba(22,24,32,0.9)', border: '1px solid rgba(84,0,0,0.2)' }}>
                  <Clock size={28} className="mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500 text-sm">
                    Latency history will appear here after the bot has been running for a few minutes.
                  </p>
                </div>
              </section>
            )}

            {/* Incident history */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Incident History</h2>
                <span className="text-xs text-gray-500">Last 30 days</span>
              </div>
              <div className="space-y-2">
                {(data?.incidents || []).map(inc => (
                  <IncidentCard key={inc.id} incident={inc} />
                ))}
              </div>
            </section>

            {/* Bot info footer */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Version',    value: data?.version || '2.0.0' },
                  { label: 'Shards',     value: data?.shard_count || 1 },
                  { label: 'Servers',    value: data?.guild_count?.toLocaleString() || '—' },
                  { label: 'Users',      value: data?.user_count?.toLocaleString() || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4 text-center"
                       style={{ background: 'rgba(22,24,32,0.9)', border: '1px solid rgba(84,0,0,0.15)' }}>
                    <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm"
              style={{ borderTop: '1px solid rgba(84,0,0,0.15)' }}>
        <img src="/ghost.png" alt="GHOST" className="w-5 h-5 inline-block mr-2 opacity-40" />
        GHOST Bot Status · Live · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
