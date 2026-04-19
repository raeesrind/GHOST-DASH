import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Server, Terminal, TrendingUp, Clock } from 'lucide-react'
import { getStats, getBotStatus, getLogs } from '../api'
import StatCard from '../components/StatCard'

function timeAgo(ts) {
  if (!ts) return 'Never'
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function Dashboard() {
  const { activeGuild } = useOutletContext()
  const [stats,  setStats]  = useState(null)
  const [status, setStatus] = useState(null)
  const [logs,   setLogs]   = useState([])

  useEffect(() => {
    getStats().then(r  => setStats(r.data)).catch(() => {})
    getBotStatus().then(r => setStatus(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeGuild) return
    getLogs(activeGuild.id, 10).then(r => setLogs(r.data)).catch(() => {})
  }, [activeGuild])

  const uptime = status?.uptime_start
    ? Math.floor((Date.now() / 1000 - status.uptime_start) / 3600)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>
          {activeGuild ? `Managing ${activeGuild.name}` : 'Select a server to get started'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Server}   label="Servers"        value={stats?.total_guilds}   sub="connected" />
        <StatCard icon={Terminal} label="Commands Today" value={stats?.commands_today} sub="last 24h" />
        <StatCard icon={TrendingUp} label="Total Commands" value={stats?.total_commands} sub="all time" />
        <StatCard icon={Clock}    label="Uptime"         value={`${uptime}h`}          sub="since last restart" />
      </div>

      {/* Bot status banner */}
      {status && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-4 flex flex-wrap items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${status.online ? 'bg-ok' : 'bg-err'}`}
               style={{ background: status.online ? 'var(--ok)' : 'var(--err)' }} />
          <span className="font-medium" style={{ color: 'var(--tx-1)' }}>{status.online ? 'Bot Online' : 'Bot Offline'}</span>
          <span className="text-sm" style={{ color: 'var(--tx-3)' }}>Ping: <span style={{ color: 'var(--tx-1)' }}>{status.latency_ms}ms</span></span>
          <span className="text-sm" style={{ color: 'var(--tx-3)' }}>Guilds: <span style={{ color: 'var(--tx-1)' }}>{status.guild_count}</span></span>
          <span className="text-sm" style={{ color: 'var(--tx-3)' }}>Users: <span style={{ color: 'var(--tx-1)' }}>{status.user_count?.toLocaleString()}</span></span>
          <span className="text-sm ml-auto" style={{ color: 'var(--tx-3)' }}>Last seen: <span style={{ color: 'var(--tx-1)' }}>{timeAgo(status.last_seen)}</span></span>
        </motion.div>
      )}

      {/* Top commands */}
      {stats?.top_commands?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--tx-1)' }}>Top Commands</h2>
          <div className="space-y-3">
            {stats.top_commands.map((cmd, i) => {
              const pct = Math.round((cmd.count / stats.top_commands[0].count) * 100)
              return (
                <div key={cmd.name} className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: 'var(--tx-3)' }}>{i + 1}</span>
                  <span className="text-sm font-mono w-32 truncate" style={{ color: 'var(--tx-1)' }}>{cmd.name}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--c1), var(--c2))' }} />
                  </div>
                  <span className="text-xs w-10 text-right" style={{ color: 'var(--tx-3)' }}>{cmd.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent logs */}
      {activeGuild && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--tx-1)' }}>Recent Activity</h2>
          {logs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--tx-3)' }}>No recent commands.</p>
          ) : (
            <div className="space-y-1">
              {logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0"
                     style={{ borderColor: 'var(--border)' }}>
                  <span className="font-mono text-sm" style={{ color: 'var(--c3)' }}>/{log.command_name}</span>
                  <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{log.user_tag || log.user_id}</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--tx-3)' }}>{timeAgo(log.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
