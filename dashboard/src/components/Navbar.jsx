import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ExternalLink, LogOut } from 'lucide-react'
import { getMe } from '../api'

const NAV_LINKS = [
  { label: 'Home', to: '/', external: false },
  { label: 'Commands', to: '/commands-list', external: false },
  { label: 'Status', to: '/status', external: false },
  { label: 'Statistics', to: '/statistics', external: false },
  { label: 'Support', to: '/support', external: false },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('ghost_token')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      getMe().then(r => setUser(r.data)).catch(() => { })
    }
  }, [isLoggedIn])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (to) => location.pathname === to

  function logout() {
    localStorage.clear()
    setUser(null)
    navigate('/login')
  }

  function userAvatarUrl(u) {
    if (!u) return null
    if (u.avatar_url) return u.avatar_url
    if (u.avatar && u.sub) {
      const ext = u.avatar.startsWith('a_') ? 'gif' : 'png'
      return `https://cdn.discordapp.com/avatars/${u.sub}/${u.avatar}.${ext}?size=64`
    }
    return `https://cdn.discordapp.com/embed/avatars/0.png`
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(13,14,17,0.95)'
            : 'rgba(13,14,17,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled
            ? '1px solid var(--border)'
            : '1px solid rgba(42,46,56,0.5)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                         group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--c1), var(--c2))',
                boxShadow: '0 0 10px rgba(84,0,0,0.5)',
              }}
            >
              <img src="/ghost.png" alt="GHOST" className="w-6 h-6 object-contain" />
            </div>
            <span
              className="font-extrabold text-lg tracking-wide transition-all duration-300"
              style={{ color: 'var(--tx-1)' }}
            >
              GHOST
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, to, external }) => {
              const active = isActive(to)
              if (external) {
                return (
                  <a
                    key={label}
                    href={to}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
                               transition-colors duration-200"
                    style={{ color: 'var(--tx-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--tx-1)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--tx-3)'}
                  >
                    {label}
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                )
              }
              return (
                <Link key={label} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    style={{ color: active ? 'var(--tx-1)' : 'var(--tx-3)' }}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'var(--brand-soft)',
                          border: '1px solid var(--brand-border)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* ── Right side: user pill or CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                <Link to="/servers">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300
                               border border-ghost-border hover:border-ghost-red hover:text-white
                               transition-all duration-200"
                    style={{ background: 'var(--surface)' }}
                  >
                    Dashboard
                  </motion.button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <img
                    src={userAvatarUrl(user)}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover"
                    style={{ border: '1px solid rgba(84,0,0,0.4)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--tx-1)' }}>
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="ml-1 p-1 rounded transition-colors"
                    style={{ color: 'var(--tx-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#E74C3C'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--tx-3)'}
                    title="Logout"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300
                               border border-ghost-border hover:border-ghost-red hover:text-white
                               transition-all duration-200"
                    style={{ background: 'var(--surface)' }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(84,0,0,0.6)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
                               text-white transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, var(--c1), var(--c2))',
                      boxShadow: '0 0 10px rgba(84,0,0,0.35)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 71 55" fill="white">
                      <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0A40.7 40.7 0 0 0 25.6.4 58.4 58.4 0 0 0 11 4.9C1.6 19.1-.9 33 .3 46.6a58.9 58.9 0 0 0 18 9.1 44.4 44.4 0 0 0 3.8-6.2 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42 42 0 0 0 36 0l1.5 1.1a38.4 38.4 0 0 1-6 2.9 44.4 44.4 0 0 0 3.8 6.2 58.7 58.7 0 0 0 18-9.1C72 30.9 68.2 17.1 60.1 4.9ZM23.7 38.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Z" />
                    </svg>
                    Invite Bot
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{
              background: 'rgba(13,14,17,0.97)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ label, to, external }) =>
                external ? (
                  <a
                    key={label}
                    href={to}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm
                               font-medium transition-colors"
                    style={{ color: 'var(--tx-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--tx-1)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--tx-3)'}
                  >
                    {label} <ExternalLink size={12} />
                  </a>
                ) : (
                  <Link key={label} to={to}>
                    <div
                      className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        color: isActive(to) ? 'var(--tx-1)' : 'var(--tx-3)',
                        background: isActive(to) ? 'var(--brand-soft)' : 'transparent',
                      }}
                    >
                      {label}
                    </div>
                  </Link>
                )
              )}
              <div className="pt-3 flex gap-3">
                {isLoggedIn && user ? (
                  <>
                    <Link to="/servers" className="flex-1">
                      <button className="w-full py-2.5 rounded-lg text-sm font-medium
                                         border transition-colors"
                        style={{ color: 'var(--tx-2)', borderColor: 'var(--border)', background: 'transparent' }}>
                        Dashboard
                      </button>
                    </Link>
                    <button onClick={logout} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, var(--c1), var(--c2))' }}>
                      <LogOut size={13} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <button className="w-full py-2.5 rounded-lg text-sm font-medium
                                         border transition-colors"
                        style={{ color: 'var(--tx-2)', borderColor: 'var(--border)', background: 'transparent' }}>
                        Login
                      </button>
                    </Link>
                    <Link to="/login" className="flex-1">
                      <button
                        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--c1), var(--c2))' }}
                      >
                        Invite Bot
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div className="h-16" />
    </>
  )
}
