import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { getStats, getLogs } from '../api'

const CHART_COLORS = ['#540000', '#8b0000', '#b30000', '#d40000', '#ff1a1a']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Stats() {
  const { activeGuild } = useOutletContext()
  const [stats,    setStats]    = useState(null)
  const [logs,     setLogs]     = useState([])
  const [hourData, setHourData] = useState([])

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeGuild) return
    getLogs(activeGuild.id, 200).then(r => {
      setLogs(r.data)
      // Build hourly activity for last 24h
      const now = Date.now() / 1000
      const buckets = {}
      for (let h = 23; h >= 0; h--) {
        const label = `${h}h ago`
        buckets[label] = 0
      }
      r.data.forEach(log => {
        const hoursAgo = Math.floor((now - log.timestamp) / 3600)
        if (hoursAgo < 24) {
          const label = `${hoursAgo}h ago`
          buckets[label] = (buckets[label] || 0) + 1
        }
      })
      setHourData(Object.entries(buckets).reverse().map(([h, count]) => ({ hour: h, count })))
    }).catch(() => {})
  }, [activeGuild])

  // Command frequency from logs
  const cmdFreq = {}
  logs.forEach(l => { cmdFreq[l.command_name] = (cmdFreq[l.command_name] || 0) + 1 })
  const cmdData = Object.entries(cmdFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Stats</h1>
        <p className="text-gray-500 text-sm mt-1">Command usage analytics and activity graphs.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Guilds',    value: stats?.total_guilds },
          { label: 'Total Commands',  value: stats?.total_commands },
          { label: 'Commands Today',  value: stats?.commands_today },
          { label: 'Unique Commands', value: cmdData.length },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.02 }}
            className="stat-card text-center"
          >
            <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Hourly activity */}
      {hourData.length > 0 && (
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4">Hourly Activity (last 24h)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#540000" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#540000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} interval={3} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="count" name="Commands"
                stroke="#8b0000" fill="url(#areaGrad)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top commands bar chart */}
      {cmdData.length > 0 && (
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4">Top Commands</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cmdData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e5e7eb', fontSize: 11 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Uses" radius={[0, 4, 4, 0]}>
                {cmdData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Global top commands from backend */}
      {stats?.top_commands?.length > 0 && (
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4">Global Top Commands</h2>
          <div className="space-y-3">
            {stats.top_commands.map((cmd, i) => {
              const max = stats.top_commands[0].count
              return (
                <div key={cmd.name} className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                  <span className="text-white text-sm font-mono w-28 truncate">{cmd.name}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cmd.count / max) * 100}%` }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, #540000, #ff1a1a)` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right">{cmd.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!activeGuild && (
        <p className="text-center text-gray-500 py-12">Select a server to see per-guild stats.</p>
      )}
    </div>
  )
}
