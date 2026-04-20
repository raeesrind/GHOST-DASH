import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Terminal, BarChart2, Activity,
  Settings, LogOut, Menu, X, ChevronDown, Server, Bell,
} from 'lucide-react'
import { getGuilds, getMe } from '../api'

const NAV = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Overview'  },
  { to: '/dashboard/commands',  icon: Terminal,         label: 'Commands'  },
  { to: '/dashboard/stats',     icon: BarChart2,        label: 'Stats'     },
  { to: '/dashboard/status',    icon: Activity,         label: 'Status'    },
  { to: '/dashboard/settings',  icon: Settings,         label: 'Settings'  },
]

function GuildAvatar({ guild, size = 8 }) {
  if (guild?.icon)
    return <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=512`}
                alt={guild.name} className={`w-${size} h-${size} rounded-lg object-cover`} />
  const init = (guild?.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`w-${size} h-${size} rounded-lg flex items-center justify-center text-xs font-bold`}
         style={{ background: 'linear-gradient(135deg, var(--c1), var(--c2))', color: 'var(--c3)' }}>
      {init}
    </div>
  )
}

export default function DashLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guilds,      setGuilds]      = useState([])
  const [activeGuild, setActiveGuild] = useState(null)
  const [user,        setUser]        = useState(null)
  const [guildOpen,   setGuildOpen]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(r => setUser(r.data)).catch(() => {})
    getGuilds().then(r => {
      setGuilds(r.data)
      const stored = localStorage.getItem('ghost_active_guild')
      if (stored) {
        try {
          const g = JSON.parse(stored)
          setActiveGuild(r.data.find(bg => bg.id === g.id) || r.data[0] || g)
        } catch { if (r.data.length) setActiveGuild(r.data[0]) }
      } else if (r.data.length) setActiveGuild(r.data[0])
    }).catch(() => {})
  }, [])

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  const avatarUrl = user?.avatar_url
    || (user?.avatar && user?.sub
      ? `https://cdn.discordapp.com/avatars/${user.sub}/${user.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static z-30 h-full w-56 flex flex-col shrink-0
                    transition-transform duration-200
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4"
             style={{ borderBottom: '1px solid var(--border)' }}>
          <img src="/ghost.png" alt="GHOST" className="w-8 h-8 rounded-lg"
               style={{ filter: 'drop-shadow(0 0 6px rgba(84,0,0,0.7))' }} />
          <span className="font-bold text-base tracking-wide" style={{ color: 'var(--tx-1)' }}>
            GHOST
          </span>
          <button className="ml-auto lg:hidden" style={{ color: 'var(--tx-3)' }}
                  onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Guild selector */}
        <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setGuildOpen(o => !o)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: 'var(--surface-h)',
              border: '1px solid var(--border)',
              color: 'var(--tx-2)',
            }}
          >
            <GuildAvatar guild={activeGuild} size={5} />
            <span className="flex-1 text-left truncate text-xs font-medium">
              {activeGuild?.name || 'Select Server'}
            </span>
            <ChevronDown size={13} className={`transition-transform ${guildOpen ? 'rotate-180' : ''}`}
                         style={{ color: 'var(--tx-3)' }} />
          </button>

          <AnimatePresence>
            {guildOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                className="mt-1 rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                {guilds.map(g => (
                  <button key={g.id}
                    onClick={() => {
                      setActiveGuild(g); setGuildOpen(false)
                      localStorage.setItem('ghost_active_guild', JSON.stringify({ id: g.id, name: g.name, icon: g.icon }))
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                    style={{ color: 'var(--tx-2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <GuildAvatar guild={g} size={5} />
                    <span className="truncate">{g.name}</span>
                  </button>
                ))}
                {!guilds.length && (
                  <p className="px-3 py-2 text-xs" style={{ color: 'var(--tx-3)' }}>No servers</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="nav-label mb-2">Dashboard</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 px-2">
            <img src={avatarUrl} alt="avatar"
                 className="w-7 h-7 rounded-full"
                 style={{ border: '1px solid var(--border)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--tx-1)' }}>
                {user?.username || '…'}
              </p>
              <p className="text-xs" style={{ color: 'var(--tx-3)' }}>Dashboard</p>
            </div>
            <button onClick={logout} className="btn-ghost p-1 rounded"
                    style={{ color: 'var(--tx-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--err)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--tx-3)'}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 h-14 shrink-0"
                style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <button className="lg:hidden" style={{ color: 'var(--tx-3)' }}
                  onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <input className="input text-xs py-1.5" placeholder="Search commands, settings…" />
          </div>

          <div className="flex-1" />

          {/* Guild name */}
          {activeGuild && (
            <span className="text-xs hidden md:block" style={{ color: 'var(--tx-3)' }}>
              Managing: <span style={{ color: 'var(--tx-2)', fontWeight: 500 }}>{activeGuild.name}</span>
            </span>
          )}

          {/* Notifications */}
          <button className="btn-ghost p-2 rounded-lg relative">
            <Bell size={16} style={{ color: 'var(--tx-3)' }} />
          </button>

          {/* Status dot */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-g-success animate-pulse" />
            <span className="text-xs hidden sm:block" style={{ color: 'var(--tx-3)' }}>Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet context={{ activeGuild, guilds }} />
        </main>
      </div>
    </div>
  )
}
