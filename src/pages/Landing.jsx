import React, { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, BarChart2, Terminal, ChevronRight } from 'lucide-react'
import GhostScene from '../components/GhostScene'
import Navbar from '../components/Navbar'

const FEATURES = [
  { icon: Terminal,  title: 'Command Control', desc: 'Enable, disable, and configure every bot command from the dashboard.' },
  { icon: BarChart2, title: 'Live Analytics',  desc: 'Real-time usage graphs, top commands, and server activity.' },
  { icon: Shield,    title: 'Role Gating',     desc: 'Restrict commands to specific roles with one click.' },
  { icon: Zap,       title: 'Instant Sync',    desc: 'Changes reflect on the bot within seconds via live API.' },
]

const STATS = [
  { value: '150+', label: 'Commands' },
  { value: '4',    label: 'Servers' },
  { value: '99.9%',label: 'Uptime' },
  { value: '<30ms',label: 'Latency' },
]

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex items-center justify-center overflow-hidden"
               style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="absolute inset-0 z-0 opacity-60">
          <Suspense fallback={null}><GhostScene /></Suspense>
        </div>
        <div className="absolute inset-0 z-10"
             style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--bg) 100%)' }} />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.img src="/ghost.png" alt="GHOST"
              className="w-20 h-20 mx-auto mb-6 rounded-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 24px rgba(84,0,0,0.9))' }}
            />
            <h1 className="font-extrabold tracking-tight mb-4"
                style={{ fontSize: 'clamp(2.5rem,8vw,5rem)', color: 'var(--tx-1)', lineHeight: 1.1 }}>
              <span style={{ color: 'var(--c3)' }}>GHOST</span> Dashboard
            </h1>
            <p className="mb-8 max-w-xl mx-auto" style={{ fontSize: '1.1rem', color: 'var(--tx-2)' }}>
              SaaS-level control panel for your Discord server. Manage commands, view live stats, and configure your bot.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn btn-primary px-8 py-3 text-base">
                  Get Started <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link to="/commands-list">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn btn-secondary px-8 py-3 text-base">
                  View Commands <ChevronRight size={16} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full flex justify-center pt-1.5"
               style={{ border: '1px solid var(--border)' }}>
            <div className="w-1 h-2 rounded-full" style={{ background: 'var(--brand)' }} />
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--tx-3)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--tx-1)' }}>
            Everything you need to manage your server
          </h2>
          <p style={{ color: 'var(--tx-3)' }}>A complete control panel built for Discord server admins.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="card card-hover p-5"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                   style={{ background: 'rgba(84,0,0,0.15)', border: '1px solid rgba(84,0,0,0.25)' }}>
                <Icon size={16} style={{ color: 'var(--c3)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--tx-1)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--tx-3)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} className="card max-w-xl mx-auto p-10">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--tx-1)' }}>Ready to take control?</h2>
          <p className="mb-6" style={{ color: 'var(--tx-3)' }}>Log in with Discord and start managing your server in seconds.</p>
          <Link to="/login">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn btn-primary px-10 py-3 text-base">
              Login with Discord
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--tx-3)' }}>
        <img src="/ghost.png" alt="GHOST" className="w-5 h-5 inline-block mr-2 opacity-40" />
        GHOST Bot Dashboard © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
