import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Activity, Wifi, Server, Users, Clock, RefreshCw } from 'lucide-react'
import { getBotStatus } from '../api'

function formatUptime(startTs) {
  if (!startTs) return '—'
  const secs = Math.floor(Date.now() / 1000 - startTs)
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

function PingBar({ ms }) {
  const color = ms < 100 ? '#22c55e' : ms < 250 ? '#f59e0b' : '#ef4444'
  const pct   = Math.min(100, (ms / 500) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-sm font-mono" style={{ color }}>{ms}ms</span>
    </div>
  )
}

export default function Status() {
  const [status,    setStatus]    = useState(null)
  const [history,   setHistory]   = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [tick,      setTick]      = useState(0)
  const intervalRef = useRef(null)

  async function fetchStatus() {
    setRefreshing(true)
    try {
      const r = await getBotStatus()
      setStatus(r.data)
      setHistory(prev => [...prev.slice(-29), { ts: Date.now(), ms: r.data.latency_ms }])
    } catch {
      setStatus(prev => prev ? { ...prev, online: false } : null)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(() => {
      fetchStatus()
      setTick(t => t + 1)
    }, 10000) // poll every 10s
    return () => clearInterval(intervalRef.current)
  }, [])

  const online = status?.online ?? false

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bot Status</h1>
          <p className="text-gray-500 text-sm mt-1">Live bot health and performance metrics.</p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm text-gray-400
                     hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 text-center"
      >
        <motion.div
          animate={{ scale: online ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
                      ${online ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}
        >
          <Activity size={32} className={online ? 'text-green-400' : 'text-red-400'} />
        </motion.div>
        <h2 className={`text-3xl font-bold mb-2 ${online ? 'text-green-400' : 'text-red-400'}`}>
          {online ? 'Online' : 'Offline'}
        </h2>
        <p className="text-gray-400 text-sm">
          {online ? 'Bot is running and responding to commands.' : 'Bot is not responding. Check your hosting.'}
        </p>
      </motion.div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Wifi,   label: 'Latency',     value: status ? `${status.latency_ms}ms` : '—' },
          { icon: Server, label: 'Servers',      value: status?.guild_count ?? '—' },
          { icon: Users,  label: 'Users Cached', value: status?.user_count?.toLocaleString() ?? '—' },
          { icon: Clock,  label: 'Uptime',       value: formatUptime(status?.uptime_start) },
        ].map(({ icon: Icon, label, value }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="stat-card text-center">
            <Icon size={20} className="mx-auto mb-2 text-ghost-red" style={{ color: 'var(--brand-h)' }} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Ping history */}
      {history.length > 1 && (
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4">Ping History (last {history.length} polls)</h2>
          <div className="space-y-2">
            {history.slice(-10).reverse().map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-20">
                  {new Date(h.ts).toLocaleTimeString()}
                </span>
                <div className="flex-1">
                  <PingBar ms={h.ms} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <p className="text-center text-xs text-gray-600">
        Auto-refreshes every 10 seconds · Last updated: {status ? new Date().toLocaleTimeString() : '—'}
      </p>
    </div>
  )
}
