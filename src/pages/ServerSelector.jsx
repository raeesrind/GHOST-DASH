/**
 * Server selector — shown after Discord login.
 * Lists all user guilds, highlights ones where GHOST is installed.
 * Clicking a guild opens the dashboard for that server.
 * Like dyno.gg/servers
 */
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Settings, ChevronRight, Crown, Shield, X } from 'lucide-react'
import { getMe, getGuilds, getDiscordGuilds } from '../api'

// ── Helpers ───────────────────────────────────────────────────────────────────
function guildIcon(guild) {
  if (guild.icon)
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`
  return null
}

function guildInitials(name) {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Guild card ────────────────────────────────────────────────────────────────
function GuildCard({ guild, installed, onSelect, index }) {
  const icon = guildIcon(guild)
  const isAdmin = (guild.permissions & 0x8) === 0x8  // ADMINISTRATOR bit

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200"
      style={{
        background: 'rgba(22,24,32,0.9)',
        border: installed
          ? '1px solid rgba(84,0,0,0.5)'
          : '1px solid rgba(84,0,0,0.15)',
        boxShadow: installed ? '0 0 16px rgba(84,0,0,0.15)' : 'none',
      }}
      onClick={() => onSelect(guild)}
    >
      {/* Guild banner / header */}
      <div
        className="h-16 relative flex items-end px-4 pb-0"
        style={{
          background: installed
            ? 'linear-gradient(135deg, rgba(84,0,0,0.4), rgba(139,0,0,0.2))'
            : 'linear-gradient(135deg, rgba(22,24,32,0.8), rgba(31,34,42,0.6))',
        }}
      >
        {/* Installed badge */}
        {installed && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(84,0,0,0.8)', color: '#ff9999', border: '1px solid rgba(139,0,0,0.6)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </div>
        )}
      </div>

      {/* Guild info */}
      <div className="px-4 pb-4 pt-2">
        {/* Icon + name row */}
        <div className="flex items-center gap-3 mb-3 -mt-8">
          {icon ? (
            <img
              src={icon}
              alt={guild.name}
              className="w-14 h-14 rounded-xl border-2 shrink-0"
              style={{ borderColor: installed ? 'rgba(84,0,0,0.6)' : 'rgba(84,0,0,0.2)' }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border-2"
              style={{
                background: 'linear-gradient(135deg, var(--c1), var(--c2))',
                borderColor: installed ? 'rgba(84,0,0,0.6)' : 'rgba(84,0,0,0.2)',
                color: 'var(--c3)',
              }}
            >
              {guildInitials(guild.name)}
            </div>
          )}
          <div className="flex-1 min-w-0 mt-6">
            <p className="text-white font-semibold text-sm truncate">{guild.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {isAdmin && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Crown size={10} /> Admin
                </span>
              )}
              {guild.owner && (
                <span className="flex items-center gap-1 text-xs text-purple-400">
                  <Shield size={10} /> Owner
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        {installed ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                       text-sm font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--c1), var(--c2))',
              boxShadow: '0 0 12px rgba(84,0,0,0.4)',
            }}
          >
            <Settings size={14} />
            Manage Server
            <ChevronRight size={14} />
          </motion.button>
        ) : (
          <motion.a
            href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID || ''}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                       text-sm font-medium text-gray-400 hover:text-white transition-all"
            style={{ background: 'rgba(84,0,0,0.1)', border: '1px solid rgba(84,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <Plus size={14} />
            Add GHOST
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ServerSelector() {
  const [user,        setUser]        = useState(null)
  const [guilds,      setGuilds]      = useState([])   // user's Discord guilds
  const [botGuilds,   setBotGuilds]   = useState([])   // guilds where bot is installed
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('all') // all | installed | admin
  const [loading,     setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(r => setUser(r.data)).catch(() => {})

    // Fetch both in parallel
    Promise.allSettled([
      getDiscordGuilds().then(r => setGuilds(r.data || [])),
      getGuilds().then(r => setBotGuilds(r.data.map(g => g.id))),
    ]).finally(() => setLoading(false))
  }, [])

  function handleSelect(guild) {
    const isInstalled = botGuilds.includes(guild.id)
    if (isInstalled) {
      localStorage.setItem('ghost_active_guild', JSON.stringify({
        id: guild.id, name: guild.name, icon: guild.icon,
      }))
      navigate(`/manage/${guild.id}`)
    }
  }

  const filtered = useMemo(() => {
    return guilds.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'installed' && !botGuilds.includes(g.id)) return false
      if (filter === 'admin' && !((g.permissions & 0x8) === 0x8) && !g.owner) return false
      return true
    })
  }, [guilds, botGuilds, search, filter])

  const installedCount = guilds.filter(g => botGuilds.includes(g.id)).length

  const avatarUrl = user?.avatar_url
    || (user?.avatar && user?.sub
      ? `https://cdn.discordapp.com/avatars/${user.sub}/${user.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16"
        style={{
          background: 'rgba(13,14,17,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(84,0,0,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/ghost.png" alt="GHOST" className="w-8 h-8 rounded-lg"
               style={{ filter: 'drop-shadow(0 0 6px rgba(84,0,0,0.8))' }} />
          <span className="text-white font-bold text-base tracking-wide">GHOST</span>
        </div>

        {/* User pill */}
        {user && (
          <div className="flex items-center gap-2">
            <img src={avatarUrl} alt={user.username}
                 className="w-8 h-8 rounded-full border"
                 style={{ borderColor: 'rgba(84,0,0,0.5)' }} />
            <span className="text-sm text-gray-300 hidden sm:block">{user.username}</span>
            <button
              onClick={() => { localStorage.clear(); navigate('/login') }}
              className="ml-2 text-gray-500 hover:text-white transition-colors p-1 rounded-lg
                         hover:bg-ghost-red/10"
              title="Logout"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Select a Server
          </h1>
          <p className="text-gray-400 text-sm">
            {installedCount > 0
              ? `GHOST is active in ${installedCount} of your ${guilds.length} servers.`
              : `Choose a server to manage or add GHOST to a new one.`}
          </p>
        </motion.div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search servers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
              style={{ background: 'rgba(22,24,32,0.9)', border: '1px solid rgba(84,0,0,0.3)' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all',       label: 'All' },
              { id: 'installed', label: `Active (${installedCount})` },
              { id: 'admin',     label: 'Admin' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                style={filter === f.id
                  ? { background: 'linear-gradient(135deg,var(--c1),var(--c2))', color: '#fff' }
                  : { background: 'rgba(22,24,32,0.9)', border: '1px solid rgba(84,0,0,0.2)', color: 'var(--tx-2)' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guild grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse"
                   style={{ background: 'rgba(22,24,32,0.6)' }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((guild, i) => (
                <GuildCard
                  key={guild.id}
                  guild={guild}
                  installed={botGuilds.includes(guild.id)}
                  onSelect={handleSelect}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <Search size={32} className="mx-auto mb-3 opacity-20" />
            <p>No servers match your search.</p>
          </div>
        )}

        {/* No guilds at all */}
        {!loading && guilds.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">
              No servers found. Make sure you granted the <strong>guilds</strong> scope during login.
            </p>
            <button
              onClick={() => { localStorage.clear(); navigate('/login') }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,var(--c1),var(--c2))' }}
            >
              Login Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
