/**
 * Server selector — shown after Discord login.
 * Shows only mutual guilds (bot + user are both in).
 * Only admins/owners can manage a server.
 */
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Settings, ChevronRight, Crown, Shield, Lock, X } from 'lucide-react'
import { getMe, getDiscordGuilds } from '../api'

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
function GuildCard({ guild, canManage, onSelect, index }) {
  const icon = guildIcon(guild)
  const isAdmin = guild.is_admin || guild.is_owner || (guild.permissions & 0x8) === 0x8
  const isOwner = guild.is_owner || guild.owner

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200"
      style={{
        background: 'rgba(22,24,32,0.9)',
        border: canManage
          ? '1px solid rgba(84,0,0,0.5)'
          : '1px solid rgba(84,0,0,0.15)',
        boxShadow: canManage ? '0 0 16px rgba(84,0,0,0.15)' : 'none',
      }}
      onClick={() => onSelect(guild)}
    >
      {/* Guild banner / header */}
      <div
        className="h-16 relative flex items-end px-4 pb-0"
        style={{
          background: canManage
            ? 'linear-gradient(135deg, rgba(84,0,0,0.4), rgba(139,0,0,0.2))'
            : 'linear-gradient(135deg, rgba(22,24,32,0.8), rgba(31,34,42,0.6))',
        }}
      >
        {/* Active badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(84,0,0,0.8)', color: '#ff9999', border: '1px solid rgba(139,0,0,0.6)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Active
        </div>
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
              style={{ borderColor: canManage ? 'rgba(84,0,0,0.6)' : 'rgba(84,0,0,0.2)' }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border-2"
              style={{
                background: 'linear-gradient(135deg, var(--c1), var(--c2))',
                borderColor: canManage ? 'rgba(84,0,0,0.6)' : 'rgba(84,0,0,0.2)',
                color: 'var(--c3)',
              }}
            >
              {guildInitials(guild.name)}
            </div>
          )}
          <div className="flex-1 min-w-0 mt-6">
            <p className="text-white font-semibold text-sm truncate">{guild.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {isOwner && (
                <span className="flex items-center gap-1 text-xs text-purple-400">
                  <Crown size={10} /> Owner
                </span>
              )}
              {isAdmin && !isOwner && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Shield size={10} /> Admin
                </span>
              )}
              {!isAdmin && !isOwner && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Lock size={10} /> Member
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        {canManage ? (
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
          <div
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                       text-sm font-medium text-gray-500 cursor-not-allowed"
            style={{ background: 'rgba(84,0,0,0.05)', border: '1px solid rgba(84,0,0,0.15)' }}
            title="You need Administrator or Manage Server permission"
          >
            <Lock size={14} />
            No Permission
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ServerSelector() {
  const [user, setUser] = useState(null)
  const [guilds, setGuilds] = useState([])   // mutual guilds (bot + user)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | manageable | admin
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(r => setUser(r.data)).catch(() => { })

    // /auth/guilds returns ONLY mutual guilds with real user permissions
    getDiscordGuilds()
      .then(r => {
        const guilds = r.data || []
        const enriched = guilds.map(g => {
          const perms = parseInt(g.permissions || '0', 10)
          const isOwner = g.owner === true
          const isAdmin = g.is_admin === true || isOwner ||
            (perms & 0x8) === 0x8 ||    // ADMINISTRATOR
            (perms & 0x20) === 0x20      // MANAGE_GUILD
          return {
            ...g,
            is_owner: isOwner,
            is_admin: isAdmin,
            can_manage: isAdmin,
          }
        })
        setGuilds(enriched)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(guild) {
    if (!guild.can_manage) return  // silently block — button is already disabled
    localStorage.setItem('ghost_active_guild', JSON.stringify({
      id: guild.id, name: guild.name, icon: guild.icon,
    }))
    navigate(`/manage/${guild.id}`)
  }

  const filtered = useMemo(() => {
    return guilds.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'manageable' && !g.can_manage) return false
      if (filter === 'admin' && !g.is_admin) return false
      return true
    })
  }, [guilds, search, filter])

  const manageableCount = guilds.filter(g => g.can_manage).length

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
            {guilds.length > 0
              ? `GHOST is active in ${guilds.length} mutual servers. You can manage ${manageableCount}.`
              : `No mutual servers found.`}
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
              { id: 'all', label: 'All' },
              { id: 'manageable', label: `Can Manage (${manageableCount})` },
              { id: 'admin', label: 'Admin' },
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
                  canManage={guild.can_manage}
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
              No mutual servers found. Make sure GHOST is in your server and you granted the <strong>guilds</strong> scope during login.
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
