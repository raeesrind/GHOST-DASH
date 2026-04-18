import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, sub, accent = '#540000' }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: .18 }} className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2"
             style={{ color: 'var(--tx-3)' }}>{label}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>{value ?? '—'}</p>
          {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--tx-3)' }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
               style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}>
            <Icon size={16} style={{ color: accent }} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
