import React, { Suspense, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import GhostScene from '../components/GhostScene'
import { loginUrl } from '../api'

const DISCORD_ICON = (
  <svg width="18" height="18" viewBox="0 0 71 55" fill="white">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0A40.7 40.7 0 0 0 25.6.4 58.4 58.4 0 0 0 11 4.9C1.6 19.1-.9 33 .3 46.6a58.9 58.9 0 0 0 18 9.1 44.4 44.4 0 0 0 3.8-6.2 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42 42 0 0 0 36 0l1.5 1.1a38.4 38.4 0 0 1-6 2.9 44.4 44.4 0 0 0 3.8 6.2 58.7 58.7 0 0 0 18-9.1C72 30.9 68.2 17.1 60.1 4.9ZM23.7 38.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Z"/>
  </svg>
)

const FEATURES = [
  { icon: '🛡️', text: 'Full command control per server' },
  { icon: '📊', text: 'Live stats & usage analytics' },
  { icon: '⚡', text: 'Real-time bot sync' },
  { icon: '🎛️', text: 'Per-server configuration' },
]

export default function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const error = searchParams.get('error')

  useEffect(() => {
    if (localStorage.getItem('ghost_token')) navigate('/servers', { replace: true })
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* Left — 3D scene */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
           style={{ borderRight: '1px solid var(--border)' }}>
        <div className="absolute inset-0 opacity-50">
          <Suspense fallback={null}><GhostScene /></Suspense>
        </div>
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to right, transparent 60%, var(--bg))' }} />
        <div className="relative z-10 space-y-3 px-12">
          <div className="flex items-center gap-3 mb-8">
            <img src="/ghost.png" alt="GHOST" className="w-10 h-10 rounded-xl"
                 style={{ filter: 'drop-shadow(0 0 10px rgba(84,0,0,0.8))' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--tx-1)' }}>GHOST Dashboard</span>
          </div>
          {FEATURES.map((f, i) => (
            <motion.div key={f.text}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--tx-2)' }}>{f.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right — login */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.img src="/ghost.png" alt="GHOST"
              className="w-14 h-14 mx-auto mb-4 rounded-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 14px rgba(84,0,0,0.9))' }}
            />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>
              Sign in with Discord to manage your servers
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: 'var(--err)' }}>
              Authentication failed. Please try again.
            </motion.div>
          )}

          {/* Card */}
          <div className="card p-6 space-y-5"
               style={{ boxShadow: '0 0 40px rgba(84,0,0,0.1)' }}>

            {/* Discord button */}
            <motion.a href={loginUrl()}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(88,101,242,0.35)' }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-lg
                         font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #5865F2, #4752c4)' }}>
              {DISCORD_ICON}
              Continue with Discord
            </motion.a>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--tx-3)' }}>What you'll get</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <ul className="space-y-2.5">
              {[
                { icon: '👤', text: 'Your username and avatar' },
                { icon: '🏠', text: 'List of your Discord servers' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm"
                    style={{ color: 'var(--tx-3)' }}>
                  <span>{icon}</span>{text}
                </li>
              ))}
            </ul>

            <p className="text-xs text-center" style={{ color: 'var(--tx-3)' }}>
              We never access your messages or DMs.
            </p>
          </div>

          <p className="text-center mt-5 text-xs" style={{ color: 'var(--tx-3)' }}>
            <a href="/" style={{ color: 'var(--tx-3)' }}
               onMouseEnter={e => e.target.style.color = 'var(--tx-1)'}
               onMouseLeave={e => e.target.style.color = 'var(--tx-3)'}>
              ← Back to home
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
