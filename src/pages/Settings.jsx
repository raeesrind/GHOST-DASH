import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Hash, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { getGuild, updatePrefix } from '../api'

export default function Settings() {
  const { activeGuild } = useOutletContext()
  const [prefix,  setPrefix]  = useState('?')
  const [original, setOriginal] = useState('?')
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeGuild) return
    setLoading(true)
    getGuild(activeGuild.id)
      .then(r => {
        setPrefix(r.data.prefix || '?')
        setOriginal(r.data.prefix || '?')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeGuild])

  async function savePrefix() {
    if (!activeGuild) return
    if (!prefix.trim()) return toast.error('Prefix cannot be empty')
    setSaving(true)
    try {
      await updatePrefix(activeGuild.id, prefix.trim())
      setOriginal(prefix.trim())
      toast.success('Prefix updated!')
    } catch {
      toast.error('Failed to update prefix')
    } finally {
      setSaving(false)
    }
  }

  if (!activeGuild) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select a server to configure settings.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure {activeGuild.name}</p>
      </div>

      {/* Prefix card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Hash size={16} className="text-ghost-red" style={{ color: '#8b0000' }} />
          <h2 className="text-white font-semibold">Command Prefix</h2>
        </div>

        <p className="text-gray-400 text-sm">
          The prefix used for text commands (e.g. <code className="text-ghost-glow font-mono">?help</code>).
          Slash commands are unaffected.
        </p>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/</span>
            <input
              type="text"
              value={prefix}
              onChange={e => setPrefix(e.target.value.slice(0, 5))}
              maxLength={5}
              disabled={loading}
              className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-ghost-border
                         text-white text-sm focus:outline-none focus:border-ghost-red
                         disabled:opacity-50"
              style={{ background: 'var(--bg)' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={savePrefix}
            disabled={saving || prefix === original}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
                       bg-ghost-red hover:bg-ghost-redlit text-white transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </motion.button>
        </div>

        {prefix !== original && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-amber-400"
          >
            <Info size={12} />
            Unsaved changes — click Save to apply.
          </motion.div>
        )}
      </motion.div>

      {/* Server info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6"
      >
        <h2 className="text-white font-semibold mb-4">Server Info</h2>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Server ID',     value: activeGuild.id },
            { label: 'Server Name',   value: activeGuild.name },
            { label: 'Member Count',  value: activeGuild.member_count?.toLocaleString() },
            { label: 'Current Prefix', value: original },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-ghost-border/30 last:border-0">
              <span className="text-gray-400">{label}</span>
              <span className="text-white font-mono">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
