import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Terminal, Shield, Star, Zap, Settings,
  BarChart2, Activity, LogOut, Menu, X, ChevronRight,
  Server, Users, MessageSquare, Bell, Hash, Crown,
  Gift, Gamepad2, Wrench, ArrowLeft, Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getMe, getGuilds, getCommands, updateCommand, updatePrefix, getGuild, getBotStatus,
  getActionLog, saveActionLog, getGuildChannels, getGuildRoles, getGuildEmojis,
  getAutoMod, saveAutoMod, getModerationSettings, saveModerationSettings,
  getWelcomer, saveWelcomer,
  getCustomCommands, createCustomCommand, deleteCustomCommand, toggleCustomCommand,
  getAutoResponders, saveAutoResponder, deleteAutoResponder, toggleAutoResponder,
  getGiveaways, getGiveawaySettings, saveGiveawaySettings, endGiveaway, deleteGiveaway,
  getReactionRoles, saveReactionRole, deleteReactionRole, postReactionRole,
  getMemberCheck
} from '../api'
import Toggle from '../components/Toggle'
import StatCard from '../components/StatCard'
import { ALL_COMMANDS, CATEGORIES } from '../data/commands'

const MODULES = [
  {
    section: 'General', items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'commands', label: 'Commands', icon: Terminal },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  },
  {
    section: 'Moderation', items: [
      { id: 'moderation', label: 'Moderation', icon: Shield },
      { id: 'automod', label: 'Auto Mod', icon: Zap },
      { id: 'logs', label: 'Action Log', icon: MessageSquare },
    ]
  },
  {
    section: 'Engagement', items: [
      { id: 'leveling', label: 'Leveling', icon: Star },
      { id: 'welcomer', label: 'Welcomer', icon: Users },
      { id: 'giveaways', label: 'Giveaways', icon: Gift }, { id: 'fun', label: 'Fun', icon: Gamepad2 },
    ]
  },
  {
    section: 'Utility', items: [
      { id: 'customcmds', label: 'Custom Commands', icon: Terminal },
      { id: 'autoresponder', label: 'Auto Responder', icon: MessageSquare },
      { id: 'reactionroles', label: 'Reaction Roles', icon: Crown },
      { id: 'roles', label: 'Roles', icon: Crown },
      { id: 'channels', label: 'Channels', icon: Hash },
      { id: 'utility', label: 'Utility', icon: Wrench },
    ]
  },
  {
    section: 'Analytics', items: [
      { id: 'stats', label: 'Statistics', icon: BarChart2 },
      { id: 'status', label: 'Bot Status', icon: Activity },
    ]
  },
]

const CAT_COLOR = {
  Moderation: '#E74C3C', Leveling: '#F39C12', Fun: '#9B59B6',
  Actions: '#E91E8C', Utility: '#4A90E2', Economy: '#2ECC71',
  Giveaway: '#F97316', Minigames: '#06B6D4', Owner: '#540000',
}

function GuildAvatar({ guild, size = 10 }) {
  if (guild?.icon) {
    let src
    if (guild.icon.startsWith('http')) {
      // Bot syncs full CDN URLs — use directly, swap to gif if animated hash in path
      src = /\/a_[a-f0-9]+\./.test(guild.icon)
        ? guild.icon.replace(/\.(png|webp|jpg)(\?|$)/, '.gif$2')
        : guild.icon
    } else {
      const ext = guild.icon.startsWith('a_') ? 'gif' : 'png'
      src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=128`
    }
    return <img src={src} alt={guild.name} className={`w-${size} h-${size} rounded-xl object-cover`} />
  }
  const init = (guild?.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-sm font-bold`}
      style={{ background: 'linear-gradient(135deg,#540000,#3A0000)', color: '#ffaaaa' }}>
      {init}
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewPanel({ guild, botStatus }) {
  const online = botStatus?.online && (Date.now() / 1000 - (botStatus?.last_seen || 0)) < 90
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Guild hero */}
      <div className="card p-5 flex items-center gap-4">
        <GuildAvatar guild={guild} size={14} />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>{guild?.name || '—'}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
            {guild?.member_count?.toLocaleString() || '—'} members · ID: {guild?.id}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-g-success' : 'bg-g-error'}`}
              style={{ boxShadow: online ? '0 0 6px #2ECC71' : '0 0 6px #E74C3C' }} />
            <span className="text-xs font-medium" style={{ color: online ? '#2ECC71' : '#E74C3C' }}>
              Bot {online ? 'Online' : 'Offline'}
            </span>
            {online && <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              · {Math.round(botStatus?.latency_ms || 0)}ms
            </span>}
          </div>
        </div>
        <div className="badge badge-red hidden sm:flex">{guild?.prefix || '?'} prefix</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Members" value={guild?.member_count?.toLocaleString() || '—'} />
        <StatCard icon={Activity} label="Latency" value={`${Math.round(botStatus?.latency_ms || 0)}ms`} accent="#4A90E2" />
        <StatCard icon={Terminal} label="Prefix" value={guild?.prefix || '?'} />
        <StatCard icon={Server} label="Total Servers" value={botStatus?.guild_count || '—'} />
      </div>

      {/* Quick access grid */}
      <div className="card p-5">
        <h3 className="mb-4" style={{ color: 'var(--text-1)' }}>Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MODULES.flatMap(s => s.items).filter(i => i.id !== 'overview').map(({ id, label, icon: Icon }) => (
            <button key={id}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all group"
              style={{ background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(84,0,0,0.4)'; e.currentTarget.style.color = 'var(--text-1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
            >
              <Icon size={14} style={{ color: '#540000' }} />
              <span className="font-medium text-xs">{label}</span>
              <ChevronRight size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Commands ──────────────────────────────────────────────────────────────────
function CommandsPanel({ guildId }) {
  const [configs, setConfigs] = useState({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!guildId) return
    getCommands(guildId).then(r => {
      const map = {}; r.data.forEach(c => { map[c.command_name] = c }); setConfigs(map)
    }).catch(() => { }).finally(() => setLoading(false))
  }, [guildId])

  const handleToggle = useCallback(async (cmdName, enabled) => {
    const cfg = configs[cmdName] || {}
    await updateCommand(guildId, { command_name: cmdName, enabled, cooldown: cfg.cooldown || 0, roles: cfg.roles || '[]' })
    setConfigs(prev => ({ ...prev, [cmdName]: { ...cfg, command_name: cmdName, enabled } }))
    toast.success(`${cmdName} ${enabled ? 'enabled' : 'disabled'}`)
  }, [guildId, configs])

  const seen = new Set()
  const filtered = ALL_COMMANDS.filter(cmd => {
    if (cmd.parent) return false
    const k = `${cmd.name}-${cmd.category}`; if (seen.has(k)) return false; seen.add(k)
    if (category !== 'all' && cmd.category !== category) return false
    if (search) { const q = search.toLowerCase(); return cmd.name.includes(q) || cmd.description.toLowerCase().includes(q) }
    return true
  })

  const enabledCount = filtered.filter(c => configs[c.name]?.enabled !== false).length
  const disabledCount = filtered.filter(c => configs[c.name]?.enabled === false).length

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-d)' }} />
          <input className="input pl-8 text-sm" placeholder="Search commands…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input text-sm w-auto" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
        <span>{filtered.length} commands</span>
        <span className="badge badge-success">{enabledCount} enabled</span>
        {disabledCount > 0 && <span className="badge badge-error">{disabledCount} disabled</span>}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />
        ))}</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Command</th>
                <th className="hidden sm:table-cell">Category</th>
                <th className="hidden md:table-cell">Description</th>
                <th className="hidden sm:table-cell">Aliases</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cmd => {
                const enabled = configs[cmd.name]?.enabled ?? true
                const color = CAT_COLOR[cmd.category] || '#540000'
                return (
                  <tr key={`${cmd.name}-${cmd.category}`}>
                    <td>
                      <span className="font-mono font-semibold text-sm" style={{ color: enabled ? color : 'var(--text-d)' }}>
                        {cmd.name}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                        {cmd.category}
                      </span>
                    </td>
                    <td className="hidden md:table-cell" style={{ color: 'var(--text-3)', maxWidth: 240 }}>
                      <span className="truncate block">{cmd.description || '—'}</span>
                    </td>
                    <td className="hidden sm:table-cell" style={{ color: 'var(--text-d)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {cmd.aliases.slice(0, 2).join(', ') || '—'}
                    </td>
                    <td>
                      <Toggle enabled={enabled} onChange={v => handleToggle(cmd.name, v)} size="sm" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsPanel({ guild, onPrefixSave }) {
  const [prefix, setPrefix] = useState(guild?.prefix || '?')
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (guild?.prefix) setPrefix(guild.prefix) }, [guild])

  async function save() {
    setSaving(true)
    try { await onPrefixSave(prefix); toast.success('Prefix updated!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-lg">
      <div className="card p-5 space-y-4">
        <div>
          <h3 style={{ color: 'var(--text-1)' }}>Command Prefix</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
            The prefix used for text commands in this server.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <input className="input font-mono w-24 text-center text-lg" value={prefix}
            onChange={e => setPrefix(e.target.value.slice(0, 5))} maxLength={5} />
          <button className="btn btn-primary" onClick={save}
            disabled={saving || prefix === guild?.prefix}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {prefix !== guild?.prefix && (
            <span className="text-xs" style={{ color: 'var(--warning)' }}>Unsaved changes</span>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4" style={{ color: 'var(--text-1)' }}>Server Information</h3>
        <div className="space-y-0 table-wrap">
          <table>
            <tbody>
              {[
                ['Server ID', guild?.id],
                ['Server Name', guild?.name],
                ['Members', guild?.member_count?.toLocaleString()],
                ['Current Prefix', guild?.prefix || '?'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ color: 'var(--text-3)', width: 160 }}>{label}</td>
                  <td className="font-mono" style={{ color: 'var(--text-1)' }}>{value || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Action Log ────────────────────────────────────────────────────────────────
const AL = {
  bg: '#1a0000',
  card: '#2a0000',
  hover: '#3a0000',
  border: '#540000',
  borderSub: '#3d0000',
  text1: '#f5d0d0',
  text2: '#b07070',
  textDis: '#6b3a3a',
  accent: '#cc2222',
  btnBg: '#540000',
}

const EVENT_CATEGORIES = [
  {
    label: 'Member Events', events: [
      { key: 'member_join', label: 'Member Joined', desc: 'When someone joins the server' },
      { key: 'member_leave', label: 'Member Left', desc: 'When someone leaves or is kicked' },
      { key: 'member_ban', label: 'Member Banned', desc: 'When a member is banned' },
      { key: 'member_unban', label: 'Member Unbanned', desc: 'When a ban is lifted' },
      { key: 'member_nickname', label: 'Nickname Changed', desc: 'When a nickname is updated' },
      { key: 'member_roles', label: 'Roles Updated', desc: 'When roles are added or removed' },
      { key: 'member_timeout', label: 'Member Timed Out', desc: 'When a member receives a timeout' },
    ]
  },
  {
    label: 'Message Events', events: [
      { key: 'message_delete', label: 'Message Deleted', desc: 'When a message is deleted' },
      { key: 'message_edit', label: 'Message Edited', desc: 'When a message is edited' },
      { key: 'message_bulk', label: 'Bulk Message Delete', desc: 'When multiple messages are purged' },
    ]
  },
  {
    label: 'Channel Events', events: [
      { key: 'channel_create', label: 'Channel Created', desc: 'When a channel is created' },
      { key: 'channel_delete', label: 'Channel Deleted', desc: 'When a channel is deleted' },
      { key: 'channel_update', label: 'Channel Updated', desc: 'When a channel is modified' },
    ]
  },
  {
    label: 'Role Events', events: [
      { key: 'role_create', label: 'Role Created', desc: 'When a role is created' },
      { key: 'role_delete', label: 'Role Deleted', desc: 'When a role is deleted' },
      { key: 'role_update', label: 'Role Updated', desc: 'When a role is modified' },
    ]
  },
  {
    label: 'Server Events', events: [
      { key: 'guild_update', label: 'Server Updated', desc: 'When server settings change' },
      { key: 'emoji_update', label: 'Emoji/Sticker Changed', desc: 'When emojis or stickers change' },
    ]
  },
  {
    label: 'Voice Events', events: [
      { key: 'voice_join', label: 'Joined Voice Channel', desc: 'When a member joins a voice channel' },
      { key: 'voice_leave', label: 'Left Voice Channel', desc: 'When a member leaves a voice channel' },
      { key: 'voice_move', label: 'Moved Voice Channels', desc: 'When a member switches voice channels' },
    ]
  },
]

const DEFAULT_AL_STATE = {
  enabled: false,
  defaultChannel: null,
  ignoredChannels: [],
  ignoredRoles: [],
  events: {
    member_join: { enabled: true, channelId: null },
    member_leave: { enabled: true, channelId: null },
    member_ban: { enabled: true, channelId: null },
    member_unban: { enabled: true, channelId: null },
    member_nickname: { enabled: true, channelId: null },
    member_roles: { enabled: true, channelId: null },
    member_timeout: { enabled: true, channelId: null },
    message_delete: { enabled: true, channelId: null },
    message_edit: { enabled: true, channelId: null },
    message_bulk: { enabled: true, channelId: null },
    channel_create: { enabled: true, channelId: null },
    channel_delete: { enabled: true, channelId: null },
    channel_update: { enabled: false, channelId: null },
    role_create: { enabled: true, channelId: null },
    role_delete: { enabled: true, channelId: null },
    role_update: { enabled: false, channelId: null },
    guild_update: { enabled: false, channelId: null },
    emoji_update: { enabled: false, channelId: null },
    voice_join: { enabled: false, channelId: null },
    voice_leave: { enabled: false, channelId: null },
    voice_move: { enabled: false, channelId: null },
  },
}

function ALChannelSelect({ channels, value, onChange, placeholder = 'Use Default' }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      style={{
        background: AL.card, border: `1px solid ${AL.border}`, color: value ? AL.text1 : AL.text2,
        borderRadius: 6, padding: '4px 8px', fontSize: 12, minWidth: 140, outline: 'none',
      }}
    >
      <option value="">{placeholder}</option>
      {channels.map(ch => (
        <option key={ch.id} value={ch.id}>#{ch.name}</option>
      ))}
    </select>
  )
}

function ALMultiSelect({ items, selected, onChange, placeholder, labelKey = 'name', prefix = '' }) {
  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    onChange(next)
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map(item => {
        const active = selected.includes(item.id)
        return (
          <button key={item.id} onClick={() => toggle(item.id)}
            style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: active ? AL.accent : AL.card,
              border: `1px solid ${active ? AL.accent : AL.border}`,
              color: active ? '#fff' : AL.text2,
              transition: 'all 0.15s',
            }}
          >
            {prefix}{item[labelKey]}
          </button>
        )
      })}
      {items.length === 0 && (
        <span style={{ color: AL.textDis, fontSize: 12 }}>{placeholder}</span>
      )}
    </div>
  )
}

function ALToggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: enabled ? AL.accent : AL.borderSub,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        boxShadow: enabled ? `0 0 6px ${AL.accent}55` : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: enabled ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', display: 'block',
      }} />
    </button>
  )
}

function ActionLogPanel({ guildId }) {
  const [cfg, setCfg] = useState(DEFAULT_AL_STATE)
  const [channels, setChannels] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [collapsed, setCollapsed] = useState({})

  useEffect(() => {
    if (!guildId) return
    Promise.all([
      getActionLog(guildId).catch(() => ({ data: DEFAULT_AL_STATE })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
    ]).then(([al, ch, ro]) => {
      const data = al.data || DEFAULT_AL_STATE
      // Merge with defaults so all keys exist
      const mergedEvents = { ...DEFAULT_AL_STATE.events }
      for (const [k, v] of Object.entries(data.events || {})) {
        mergedEvents[k] = v
      }
      setCfg({ ...DEFAULT_AL_STATE, ...data, events: mergedEvents })
      setChannels(ch.data || [])
      setRoles(ro.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  const setEvent = (key, patch) =>
    setCfg(prev => ({ ...prev, events: { ...prev.events, [key]: { ...prev.events[key], ...patch } } }))

  async function save() {
    setSaving(true)
    try {
      await saveActionLog(guildId, cfg)
      toast.success('Action Log saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: AL.card }} />
      ))}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in" style={{ maxWidth: 860 }}>

      {/* Header card */}
      <div style={{ background: AL.card, border: `1px solid ${AL.border}`, borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ color: AL.text1, margin: 0, fontSize: 16, fontWeight: 700 }}>Action Log</h3>
            <p style={{ color: AL.text2, margin: '4px 0 0', fontSize: 13 }}>Log server events to specific channels</p>
          </div>
          <ALToggle enabled={cfg.enabled} onChange={v => setCfg(p => ({ ...p, enabled: v }))} />
        </div>

        {/* Default channel */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${AL.borderSub}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ color: AL.text1, margin: 0, fontSize: 13, fontWeight: 600 }}>Default Log Channel</p>
              <p style={{ color: AL.text2, margin: '2px 0 0', fontSize: 12 }}>Catches all events with no specific channel override</p>
            </div>
            <ALChannelSelect
              channels={channels}
              value={cfg.defaultChannel}
              onChange={v => setCfg(p => ({ ...p, defaultChannel: v }))}
              placeholder="Select a channel…"
            />
          </div>
        </div>
      </div>

      {/* Event categories */}
      {EVENT_CATEGORIES.map(cat => {
        const isOpen = collapsed[cat.label] !== false
        return (
          <div key={cat.label} style={{ background: AL.card, border: `1px solid ${AL.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* Category header */}
            <button
              onClick={() => setCollapsed(p => ({ ...p, [cat.label]: !isOpen }))}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', background: AL.border, border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{cat.label}</span>
              <ChevronRight size={14} style={{ color: AL.text1, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Event rows */}
            {isOpen && cat.events.map((ev, idx) => {
              const evCfg = cfg.events[ev.key] || { enabled: true, channelId: null }
              return (
                <div key={ev.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                    borderTop: idx === 0 ? 'none' : `1px solid ${AL.borderSub}`,
                    background: 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = AL.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ALToggle enabled={evCfg.enabled} onChange={v => setEvent(ev.key, { enabled: v })} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: evCfg.enabled ? AL.text1 : AL.textDis }}>{ev.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: AL.text2 }}>{ev.desc}</p>
                  </div>
                  <ALChannelSelect
                    channels={channels}
                    value={evCfg.channelId}
                    onChange={v => setEvent(ev.key, { channelId: v })}
                    placeholder="Use Default"
                  />
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Ignored channels */}
      <div style={{ background: AL.card, border: `1px solid ${AL.border}`, borderRadius: 10, padding: '16px 20px' }}>
        <p style={{ color: AL.text1, margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>Ignored Channels</p>
        <p style={{ color: AL.text2, margin: '0 0 12px', fontSize: 12 }}>Events from these channels won't be logged</p>
        <ALMultiSelect
          items={channels}
          selected={cfg.ignoredChannels}
          onChange={v => setCfg(p => ({ ...p, ignoredChannels: v }))}
          placeholder="No channels ignored"
          prefix="#"
        />
      </div>

      {/* Ignored roles */}
      <div style={{ background: AL.card, border: `1px solid ${AL.border}`, borderRadius: 10, padding: '16px 20px' }}>
        <p style={{ color: AL.text1, margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>Ignored Roles</p>
        <p style={{ color: AL.text2, margin: '0 0 12px', fontSize: 12 }}>Actions by members with these roles won't be logged</p>
        <ALMultiSelect
          items={roles}
          selected={cfg.ignoredRoles}
          onChange={v => setCfg(p => ({ ...p, ignoredRoles: v }))}
          placeholder="No roles ignored"
        />
      </div>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: saving ? AL.borderSub : AL.btnBg,
            color: AL.text1, border: `1px solid ${AL.border}`,
            borderRadius: 8, padding: '9px 28px', fontSize: 14, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = AL.accent }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = AL.btnBg }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ── AutoMod ───────────────────────────────────────────────────────────────────
const AM_RULE_TYPES = [
  { key: 'caps', label: 'All Caps', desc: 'Detects messages that are mostly uppercase.' },
  { key: 'badwords', label: 'Bad Words', desc: 'Detects when a user sends a message containing a certain word or phrase.' },
  { key: 'newlines', label: 'Chat Clearing Newlines', desc: 'Detects messages with excessive line breaks.' },
  { key: 'duplicates', label: 'Duplicate Text', desc: 'Detects when a user sends the same message repeatedly.' },
  { key: 'charcount', label: 'Character Count', desc: 'Detects messages that exceed a character limit.' },
  { key: 'emoji', label: 'Emoji Spam', desc: 'Detects messages with too many emojis.' },
  { key: 'invites', label: 'Invite Links', desc: 'Detects when a user sends an invite link.' },
  { key: 'links', label: 'Links Cooldown', desc: 'Detects when a user sends too many links every x seconds.' },
  { key: 'mentions', label: 'Mass Mention', desc: 'Detects messages with too many user/role mentions.' },
  { key: 'spam', label: 'Message Spam', desc: 'Detects when a user sends too many messages in a short time.' },
  { key: 'zalgo', label: 'Zalgo Text', desc: 'Detects messages with zalgo/corrupted text.' },
]

const AM_ACTIONS = [
  { key: 'warn', label: 'Warn' },
  { key: 'delete', label: 'Delete' },
  { key: 'mute', label: 'Automute' },
  { key: 'ban', label: 'Autoban' },
  { key: 'mute_instant', label: 'Instant Mute' },
  { key: 'kick', label: 'Kick' },
]

const AM_RULE_DEFAULTS = {
  enabled: true, action: 'delete', duration: '', name: '',
  ignored_roles: [], ignored_channels: [],
  threshold: 5, interval: 5, whitelist: [], words: [], type: '',
}

const DEFAULT_AM = { enabled: false, log_channel: null, rules: [] }

function AMTagInput({ values, onChange, placeholder }) {
  const [input, setInput] = React.useState('')
  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '8px 10px', background: '#1e1e24', border: '1px solid #333', borderRadius: 6, minHeight: 40 }}>
      {values.map(v => (
        <span key={v} style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 4, padding: '2px 8px', fontSize: 12, color: '#ddd', display: 'flex', alignItems: 'center', gap: 4 }}>
          {v}
          <button onClick={() => onChange(values.filter(x => x !== v))}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>x</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        placeholder={placeholder}
        style={{ background: 'none', border: 'none', outline: 'none', color: '#ccc', fontSize: 13, minWidth: 120, flex: 1 }} />
    </div>
  )
}

function AMPills({ items, selected, onChange, prefix = '' }) {
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {items.map(item => {
        const on = selected.includes(item.id)
        return (
          <button key={item.id} onClick={() => toggle(item.id)} style={{
            padding: '3px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: on ? '#cc2222' : '#2a2a35', border: `1px solid ${on ? '#cc2222' : '#444'}`,
            color: on ? '#fff' : '#aaa', transition: 'all 0.15s',
          }}>{prefix}{item.name}</button>
        )
      })}
      {items.length === 0 && <span style={{ color: '#555', fontSize: 12 }}>None available</span>}
    </div>
  )
}

// ── Multi-select dropdown (Dyno style) ────────────────────────────────────────
function MultiSelectDropdown({ items, selected, onChange, placeholder = 'Select...', prefix = '' }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const remove = id => onChange(selected.filter(x => x !== id))
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  const selectedItems = items.filter(i => selected.includes(i.id))
  const unselected = items.filter(i => !selected.includes(i.id))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Input box */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4,
          minHeight: 40, padding: '4px 8px', cursor: 'pointer',
          background: '#1e1e24', border: '1px solid #333', borderRadius: 6,
        }}
      >
        {selectedItems.length === 0 && (
          <span style={{ color: '#555', fontSize: 13, padding: '2px 4px' }}>{placeholder}</span>
        )}
        {selectedItems.map(item => (
          <span key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#2a2a35', border: '1px solid #444', borderRadius: 4,
            padding: '2px 6px', fontSize: 12, color: '#ccc',
          }}>
            <button
              onClick={e => { e.stopPropagation(); remove(item.id) }}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center' }}
            >×</button>
            {prefix}{item.name}
          </span>
        ))}
        {/* Right side: clear all + arrow */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
          {selectedItems.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onChange([]) }}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
            >×</button>
          )}
          <span style={{ color: '#666', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#1e1e24', border: '1px solid #333', borderRadius: 6,
          marginTop: 2, maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {unselected.length === 0 && selectedItems.length === 0 && (
            <div style={{ padding: '10px 14px', color: '#555', fontSize: 13 }}>No options available</div>
          )}
          {unselected.map(item => (
            <div key={item.id} onClick={() => toggle(item.id)}
              style={{ padding: '9px 14px', cursor: 'pointer', color: '#ccc', fontSize: 13, transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a2a35'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {prefix}{item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AMSection({ label, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', width: '100%' }}>
        <span style={{ color: '#cc2222', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{open ? '-' : '+'}</span>
        <span style={{ color: '#ddd', fontSize: 14, fontWeight: 600 }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: '#333', marginLeft: 8 }} />
      </button>
      {open && <div style={{ paddingLeft: 4 }}>{children}</div>}
    </div>
  )
}

function RuleModal({ rule, onSave, onClose, channels, roles }) {
  const isEdit = !!(rule && rule.type)
  const [form, setForm] = React.useState(rule || { ...AM_RULE_DEFAULTS })
  const set = patch => setForm(p => ({ ...p, ...patch }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#16161e', border: '1px solid #333', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: '24px 28px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>Rule</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ height: 1, background: '#333', marginBottom: 20 }} />

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#fff', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>Name</label>
          <input value={form.name || ''} onChange={e => set({ name: e.target.value })} placeholder="Rule Name"
            style={{ width: '100%', background: '#1e1e24', border: '1px solid #333', borderRadius: 6, padding: '10px 14px', color: '#ccc', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#fff', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>Rule Type</label>
          <select value={form.type || ''} onChange={e => { const t = e.target.value; set({ type: t, name: form.name || AM_RULE_TYPES.find(r => r.key === t)?.label || '' }) }}
            style={{ width: '100%', background: '#1e1e24', border: '1px solid #333', borderRadius: 6, padding: '10px 14px', color: form.type ? '#ccc' : '#666', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
            <option value="">Select..</option>
            {AM_RULE_TYPES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>

        <AMSection label="Actions" defaultOpen={true}>
          <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '16px', marginBottom: 12 }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Actions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AM_ACTIONS.map(a => {
                const selected = (form.actions || []).includes(a.key)
                return (
                  <button key={a.key} type="button"
                    onClick={() => {
                      const cur = form.actions || []
                      set({ actions: selected ? cur.filter(x => x !== a.key) : [...cur, a.key] })
                    }}
                    style={{
                      padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: selected ? '#cc2222' : '#2a2a35',
                      border: `1px solid ${selected ? '#cc2222' : '#444'}`,
                      color: selected ? '#fff' : '#aaa', transition: 'all 0.15s',
                    }}>
                    {a.label}
                  </button>
                )
              })}
            </div>
            {(form.actions || []).some(a => ['mute', 'mute_instant', 'ban'].includes(a)) && (
              <div style={{ marginTop: 12 }}>
                <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>Duration (e.g. 10m, 1h, 1d — leave blank for permanent)</label>
                <input value={form.duration || ''} onChange={e => set({ duration: e.target.value })} placeholder="e.g. 10m"
                  style={{ background: '#16161e', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', color: '#ccc', fontSize: 13, outline: 'none', width: 140 }} />
              </div>
            )}
          </div>
        </AMSection>

        {form.type && (
          <AMSection label="Additional Options" defaultOpen={true}>
            <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '16px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(form.type === 'spam' || form.type === 'links') && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>{form.type === 'spam' ? 'Max Messages' : 'Max Links'}</label>
                    <input type="number" min={1} value={form.threshold ?? 5} onChange={e => set({ threshold: parseInt(e.target.value) || 1 })}
                      style={{ background: '#16161e', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', color: '#ccc', fontSize: 13, outline: 'none', width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>Interval (seconds)</label>
                    <input type="number" min={1} value={form.interval ?? 5} onChange={e => set({ interval: parseInt(e.target.value) || 1 })}
                      style={{ background: '#16161e', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', color: '#ccc', fontSize: 13, outline: 'none', width: '100%' }} />
                  </div>
                </div>
              )}
              {['caps', 'mentions', 'emoji', 'newlines', 'duplicates', 'charcount'].includes(form.type) && (
                <div>
                  <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    {form.type === 'caps' ? 'Caps % Threshold' : form.type === 'mentions' ? 'Max Mentions' : form.type === 'emoji' ? 'Max Emojis' : form.type === 'newlines' ? 'Max Newlines' : form.type === 'charcount' ? 'Max Characters' : 'Repeat Count'}
                  </label>
                  <input type="number" min={1} value={form.threshold ?? 5} onChange={e => set({ threshold: parseInt(e.target.value) || 1 })}
                    style={{ background: '#16161e', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', color: '#ccc', fontSize: 13, outline: 'none', width: 100 }} />
                </div>
              )}
              {form.type === 'badwords' && (
                <div>
                  <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>Blacklisted Words/Phrases <span style={{ color: '#555' }}>(Enter to add)</span></label>
                  <AMTagInput values={form.words || []} onChange={v => set({ words: v })} placeholder="Add word..." />
                </div>
              )}
              {form.type === 'links' && (
                <div>
                  <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>Whitelisted Domains <span style={{ color: '#555' }}>(Enter to add)</span></label>
                  <AMTagInput values={form.whitelist || []} onChange={v => set({ whitelist: v })} placeholder="e.g. youtube.com" />
                </div>
              )}
            </div>
          </AMSection>
        )}

        <AMSection label="Permissions">
          <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '16px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ color: '#aaa', fontSize: 12, margin: '0 0 8px' }}>Ignored Channels</p>
              <MultiSelectDropdown items={channels} selected={form.ignored_channels || []} onChange={v => set({ ignored_channels: v })} placeholder="Select channels..." prefix="#" />
            </div>
            <div>
              <p style={{ color: '#aaa', fontSize: 12, margin: '0 0 8px' }}>Ignored Roles</p>
              <MultiSelectDropdown items={roles} selected={form.ignored_roles || []} onChange={v => set({ ignored_roles: v })} placeholder="Select roles..." />
            </div>
          </div>
        </AMSection>

        <button onClick={() => { if (form.type && form.name) onSave(form) }} disabled={!form.type || !form.name}
          style={{ background: (!form.type || !form.name) ? '#333' : '#cc2222', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: (!form.type || !form.name) ? 'not-allowed' : 'pointer', marginTop: 8 }}>
          {isEdit ? 'Save Changes' : 'Create Rule'}
        </button>
      </div>
    </div>
  )
}

function AMRuleCard({ rule, onEdit, onDelete, onToggle }) {
  const meta = AM_RULE_TYPES.find(r => r.key === rule.type) || { label: rule.type || 'Unknown', desc: '' }
  return (
    <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 10, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a35'}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>{rule.name || meta.label}</p>
        <button onClick={() => onToggle(rule)} style={{ width: 32, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', flexShrink: 0, background: rule.enabled ? '#00c896' : '#444', position: 'relative', transition: 'background 0.2s' }}>
          <span style={{ position: 'absolute', top: 2, left: rule.enabled ? 15 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>Rule: {meta.label}</p>
      <p style={{ margin: 0, fontSize: 13, color: '#aaa', flex: 1 }}>{meta.desc.length > 60 ? meta.desc.slice(0, 60) + '...' : meta.desc}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button onClick={() => onEdit(rule)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '5px 12px', color: '#cc2222', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          <Settings size={11} /> EDIT
        </button>
        <button onClick={() => onDelete(rule)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '5px 12px', color: '#cc2222', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          <X size={11} /> DELETE
        </button>
      </div>
    </div>
  )
}

function AutoModPanel({ guildId }) {
  const [cfg, setCfg] = React.useState(DEFAULT_AM)
  const [channels, setChannels] = React.useState([])
  const [roles, setRoles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [modal, setModal] = React.useState(null)
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    if (!guildId) return
    Promise.all([
      getAutoMod(guildId).catch(() => ({ data: DEFAULT_AM })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
    ]).then(([am, ch, ro]) => {
      const data = am.data || DEFAULT_AM
      if (!Array.isArray(data.rules)) data.rules = []
      setCfg(data)
      setChannels(ch.data || [])
      setRoles(ro.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  async function save(newCfg) {
    setSaving(true)
    try { await saveAutoMod(guildId, newCfg || cfg); toast.success('AutoMod saved!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  function handleSaveRule(form) {
    const newRules = modal && modal.type
      ? cfg.rules.map(r => r === modal ? form : r)
      : [...(cfg.rules || []), { ...form, id: Date.now() }]
    const newCfg = { ...cfg, rules: newRules }
    setCfg(newCfg); setModal(null); save(newCfg)
  }

  function handleDelete(rule) {
    const newCfg = { ...cfg, rules: cfg.rules.filter(r => r !== rule) }
    setCfg(newCfg); save(newCfg)
  }

  function handleToggle(rule) {
    const newCfg = { ...cfg, rules: cfg.rules.map(r => r === rule ? { ...r, enabled: !r.enabled } : r) }
    setCfg(newCfg); save(newCfg)
  }

  const filtered = (cfg.rules || []).filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
    AM_RULE_TYPES.find(t => t.key === r.type)?.label.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ height: 160, borderRadius: 10, background: '#1e1e24', animation: 'pulse 1.5s infinite' }} />)}
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: '#cc2222' }}>Modules</span> / Automod
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#aaa', fontSize: 14 }}>{cfg.enabled ? 'Disable Module' : 'Enable Module'}</span>
          <button onClick={() => { const n = { ...cfg, enabled: !cfg.enabled }; setCfg(n); save(n) }}
            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: cfg.enabled ? '#00c896' : '#444', position: 'relative', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: 3, left: cfg.enabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setModal('create')}
          style={{ background: '#cc2222', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Create Rule
        </button>
        <button style={{ background: 'none', color: '#cc2222', border: '1px solid #cc2222', borderRadius: 6, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Manage Default Settings
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules"
        style={{ width: '100%', background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '12px 16px', color: '#ccc', fontSize: 14, outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <p style={{ fontSize: 15 }}>No rules yet. Click "Create Rule" to add one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map((rule, i) => (
            <AMRuleCard key={rule.id || i} rule={rule} onEdit={r => setModal(r)} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {modal && (
        <RuleModal rule={modal === 'create' ? null : modal} onSave={handleSaveRule} onClose={() => setModal(null)} channels={channels} roles={roles} />
      )}
    </div>
  )
}


// ── Moderation ────────────────────────────────────────────────────────────────
const MOD = {
  bg: '#16161e',
  card: '#1e1e24',
  border: '#2a2a35',
  text1: '#ffffff',
  text2: '#aaaaaa',
  text3: '#cccccc',
  accent: '#cc2222',
  input: '#1e1e24',
  inputBorder: '#333333',
}

const DEFAULT_MOD_SETTINGS = {
  enabled: true,
  dm_on_action: true,
  use_discord_timeouts: false,
  delete_mod_commands: true,
  respond_with_reason: true,
  remove_roles_on_mute: true,
  preserve_messages_on_ban: false,
  mod_log_channel: null,
  moderator_roles: [],
  protected_roles: [],
  lockdown_channels: [],
  custom_responses: {
    ban: '***{user} was banned***',
    unban: '***{user} was unbanned***',
    softban: '***{user} was softbanned***',
    kick: '***{user} was kicked***',
    mute: '***{user} was muted***',
    unmute: '***{user} was unmuted***',
  },
  autopunish: [],
  appeals: {
    enabled: false,
    allow_banned: true,
    allow_muted: true,
    ban_waiting_days: 0,
    mute_waiting_days: 0,
    dm_on_approval_unban: true,
    dm_on_approval_unmute: true,
    dm_on_rejection: true,
    invite_url: '',
  },
}

function ModCheckbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: 16, height: 16, borderRadius: 3, flexShrink: 0,
          background: checked ? MOD.accent : 'transparent',
          border: `2px solid ${checked ? MOD.accent : '#555'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ color: MOD.text2, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
    </label>
  )
}

function ModToggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: enabled ? '#2ecc71' : '#444',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        boxShadow: enabled ? '0 0 8px #2ecc7155' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: enabled ? 22 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', display: 'block',
      }} />
    </button>
  )
}

function ModCard({ children, style = {} }) {
  return (
    <div style={{
      background: MOD.card, border: `1px solid ${MOD.border}`,
      borderRadius: 8, padding: '20px', ...style,
    }}>
      {children}
    </div>
  )
}

function ModInput({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: MOD.input, border: `1px solid ${MOD.inputBorder}`,
        borderRadius: 6, padding: '8px 12px', color: MOD.text3,
        fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}

function ModSelect({ value, onChange, children, style = {} }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      style={{
        background: MOD.input, border: `1px solid ${MOD.inputBorder}`,
        borderRadius: 6, padding: '8px 12px', color: value ? MOD.text3 : '#666',
        fontSize: 13, outline: 'none', cursor: 'pointer', width: '100%',
        boxSizing: 'border-box', ...style,
      }}
    >
      {children}
    </select>
  )
}

function ModSectionLabel({ children }) {
  return (
    <p style={{ color: MOD.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
      {children}
    </p>
  )
}

// Settings Tab
function ModSettingsTab({ cfg, setCfg, channels, roles, onSave, saving }) {
  const set = patch => setCfg(p => ({ ...p, ...patch }))
  const setAppeals = patch => setCfg(p => ({ ...p, appeals: { ...p.appeals, ...patch } }))
  const setCustomResponse = (key, val) => setCfg(p => ({ ...p, custom_responses: { ...p.custom_responses, [key]: val } }))

  const [localResponses, setLocalResponses] = React.useState(cfg.custom_responses || {})
  React.useEffect(() => { setLocalResponses(cfg.custom_responses || {}) }, [cfg.custom_responses])

  const CHECKBOXES = [
    { key: 'dm_on_action', label: 'DM Users on Kick/Ban/Mute' },
    { key: 'use_discord_timeouts', label: 'Use Discord Timeouts for Mute' },
    { key: 'delete_mod_commands', label: 'Delete Mod Commands After Executed' },
    { key: 'respond_with_reason', label: 'Respond with Reason' },
    { key: 'remove_roles_on_mute', label: 'Remove Roles When Muted' },
    { key: 'preserve_messages_on_ban', label: 'Preserve Messages on Ban' },
  ]

  const RESPONSE_KEYS = [
    { key: 'ban', label: 'Ban Message' },
    { key: 'unban', label: 'Unban Message' },
    { key: 'softban', label: 'Softban Message' },
    { key: 'kick', label: 'Kick Message' },
    { key: 'mute', label: 'Mute Message' },
    { key: 'unmute', label: 'Unmute Message' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Checkboxes row */}
      <ModCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {CHECKBOXES.map(({ key, label }) => (
            <ModCheckbox key={key} checked={!!cfg[key]} onChange={v => set({ [key]: v })} label={label} />
          ))}
        </div>
      </ModCard>

      {/* Mod log channel + Moderator roles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ModCard>
          <ModSectionLabel>Moderation Log Channel</ModSectionLabel>
          <ModSelect value={cfg.mod_log_channel} onChange={v => set({ mod_log_channel: v })}>
            <option value="">Select a channel…</option>
            {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
          </ModSelect>
        </ModCard>
        <ModCard>
          <ModSectionLabel>Moderator Roles</ModSectionLabel>
          <MultiSelectDropdown items={roles} selected={cfg.moderator_roles || []} onChange={v => set({ moderator_roles: v })} placeholder="Select roles..." />
        </ModCard>
      </div>

      {/* Protected roles */}
      <ModCard>
        <ModSectionLabel>Protected Roles</ModSectionLabel>
        <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px' }}>
          Members in protected roles can't be muted, kicked, or banned by moderators.
        </p>
        <MultiSelectDropdown items={roles} selected={cfg.protected_roles || []} onChange={v => set({ protected_roles: v })} placeholder="Select roles..." />
      </ModCard>

      {/* Lockdown channels */}
      <ModCard>
        <ModSectionLabel>Lockdown Channels</ModSectionLabel>
        <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px' }}>
          Select the channels to lock when using the lockdown command.
        </p>
        <MultiSelectDropdown items={channels} selected={cfg.lockdown_channels || []} onChange={v => set({ lockdown_channels: v })} placeholder="Select channels..." prefix="#" />
      </ModCard>

      {/* Custom responses */}
      <ModCard>
        <ModSectionLabel>Custom Responses</ModSectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {RESPONSE_KEYS.map(({ key, label }) => (
            <div key={key}>
              <p style={{ color: MOD.text2, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <ModInput
                  value={localResponses[key] || ''}
                  onChange={v => setLocalResponses(p => ({ ...p, [key]: v }))}
                  placeholder={`{user} message…`}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => setCustomResponse(key, localResponses[key] || '')}
                  style={{
                    background: MOD.accent, color: '#fff', border: 'none',
                    borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </ModCard>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            background: saving ? '#333' : MOD.accent,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 32px', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#aa1a1a' }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = MOD.accent }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// Autopunish Tab
function ModAutopunishTab({ cfg, setCfg, onSave, saving }) {
  const [warnCount, setWarnCount] = React.useState(3)
  const [action, setAction] = React.useState('mute')
  const [duration, setDuration] = React.useState(60)

  function addRule() {
    const rule = { warnings: Number(warnCount), action, duration: Number(duration) }
    const existing = (cfg.autopunish || []).find(r => r.warnings === rule.warnings)
    if (existing) { toast.error(`Rule for ${rule.warnings} warnings already exists`); return }
    const newCfg = { ...cfg, autopunish: [...(cfg.autopunish || []), rule].sort((a, b) => a.warnings - b.warnings) }
    setCfg(newCfg)
  }

  function removeRule(idx) {
    const newCfg = { ...cfg, autopunish: cfg.autopunish.filter((_, i) => i !== idx) }
    setCfg(newCfg)
  }

  const inputStyle = {
    background: MOD.input, border: `1px solid ${MOD.inputBorder}`,
    borderRadius: 6, padding: '8px 10px', color: MOD.text3,
    fontSize: 13, outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ModCard>
        <ModSectionLabel>Autopunish</ModSectionLabel>
        <p style={{ color: '#666', fontSize: 12, margin: '0 0 16px' }}>
          Bot will moderate members if they ever reach a specific number of warnings (through ?warn).
          Note: 0 minutes makes the duration permanent.
        </p>

        {/* Add rule row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ color: MOD.text2, fontSize: 13 }}>When member reaches:</span>
          <input
            type="number" min={1} value={warnCount}
            onChange={e => setWarnCount(e.target.value)}
            style={{ ...inputStyle, width: 60, textAlign: 'center' }}
          />
          <span style={{ color: MOD.text2, fontSize: 13 }}>warnings,</span>
          <select value={action} onChange={e => setAction(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="mute">Mute</option>
            <option value="kick">Kick</option>
            <option value="ban">Ban</option>
          </select>
          <span style={{ color: MOD.text2, fontSize: 13 }}>for</span>
          <input
            type="number" min={0} value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{ ...inputStyle, width: 70, textAlign: 'center' }}
          />
          <span style={{ color: MOD.text2, fontSize: 13 }}>minutes.</span>
          <button
            onClick={addRule}
            style={{
              background: MOD.accent, color: '#fff', border: 'none',
              borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>

        {/* Rules table */}
        {(cfg.autopunish || []).length === 0 ? (
          <p style={{ color: '#555', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No autopunish rules yet.</p>
        ) : (
          <div style={{ border: `1px solid ${MOD.border}`, borderRadius: 6, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a35' }}>
                  {['Warning #', 'Moderation', 'Duration', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: MOD.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(cfg.autopunish || []).map((rule, idx) => (
                  <tr key={idx} style={{ borderTop: `1px solid ${MOD.border}` }}>
                    <td style={{ padding: '10px 14px', color: MOD.text3, fontSize: 13 }}>{rule.warnings}</td>
                    <td style={{ padding: '10px 14px', color: MOD.text3, fontSize: 13, textTransform: 'capitalize' }}>{rule.action}</td>
                    <td style={{ padding: '10px 14px', color: MOD.text3, fontSize: 13 }}>
                      {rule.duration === 0 ? 'Permanent' : `${rule.duration} min`}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        onClick={() => removeRule(idx)}
                        style={{ background: 'none', border: 'none', color: '#cc4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModCard>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            background: saving ? '#333' : MOD.accent,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 32px', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// Appeals Tab
function ModAppealsTab({ cfg, setCfg, onSave, saving }) {
  const setAppeals = patch => setCfg(p => ({ ...p, appeals: { ...p.appeals, ...patch } }))
  const ap = cfg.appeals || {}
  const [localBanDays, setLocalBanDays] = React.useState(String(ap.ban_waiting_days ?? 0))
  const [localMuteDays, setLocalMuteDays] = React.useState(String(ap.mute_waiting_days ?? 0))
  const [localInvite, setLocalInvite] = React.useState(ap.invite_url || '')

  React.useEffect(() => {
    setLocalBanDays(String(ap.ban_waiting_days ?? 0))
    setLocalMuteDays(String(ap.mute_waiting_days ?? 0))
    setLocalInvite(ap.invite_url || '')
  }, [cfg.appeals])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Appeal form + Allow appeals for */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ModCard>
          <ModSectionLabel>Appeal Form</ModSectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#555', fontSize: 13 }}>
            Coming soon
          </div>
        </ModCard>
        <ModCard>
          <ModSectionLabel>Allow Appeals For</ModSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ModCheckbox checked={!!ap.allow_banned} onChange={v => setAppeals({ allow_banned: v })} label="Banned Users" />
            <ModCheckbox checked={!!ap.allow_muted} onChange={v => setAppeals({ allow_muted: v })} label="Muted Members" />
          </div>
        </ModCard>
      </div>

      {/* Waiting period + DM user on */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ModCard>
          <ModSectionLabel>Waiting Period (Days)</ModSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ color: MOD.text2, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Ban Waiting Period</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <ModInput value={localBanDays} onChange={setLocalBanDays} placeholder="0" style={{ width: 80 }} />
                <button
                  onClick={() => setAppeals({ ban_waiting_days: Number(localBanDays) || 0 })}
                  style={{ background: MOD.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >Update</button>
              </div>
            </div>
            <div>
              <p style={{ color: MOD.text2, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Mute Waiting Period</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <ModInput value={localMuteDays} onChange={setLocalMuteDays} placeholder="0" style={{ width: 80 }} />
                <button
                  onClick={() => setAppeals({ mute_waiting_days: Number(localMuteDays) || 0 })}
                  style={{ background: MOD.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >Update</button>
              </div>
            </div>
          </div>
        </ModCard>
        <ModCard>
          <ModSectionLabel>DM User On</ModSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ModCheckbox checked={!!ap.dm_on_approval_unban} onChange={v => setAppeals({ dm_on_approval_unban: v })} label="Approval (Unban)" />
            <ModCheckbox checked={!!ap.dm_on_approval_unmute} onChange={v => setAppeals({ dm_on_approval_unmute: v })} label="Approval (Unmute)" />
            <ModCheckbox checked={!!ap.dm_on_rejection} onChange={v => setAppeals({ dm_on_rejection: v })} label="Rejection" />
          </div>
          <p style={{ color: '#555', fontSize: 11, margin: '12px 0 0' }}>
            Bot will DM the user when their appeal is approved or rejected.
          </p>
        </ModCard>
      </div>

      {/* Invite URL */}
      <ModCard>
        <ModSectionLabel>Invite URL</ModSectionLabel>
        <p style={{ color: '#666', fontSize: 12, margin: '0 0 10px' }}>
          Invite link sent to banned/muted users so they can submit an appeal.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <ModInput value={localInvite} onChange={setLocalInvite} placeholder="https://discord.gg/…" style={{ flex: 1 }} />
          <button
            onClick={() => setAppeals({ invite_url: localInvite })}
            style={{ background: MOD.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >Update</button>
        </div>
      </ModCard>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            background: saving ? '#333' : MOD.accent,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 32px', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function ModerationPanel({ guildId }) {
  const [cfg, setCfg] = React.useState(DEFAULT_MOD_SETTINGS)
  const [channels, setChannels] = React.useState([])
  const [roles, setRoles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [tab, setTab] = React.useState('settings')

  React.useEffect(() => {
    if (!guildId) return
    Promise.all([
      getModerationSettings(guildId).catch(() => ({ data: DEFAULT_MOD_SETTINGS })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
    ]).then(([ms, ch, ro]) => {
      const data = ms.data || DEFAULT_MOD_SETTINGS
      setCfg({
        ...DEFAULT_MOD_SETTINGS,
        ...data,
        custom_responses: { ...DEFAULT_MOD_SETTINGS.custom_responses, ...(data.custom_responses || {}) },
        appeals: { ...DEFAULT_MOD_SETTINGS.appeals, ...(data.appeals || {}) },
      })
      setChannels(ch.data || [])
      setRoles(ro.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  async function save() {
    setSaving(true)
    try {
      await saveModerationSettings(guildId, cfg)
      toast.success('Moderation settings saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'settings', label: 'Settings' },
    { id: 'autopunish', label: 'Autopunish' },
    { id: 'appeals', label: 'Appeals' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 60, borderRadius: 8, background: MOD.card, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: MOD.accent }}>Modules</span> / Moderation
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: MOD.text2, fontSize: 14 }}>{cfg.enabled ? 'Disable Module' : 'Enable Module'}</span>
          <ModToggle enabled={cfg.enabled} onChange={v => setCfg(p => ({ ...p, enabled: v }))} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              background: tab === t.id ? MOD.accent : 'transparent',
              border: `1px solid ${tab === t.id ? MOD.accent : '#444'}`,
              color: tab === t.id ? '#fff' : MOD.text2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'settings' && (
        <ModSettingsTab cfg={cfg} setCfg={setCfg} channels={channels} roles={roles} onSave={save} saving={saving} />
      )}
      {tab === 'autopunish' && (
        <ModAutopunishTab cfg={cfg} setCfg={setCfg} onSave={save} saving={saving} />
      )}
      {tab === 'appeals' && (
        <ModAppealsTab cfg={cfg} setCfg={setCfg} onSave={save} saving={saving} />
      )}
    </div>
  )
}


// ── Welcomer ──────────────────────────────────────────────────────────────────
const MSG_TYPES = [
  { id: 'message', label: 'MESSAGE', desc: 'Plain text only' },
  { id: 'embed', label: 'EMBED', desc: 'Rich embed' },
  { id: 'embed_and_text', label: 'EMBED + TEXT', desc: 'Text above embed' },
  { id: 'v2embed', label: 'V2 EMBED', desc: 'V2 component with avatar thumbnail' },
  { id: 'v2_full', label: 'V2 FULL', desc: 'Text + V2 section + image/gif (like screenshot)' },
  { id: 'custom_image', label: 'CUSTOM IMAGE', desc: 'Text + image/gif with position control' },
]

const WELCOMER_VARS = [
  ['{user}', 'The mention of the user. Eg: Hello {user}!'],
  ['{username}', 'The username of the user. Eg: Hello {username}!'],
  ['{avatar}', 'The avatar URL — used as thumbnail in embed/v2embed (do not put in message text)'],
  ['{server}', 'The server name.'],
  ['{member_count}', 'Total member count.'],
  ['{&role}', 'Mention a role by name. Eg: {&Gamers}'],
  ['{#channel}', 'Link a channel by name. Eg: {#general}'],
  ['{everyone}', '@everyone'],
  ['{here}', '@here'],
  ['{emoji}', 'First saved welcome emoji. Add more to get {emoji1}, {emoji2}, etc.'],
  ['{emoji1}', 'Second saved welcome emoji (if added).'],
  ['{emoji2}', 'Third saved welcome emoji (if added). Pattern continues for more.'],
]

const DEFAULT_WELCOMER = {
  enabled: false, channel_id: null, send_dm: false,
  message_type: 'message',
  message: 'Welcome to **{server}**, {user}! 🎉',
  embed: { title: 'Welcome!', description: 'Welcome to **{server}**, {user}!', color: '#cc2222', thumbnail: '{avatar}', footer: 'Member #{member_count}' },
  embed_text: '',
  custom_image_url: '',
  image_position: 'below',
  v2_header_text: 'Welcome {user}!!',
  v2_body_text: 'Hey **{username}**, Welcome to **{server}**\nHappy chatting & enjoy!',
  v2_footer_text: '{server} now has {member_count} members.',
  v2_image_url: '',
  emojis: [],
}

function WelcomerPanel({ guildId }) {
  const [cfg, setCfg] = React.useState(DEFAULT_WELCOMER)
  const [channels, setChannels] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [emojiInput, setEmojiInput] = React.useState('')

  React.useEffect(() => {
    if (!guildId) return
    Promise.all([
      getWelcomer(guildId).catch(() => ({ data: DEFAULT_WELCOMER })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
    ]).then(([w, ch]) => {
      const data = w.data || DEFAULT_WELCOMER
      setCfg({ ...DEFAULT_WELCOMER, ...data, embed: { ...DEFAULT_WELCOMER.embed, ...(data.embed || {}) }, emojis: Array.isArray(data.emojis) ? data.emojis : [] })
      setChannels(ch.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  const set = patch => setCfg(p => ({ ...p, ...patch }))
  const setEmbed = patch => setCfg(p => ({ ...p, embed: { ...p.embed, ...patch } }))

  async function save() {
    setSaving(true)
    try { await saveWelcomer(guildId, cfg); toast.success('Welcomer saved!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const S = { bg: '#16161e', card: '#1e1e24', border: '#2a2a35', text1: '#fff', text2: '#aaa', text3: '#ccc', accent: '#cc2222' }
  const inp = { background: S.card, border: `1px solid #333`, borderRadius: 6, padding: '9px 12px', color: S.text3, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(4)].map((_, i) => <div key={i} style={{ height: 60, borderRadius: 8, background: S.card }} />)}</div>

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: S.text1, margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: S.accent }}>Modules</span> / Welcome
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: S.text2, fontSize: 14 }}>{cfg.enabled ? 'Disable Module' : 'Enable Module'}</span>
          <button onClick={() => set({ enabled: !cfg.enabled })}
            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: cfg.enabled ? '#00c896' : '#444', position: 'relative', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: 3, left: cfg.enabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Top row: Message Type + Channel Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Message Type */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20 }}>
          <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Message Type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MSG_TYPES.map(t => (
              <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <span onClick={() => set({ message_type: t.id })} style={{
                  width: 16, height: 16, borderRadius: '50%', border: `2px solid ${cfg.message_type === t.id ? S.accent : '#555'}`,
                  background: cfg.message_type === t.id ? S.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                }}>
                  {cfg.message_type === t.id && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </span>
                <span style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Channel Options */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20 }}>
          <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Channel Options</p>
          <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Welcome Channel</p>
          <select value={cfg.channel_id || ''} onChange={e => set({ channel_id: e.target.value || null })}
            style={{ width: '100%', background: '#1e1e24', border: '1px solid #333', borderRadius: 6, padding: '9px 12px', color: cfg.channel_id ? '#ccc' : '#555', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="">Select a channel...</option>
            {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 14 }}>
            <span onClick={() => set({ send_dm: !cfg.send_dm })} style={{
              width: 14, height: 14, borderRadius: 3, border: `2px solid ${cfg.send_dm ? S.accent : '#555'}`,
              background: cfg.send_dm ? S.accent : 'transparent', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cfg.send_dm && <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
            </span>
            <span style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Send Welcome Message in a DM (Private Message)</span>
          </label>
        </div>
      </div>

      {/* Message editor */}
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20, marginBottom: 14 }}>
        {(cfg.message_type === 'message' || cfg.message_type === 'v2embed') && (
          <>
            <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Message</p>
            <textarea value={cfg.message} onChange={e => set({ message: e.target.value })} rows={4}
              style={{ ...inp, resize: 'vertical', fontFamily: 'monospace' }} />
          </>
        )}

        {cfg.message_type === 'v2_full' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Header Text <span style={{ color: '#555', fontWeight: 400, textTransform: 'none' }}>(plain text above the card)</span></p>
              <input value={cfg.v2_header_text || ''} onChange={e => set({ v2_header_text: e.target.value })}
                placeholder="Welcome {user}!!" style={inp} />
            </div>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Body Text <span style={{ color: '#555', fontWeight: 400, textTransform: 'none' }}>(inside V2 card, avatar thumbnail on right)</span></p>
              <textarea value={cfg.v2_body_text || ''} onChange={e => set({ v2_body_text: e.target.value })} rows={3}
                style={{ ...inp, resize: 'vertical', fontFamily: 'monospace' }}
                placeholder={'Hey **{username}**, Welcome to **{server}**\nHappy chatting & enjoy!'} />
            </div>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Footer Text <span style={{ color: '#555', fontWeight: 400, textTransform: 'none' }}>(small text below body)</span></p>
              <input value={cfg.v2_footer_text || ''} onChange={e => set({ v2_footer_text: e.target.value })}
                placeholder="{server} now has {member_count} members." style={inp} />
            </div>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Image / GIF URL <span style={{ color: '#555', fontWeight: 400, textTransform: 'none' }}>(shown below the card — leave blank to hide)</span></p>
              <input value={cfg.v2_image_url || ''} onChange={e => set({ v2_image_url: e.target.value })}
                placeholder="https://example.com/welcome.gif" style={inp} />
            </div>
            {cfg.v2_image_url && (
              <img src={cfg.v2_image_url} alt="preview"
                style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 6, border: '1px solid #333' }}
                onError={e => e.target.style.display = 'none'} />
            )}
          </div>
        )}

        {cfg.message_type === 'custom_image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Message Text</p>
              <textarea value={cfg.message} onChange={e => set({ message: e.target.value })} rows={3}
                style={{ ...inp, resize: 'vertical', fontFamily: 'monospace' }} />
            </div>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Image / GIF URL</p>
              <input value={cfg.custom_image_url || ''} onChange={e => set({ custom_image_url: e.target.value })}
                placeholder="https://example.com/welcome-banner.gif"
                style={inp} />
              <p style={{ color: S.text2, fontSize: 11, margin: '4px 0 0' }}>Supports images and GIFs. Use {'{avatar}'} for the member's avatar.</p>
            </div>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Image Position</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['above', 'Above Text'], ['below', 'Below Text'], ['embed_image', 'Inside Embed']].map(([val, label]) => (
                  <button key={val} onClick={() => set({ image_position: val })}
                    style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: (cfg.image_position || 'below') === val ? S.accent : '#2a2a35',
                      border: `1px solid ${(cfg.image_position || 'below') === val ? S.accent : '#444'}`,
                      color: (cfg.image_position || 'below') === val ? '#fff' : '#aaa',
                    }}>{label}</button>
                ))}
              </div>
            </div>
            {cfg.custom_image_url && (
              <div>
                <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Preview</p>
                <img src={cfg.custom_image_url.replace('{avatar}', 'https://cdn.discordapp.com/embed/avatars/0.png')}
                  alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, border: '1px solid #333' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
        )}

        {(cfg.message_type === 'embed' || cfg.message_type === 'embed_and_text') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cfg.message_type === 'embed_and_text' && (
              <div>
                <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Text (above embed)</p>
                <input value={cfg.embed_text} onChange={e => set({ embed_text: e.target.value })} style={inp} placeholder="Text above the embed..." />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Title</p>
                <input value={cfg.embed.title} onChange={e => setEmbed({ title: e.target.value })} style={inp} placeholder="Welcome!" />
              </div>
              <div>
                <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Color</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={cfg.embed.color || '#cc2222'} onChange={e => setEmbed({ color: e.target.value })}
                    style={{ width: 40, height: 36, border: '1px solid #333', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 2 }} />
                  <input value={cfg.embed.color} onChange={e => setEmbed({ color: e.target.value })} style={{ ...inp, width: 'auto', flex: 1 }} placeholder="#cc2222" />
                </div>
              </div>
            </div>
            <div>
              <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Description</p>
              <textarea value={cfg.embed.description} onChange={e => setEmbed({ description: e.target.value })} rows={3}
                style={{ ...inp, resize: 'vertical', fontFamily: 'monospace' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Thumbnail URL</p>
                <input value={cfg.embed.thumbnail} onChange={e => setEmbed({ thumbnail: e.target.value })} style={inp} placeholder="{avatar}" />
              </div>
              <div>
                <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Footer</p>
                <input value={cfg.embed.footer} onChange={e => setEmbed({ footer: e.target.value })} style={inp} placeholder="Member #{member_count}" />
              </div>
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving}
          style={{ marginTop: 16, background: saving ? '#333' : S.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Update'}
        </button>
      </div>

      {/* ── Emoji Card ─────────────────────────────────────────────────────── */}
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20, marginBottom: 14 }}>
        <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Welcome Emojis <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', fontSize: 12 }}>({(cfg.emojis || []).length}/5 max)</span>
        </p>
        <p style={{ color: S.text2, fontSize: 12, margin: '0 0 14px' }}>
          Add Unicode or Discord custom emojis. Each gets its own variable: <code style={{ color: S.accent }}>{'{' + 'emoji}'}</code> for the 1st, <code style={{ color: S.accent }}>{'{' + 'emoji1}'}</code> for the 2nd, <code style={{ color: S.accent }}>{'{' + 'emoji2}'}</code> for the 3rd, and so on. Use them individually in your welcome message.
        </p>

        {/* Current emojis */}
        {(cfg.emojis || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {(cfg.emojis || []).map((em, i) => {
              const varName = i === 0 ? '{emoji}' : `{emoji${i}}`
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#2a2a35', border: '1px solid #3a3a45',
                  borderRadius: 20, padding: '4px 10px 4px 12px',
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{em}</span>
                  <code style={{ color: S.accent, fontSize: 11, fontWeight: 700 }}>{varName}</code>
                  <button
                    onClick={() => set({ emojis: (cfg.emojis || []).filter((_, j) => j !== i) })}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center' }}
                    title="Remove emoji"
                  >✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Add emoji input */}
        {(cfg.emojis || []).length < 5 ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={emojiInput}
              onChange={e => setEmojiInput(e.target.value)}
              onKeyDown={e => {
                if (e.key !== 'Enter') return
                const raw = emojiInput.trim()
                if (!raw) return
                const isCustom = /^<a?:[a-zA-Z0-9_]+:\d+>$/.test(raw)
                const isUnicode = raw.length > 0 && !/^[\x00-\x7F]+$/.test(raw)
                if (!isCustom && !isUnicode) return
                if ((cfg.emojis || []).includes(raw)) return
                set({ emojis: [...(cfg.emojis || []), raw] })
                setEmojiInput('')
              }}
              placeholder="Paste emoji here… e.g. 🎉 or <a:wave:123456>"
              style={{ ...inp, flex: 1, fontSize: 15 }}
            />
            <button
              onClick={() => {
                const raw = emojiInput.trim()
                if (!raw) return
                const isCustom = /^<a?:[a-zA-Z0-9_]+:\d+>$/.test(raw)
                const isUnicode = raw.length > 0 && !/^[\x00-\x7F]+$/.test(raw)
                if (!isCustom && !isUnicode) return
                if ((cfg.emojis || []).includes(raw)) return
                set({ emojis: [...(cfg.emojis || []), raw] })
                setEmojiInput('')
              }}
              style={{ background: S.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >+ Add</button>
          </div>
        ) : (
          <p style={{ color: '#666', fontSize: 12, margin: 0 }}>Max 5 emojis reached. Remove one to add another.</p>
        )}

        {(cfg.emojis || []).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <button
              onClick={() => set({ emojis: [] })}
              style={{ background: 'none', border: '1px solid #444', borderRadius: 6, padding: '5px 14px', fontSize: 12, color: '#888', cursor: 'pointer' }}
            >Clear all</button>
            <span style={{ color: '#666', fontSize: 11 }}>⚠️ Removing an emoji shifts variable names — update your message if needed.</span>
          </div>
        )}
      </div>

      {/* Variables reference */}
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20 }}>
        <p style={{ color: S.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Variables</p>
        <p style={{ color: S.text2, fontSize: 13, margin: '0 0 12px' }}>You can use these variables in the message boxes above.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {WELCOMER_VARS.map(([v, desc]) => (
            <div key={v} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <code style={{ color: S.accent, fontSize: 13, fontWeight: 700, minWidth: 120, flexShrink: 0 }}>{v}</code>
              <span style={{ color: S.text2, fontSize: 13 }}>- {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Custom Commands ───────────────────────────────────────────────────────────
const CC_VARS = [
  // Basic
  ['{user}', 'Mention the user. Eg: Hello {user}!'],
  ['{username}', 'Username. Eg: Hello {username}!'],
  ['{avatar}', 'User avatar URL'],
  ['{server}', 'Server name'],
  ['{channel}', 'Current channel mention'],
  ['{prefix}', 'Server command prefix'],
  ['{everyone}', '@everyone'],
  ['{here}', '@here'],
  // User
  ['{user.id}', "User's ID"],
  ['{user.name}', "Username#discriminator"],
  ['{user.username}', "Username"],
  ['{user.discrim}', "Discriminator"],
  ['{user.nick}', "Nickname"],
  ['{user.avatar}', "Avatar URL"],
  ['{user.mention}', "Mention"],
  ['{user.createdAt}', "Account creation date"],
  ['{user.joinedAt}', "Server join date"],
  // Server
  ['{server.id}', "Server ID"],
  ['{server.name}', "Server name"],
  ['{server.icon}', "Server icon URL"],
  ['{server.memberCount}', "Member count"],
  ['{server.ownerID}', "Owner ID"],
  ['{server.createdAt}', "Server creation date"],
  // Channel
  ['{channel.id}', "Channel ID"],
  ['{channel.name}', "Channel name"],
  ['{channel.mention}', "Channel mention"],
  // Time
  ['{time}', "Current 24h time (UTC)"],
  ['{time12}', "Current 12h time"],
  ['{date}', "Current date"],
  ['{datetime}', "Date + 24h time"],
  ['{datetime12}', "Date + 12h time"],
  // Args
  ['$1, $2, ...', "Command argument by position. Eg: ?cmd hello → $1 = hello"],
  ['$1+', "All arguments from position N onwards"],
  // Advanced
  ['{delete}', "Delete the trigger message"],
  ['{silent}', "Send no response"],
  ['{noeveryone}', "Disable @everyone/@here pings in response"],
  ['{dm}', "DM the response to the invoking user"],
  ['{dm:username}', "DM the response to a specific user"],
  ['{respond:#channel}', "Send response in a specific channel"],
  ['{choose:a;b;c}', "Pick a random option. Use {choice} as placeholder"],
  ['{choice}', "Output of {choose:...}"],
  ['{require:Role}', "Require a role to use the command"],
  ['{require:serverMod}', "Require manage_messages permission"],
  ['{require:#channel}', "Require command to be used in a specific channel"],
  ['{not:Role}', "Block a role from using the command"],
  ['{not:#channel}', "Block command in a specific channel"],
  ['{&RoleName}', "Mention a role by name"],
  ['{#channel-name}', "Link a channel by name"],
  ['<:name:id>', "Custom emoji. Eg: <:ghost:123456789>"],
  ['<a:name:id>', "Animated emoji. Eg: <a:verify_red_tick:1472122073685037187>"],
  ['$1.user.name', "Property of the 1st mentioned user. Eg: $1.user.id, $1.user.nick"],
]

const CC_DEFAULT = {
  trigger: '', response: '', enabled: true, delete_trigger: false, dm_response: false,
  cooldown: 0, allowed_roles: [], ignored_roles: [], ignored_channels: [],
  embed: { title: '', description: '', color: '#cc2222', footer: '', thumbnail: '' },
}

function CCModal({ cmd, onSave, onClose, channels, roles }) {
  const isEdit = !!cmd?.trigger
  const [form, setForm] = React.useState({
    ...CC_DEFAULT, embed: { ...CC_DEFAULT.embed },
    name: '', description: '', silent: false, noeveryone: true,
    ...(cmd || {}),
    embed: { ...CC_DEFAULT.embed, ...(cmd?.embed || {}) }
  })
  const [showEmbed, setShowEmbed] = React.useState(!!(cmd?.embed?.description))
  const [openSections, setOpenSections] = React.useState({ options: true, permissions: false, advanced: false })
  const set = p => setForm(f => ({ ...f, ...p }))
  const setEmb = p => setForm(f => ({ ...f, embed: { ...f.embed, ...p } }))
  const toggleSection = k => setOpenSections(p => ({ ...p, [k]: !p[k] }))
  const inp = { background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 6, padding: '10px 14px', color: '#ccc', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }

  function CCCheck({ field, label }) {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 6, padding: '10px 14px', flex: 1 }}>
        <span onClick={() => set({ [field]: !form[field] })} style={{
          width: 16, height: 16, borderRadius: 3, border: `2px solid ${form[field] ? '#cc2222' : '#555'}`,
          background: form[field] ? '#cc2222' : 'transparent', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {form[field] && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
        </span>
        <span style={{ color: '#ccc', fontSize: 13 }}>{label}</span>
      </label>
    )
  }

  function SectionHeader({ id, label }) {
    return (
      <button onClick={() => toggleSection(id)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', width: '100%' }}>
        <span style={{ color: openSections[id] ? '#cc2222' : '#cc2222', fontSize: 16, lineHeight: 1 }}>{openSections[id] ? '⊖' : '⊕'}</span>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: '#2a2a35', marginLeft: 8 }} />
      </button>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#16161e', border: '1px solid #2a2a35', borderRadius: 12, width: '100%', maxWidth: 660, maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>{isEdit ? 'Edit Command' : 'Add Command'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ height: 1, background: '#2a2a35', marginBottom: 20 }} />

        {/* Name */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#fff', fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>
            Name{form.trigger ? ` - ${form.trigger.length} Characters` : ''}
          </label>
          <input value={form.trigger} onChange={e => set({ trigger: e.target.value.replace(/\s/g, '').toLowerCase(), name: e.target.value.replace(/\s/g, '').toLowerCase() })}
            disabled={isEdit} placeholder="commandname"
            style={{ ...inp, opacity: isEdit ? 0.7 : 1 }} />
          {isEdit && (
            <button style={{ marginTop: 8, background: '#cc2222', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Rename
            </button>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#fff', fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>Description</label>
          <input value={form.description || ''} onChange={e => set({ description: e.target.value })}
            placeholder="Describe what this command does..." style={inp} />
        </div>

        {/* Command (response) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#fff', fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>Command</label>
          <textarea value={form.response} onChange={e => set({ response: e.target.value })} rows={5}
            placeholder={'Hello {user}!\nTip: Use {delete} to delete trigger, {silent} for no response, <a:emoji:id> for animated emojis'}
            style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
        </div>

        {/* Embed preview if set */}
        {showEmbed && form.embed?.description && (
          <div style={{ borderLeft: '4px solid #cc2222', background: '#1e1e24', borderRadius: '0 6px 6px 0', padding: '10px 14px', marginBottom: 12, fontFamily: 'monospace', fontSize: 13, color: '#ccc' }}>
            {form.embed.description}
          </div>
        )}

        {/* Add/Edit Embed + Remove */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
          <button onClick={() => setShowEmbed(v => !v)}
            style={{ background: 'none', border: 'none', color: '#cc2222', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>⊕</span> {showEmbed ? 'Edit Embed' : 'Add/Edit Embed'}
          </button>
          {showEmbed && (
            <button onClick={() => { setShowEmbed(false); setEmb({ title: '', description: '', footer: '', thumbnail: '' }) }}
              style={{ background: 'none', border: 'none', color: '#cc2222', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16 }}>⊖</span> Remove Embed
            </button>
          )}
        </div>

        {/* Embed editor */}
        {showEmbed && (
          <div style={{ background: '#1a1a22', border: '1px solid #2a2a35', borderRadius: 8, padding: 16, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Title</label>
                <input value={form.embed.title || ''} onChange={e => setEmb({ title: e.target.value })} style={inp} placeholder="Optional title" />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Color</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="color" value={form.embed.color || '#cc2222'} onChange={e => setEmb({ color: e.target.value })}
                    style={{ width: 38, height: 38, border: '1px solid #333', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 2 }} />
                  <input value={form.embed.color || ''} onChange={e => setEmb({ color: e.target.value })} style={{ ...inp, flex: 1 }} />
                </div>
              </div>
            </div>
            <div>
              <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description *</label>
              <textarea value={form.embed.description || ''} onChange={e => setEmb({ description: e.target.value })} rows={3}
                style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} placeholder="Embed body text..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Footer</label>
                <input value={form.embed.footer || ''} onChange={e => setEmb({ footer: e.target.value })} style={inp} placeholder="Footer text" />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Thumbnail</label>
                <input value={form.embed.thumbnail || ''} onChange={e => setEmb({ thumbnail: e.target.value })} style={inp} placeholder="{avatar} or URL" />
              </div>
            </div>
          </div>
        )}

        {/* Options section */}
        <SectionHeader id="options" label="Options" />
        {openSections.options && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <CCCheck field="delete_trigger" label="Delete Command" />
              <CCCheck field="silent" label="Silent Command" />
              <CCCheck field="dm_response" label="DM Response" />
            </div>
            <CCCheck field="noeveryone" label="Disable @everyone, @here and role pings" />
          </div>
        )}

        {/* Permissions section */}
        <SectionHeader id="permissions" label="Permissions (optional)" />
        {openSections.permissions && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[['allowed_roles', 'Allowed Roles', roles, ''], ['ignored_roles', 'Ignored Roles', roles, ''], ['ignored_channels', 'Ignored Channels', channels, '#']].map(([k, l, items, pfx]) => (
              <div key={k}>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{l}</label>
                <MultiSelectDropdown items={items} selected={form[k] || []} onChange={v => set({ [k]: v })} placeholder="None" prefix={pfx} />
              </div>
            ))}
          </div>
        )}

        {/* Advanced Options */}
        <SectionHeader id="advanced" label="Advanced Options (optional)" />
        {openSections.advanced && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ color: '#aaa', fontSize: 13 }}>Cooldown (seconds)</label>
            <input type="number" min={0} value={form.cooldown || 0} onChange={e => set({ cooldown: parseInt(e.target.value) || 0 })}
              style={{ ...inp, width: 80 }} />
          </div>
        )}

        <div style={{ height: 1, background: '#2a2a35', margin: '16px 0' }} />

        {/* Save button */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { if (form.trigger) onSave(form) }} disabled={!form.trigger}
            style={{ background: form.trigger ? '#cc2222' : '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: form.trigger ? 'pointer' : 'not-allowed' }}>
            {isEdit ? 'Save Command' : 'Save Command'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CustomCommandsPanel({ guildId }) {
  const [cmds, setCmds] = React.useState([])
  const [channels, setChannels] = React.useState([])
  const [roles, setRoles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [modal, setModal] = React.useState(null)  // null | 'add' | cmd object
  const [search, setSearch] = React.useState('')

  const load = React.useCallback(() => {
    if (!guildId) return
    Promise.all([
      getCustomCommands(guildId).catch(() => ({ data: [] })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
    ]).then(([cc, ch, ro]) => {
      setCmds(cc.data || [])
      setChannels(ch.data || [])
      setRoles(ro.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  React.useEffect(() => { load() }, [load])

  async function handleSave(form) {
    try {
      await createCustomCommand(guildId, form)
      toast.success(modal?.trigger ? 'Command updated!' : 'Command added!')
      setModal(null)
      load()
    } catch { toast.error('Failed to save') }
  }

  async function handleDelete(trigger) {
    try {
      await deleteCustomCommand(guildId, trigger)
      setCmds(p => p.filter(c => c.trigger !== trigger))
      toast.success('Command deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function handleToggle(cmd) {
    try {
      await toggleCustomCommand(guildId, cmd.trigger, !cmd.enabled)
      setCmds(p => p.map(c => c.trigger === cmd.trigger ? { ...c, enabled: !c.enabled } : c))
    } catch { toast.error('Failed to toggle') }
  }

  const filtered = cmds.filter(c =>
    !search || c.trigger.includes(search.toLowerCase()) || c.response.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[...Array(4)].map((_, i) => <div key={i} style={{ height: 52, borderRadius: 8, background: '#1e1e24' }} />)}</div>

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: '#cc2222' }}>Modules</span> / Custom Commands
        </h2>
        <button onClick={() => setModal('add')}
          style={{ background: '#cc2222', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + Add Command
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search commands..."
          style={{ width: '100%', background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '11px 12px 11px 34px', color: '#ccc', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Commands table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <p style={{ fontSize: 15 }}>No custom commands yet. Click "+ Add Command" to create one.</p>
        </div>
      ) : (
        <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 10, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 80px 100px', gap: 0, padding: '10px 16px', borderBottom: '1px solid #2a2a35' }}>
            {['COMMAND', 'RESPONSE', 'ENABLED', 'ACTIONS'].map(h => (
              <span key={h} style={{ color: '#555', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          {filtered.map((cmd, i) => (
            <div key={cmd.trigger} style={{
              display: 'grid', gridTemplateColumns: '1fr 2fr 80px 100px', gap: 0,
              padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid #2a2a35',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#252530'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: '#cc2222', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, alignSelf: 'center' }}>?{cmd.trigger}</span>
              <span style={{ color: '#aaa', fontSize: 12, alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                {cmd.response || (cmd.embed?.description ? '[embed]' : '—')}
              </span>
              <div style={{ alignSelf: 'center' }}>
                <button onClick={() => handleToggle(cmd)}
                  style={{ width: 32, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', background: cmd.enabled ? '#00c896' : '#444', position: 'relative', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: 2, left: cmd.enabled ? 15 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, alignSelf: 'center' }}>
                <button onClick={() => setModal(cmd)}
                  style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: '#cc2222', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  <Settings size={11} />
                </button>
                <button onClick={() => handleDelete(cmd.trigger)}
                  style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: '#cc2222', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  <X size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variables reference */}
      <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: 20, marginTop: 16 }}>
        <p style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Variable Reference</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
          {CC_VARS.map(([v, d]) => (
            <div key={v} style={{ display: 'flex', gap: 8, padding: '3px 0' }}>
              <code style={{ color: '#cc2222', fontSize: 11, fontWeight: 700, minWidth: 160, flexShrink: 0 }}>{v}</code>
              <span style={{ color: '#666', fontSize: 11 }}>— {d}</span>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <CCModal
          cmd={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          channels={channels}
          roles={roles}
        />
      )}
    </div>
  )
}

// ── Auto Responder ────────────────────────────────────────────────────────────
const AR_VARS = [
  ['{user}', 'Mention the user. Eg: Hello {user}!'],
  ['{username}', 'Display name of the user'],
  ['{avatar}', 'User avatar URL'],
  ['{server}', 'Server name'],
  ['{channel}', 'Current channel mention'],
  ['{everyone}', '@everyone'],
  ['{here}', '@here'],
  ['{&RoleName}', 'Mention a role by name. Eg: {&Mods}'],
  ['{#channel}', 'Link a channel by name. Eg: {#general}'],
]

const AR_DEFAULT = {
  trigger: '', response: '', response_type: 'message', wildcard: false, enabled: true,
  allowed_channels: [], ignored_channels: [], allowed_roles: [], ignored_roles: [],
  embed: { title: '', description: '', color: '#cc2222', footer: '', thumbnail: '' },
  reaction: '',
}

function ARModal({ ar, onSave, onClose, channels, roles }) {
  const isEdit = !!(ar && ar.id)
  const [form, setForm] = React.useState({
    ...AR_DEFAULT,
    embed: { ...AR_DEFAULT.embed },
    ...(ar || {}),
    embed: { ...AR_DEFAULT.embed, ...(ar?.embed || {}) },
  })
  const set = p => setForm(f => ({ ...f, ...p }))
  const setEmb = p => setForm(f => ({ ...f, embed: { ...f.embed, ...p } }))

  const inp = {
    background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 6,
    padding: '10px 14px', color: '#ccc', fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  const TYPES = [
    { id: 'message', label: 'Message Response' },
    { id: 'embed', label: 'Embed Response' },
    { id: 'reaction', label: 'Reaction Response' },
  ]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#16161e', border: '1px solid #2a2a35', borderRadius: 12, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>{isEdit ? 'Edit Response' : 'Add Response'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ height: 1, background: '#2a2a35', marginBottom: 20 }} />

        {/* Trigger */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#fff', fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>
            Trigger{form.trigger ? ` - ${form.trigger.length} Characters` : ''}
          </label>
          <input
            value={form.trigger}
            onChange={e => set({ trigger: e.target.value })}
            placeholder="Enter trigger text..."
            style={inp}
          />
        </div>

        {/* Response type radio */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: form.response_type === t.id ? '#2a0000' : '#1e1e24', border: `1px solid ${form.response_type === t.id ? '#cc2222' : '#2a2a35'}`, borderRadius: 6, padding: '9px 16px', flex: 1, minWidth: 140 }}>
                <span
                  onClick={() => set({ response_type: t.id })}
                  style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${form.response_type === t.id ? '#cc2222' : '#555'}`, background: form.response_type === t.id ? '#cc2222' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  {form.response_type === t.id && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                </span>
                <span style={{ color: form.response_type === t.id ? '#fff' : '#aaa', fontSize: 13, fontWeight: 600 }}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Response textarea (message type) */}
        {form.response_type === 'message' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#fff', fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>
              Response{form.response ? ` - ${form.response.length} Characters` : ''}
            </label>
            <textarea
              value={form.response}
              onChange={e => set({ response: e.target.value })}
              rows={4}
              placeholder="Enter response text... Use variables like {user}, {server}"
              style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
        )}

        {/* Reaction emoji input */}
        {form.response_type === 'reaction' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#fff', fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>Emoji</label>
            <input
              value={form.reaction}
              onChange={e => set({ reaction: e.target.value })}
              placeholder="Paste emoji or custom emoji ID, e.g. 👋 or <:name:id>"
              style={inp}
            />
            <p style={{ color: '#666', fontSize: 12, margin: '6px 0 0' }}>Standard emoji: 👋 🎉 ✅ — Custom emoji: &lt;:name:id&gt; or &lt;a:name:id&gt;</p>
          </div>
        )}

        {/* Embed builder */}
        {form.response_type === 'embed' && (
          <div style={{ background: '#1a1a22', border: '1px solid #2a2a35', borderRadius: 8, padding: 16, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Embed Builder</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Title</label>
                <input value={form.embed.title || ''} onChange={e => setEmb({ title: e.target.value })} style={inp} placeholder="Optional title" />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Color</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="color" value={form.embed.color || '#cc2222'} onChange={e => setEmb({ color: e.target.value })}
                    style={{ width: 38, height: 38, border: '1px solid #333', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 2 }} />
                  <input value={form.embed.color || ''} onChange={e => setEmb({ color: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="#cc2222" />
                </div>
              </div>
            </div>
            <div>
              <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description</label>
              <textarea value={form.embed.description || ''} onChange={e => setEmb({ description: e.target.value })} rows={3}
                style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} placeholder="Embed body text..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Footer</label>
                <input value={form.embed.footer || ''} onChange={e => setEmb({ footer: e.target.value })} style={inp} placeholder="Footer text" />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Thumbnail</label>
                <input value={form.embed.thumbnail || ''} onChange={e => setEmb({ thumbnail: e.target.value })} style={inp} placeholder="{avatar} or URL" />
              </div>
            </div>
          </div>
        )}

        {/* Channel / Role filters — 2x2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {[
            ['allowed_channels', 'Allowed Channels', channels, '#'],
            ['ignored_channels', 'Ignored Channels', channels, '#'],
            ['allowed_roles', 'Allowed Roles', roles, ''],
            ['ignored_roles', 'Ignored Roles', roles, ''],
          ].map(([key, label, items, prefix]) => (
            <div key={key}>
              <label style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{label}</label>
              <MultiSelectDropdown items={items} selected={form[key] || []} onChange={v => set({ [key]: v })} placeholder="None" prefix={prefix} />
            </div>
          ))}
        </div>

        {/* Wildcard checkbox */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 6, padding: '12px 14px' }}>
            <span
              onClick={() => set({ wildcard: !form.wildcard })}
              style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${form.wildcard ? '#cc2222' : '#555'}`, background: form.wildcard ? '#cc2222' : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {form.wildcard && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
            </span>
            <div>
              <span style={{ color: '#ccc', fontSize: 13, fontWeight: 600 }}>Wildcard</span>
              <p style={{ color: '#666', fontSize: 12, margin: '2px 0 0' }}>Match trigger anywhere in message (instead of exact match)</p>
            </div>
          </label>
        </div>

        {/* Variables reference */}
        <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
          <p style={{ color: '#aaa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Variable Reference</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
            {AR_VARS.map(([v, d]) => (
              <div key={v} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
                <code style={{ color: '#cc2222', fontSize: 11, fontWeight: 700, minWidth: 130, flexShrink: 0 }}>{v}</code>
                <span style={{ color: '#666', fontSize: 11 }}>— {d}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#2a2a35', marginBottom: 16 }} />

        <button
          onClick={() => { if (form.trigger) onSave(form) }}
          disabled={!form.trigger}
          style={{ background: form.trigger ? '#cc2222' : '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: form.trigger ? 'pointer' : 'not-allowed' }}
        >
          {isEdit ? 'Save Response' : 'Add Response'}
        </button>
      </div>
    </div>
  )
}

function AutoResponderPanel({ guildId }) {
  const [ars, setArs] = React.useState([])
  const [channels, setChannels] = React.useState([])
  const [roles, setRoles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [modal, setModal] = React.useState(null)  // null | 'add' | ar object
  const [search, setSearch] = React.useState('')

  const load = React.useCallback(() => {
    if (!guildId) return
    Promise.all([
      getAutoResponders(guildId).catch(() => ({ data: [] })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
    ]).then(([ar, ch, ro]) => {
      setArs(Array.isArray(ar.data) ? ar.data : [])
      setChannels(ch.data || [])
      setRoles(ro.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  React.useEffect(() => { load() }, [load])

  async function handleSave(form) {
    try {
      await saveAutoResponder(guildId, form)
      toast.success(modal?.id ? 'Response updated!' : 'Response added!')
      setModal(null)
      load()
    } catch { toast.error('Failed to save') }
  }

  async function handleDelete(ar) {
    try {
      await deleteAutoResponder(guildId, ar.id)
      setArs(p => p.filter(x => x.id !== ar.id))
      toast.success('Response deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function handleToggle(ar) {
    try {
      await toggleAutoResponder(guildId, ar.id, !ar.enabled)
      setArs(p => p.map(x => x.id === ar.id ? { ...x, enabled: !x.enabled } : x))
    } catch { toast.error('Failed to toggle') }
  }

  const TYPE_LABEL = { message: 'Message', embed: 'Embed', reaction: 'Reaction' }
  const TYPE_COLOR = { message: '#4A90E2', embed: '#9B59B6', reaction: '#F39C12' }

  const filtered = ars.filter(a =>
    !search ||
    a.trigger.toLowerCase().includes(search.toLowerCase()) ||
    (a.response || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(4)].map((_, i) => <div key={i} style={{ height: 52, borderRadius: 8, background: '#1e1e24' }} />)}
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: '#cc2222' }}>Modules</span> / Auto Responder
        </h2>
        <button
          onClick={() => setModal('add')}
          style={{ background: '#cc2222', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          + Add Response
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search triggers or responses..."
          style={{ width: '100%', background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '11px 12px 11px 34px', color: '#ccc', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <p style={{ fontSize: 15 }}>No auto responders yet. Click "+ Add Response" to create one.</p>
        </div>
      ) : (
        <div style={{ background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 10, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 90px 80px 100px', gap: 0, padding: '10px 16px', borderBottom: '1px solid #2a2a35' }}>
            {['TRIGGER', 'RESPONSE', 'TYPE', 'ENABLED', 'ACTIONS'].map(h => (
              <span key={h} style={{ color: '#555', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          {filtered.map((ar, i) => (
            <div
              key={ar.id}
              style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 90px 80px 100px', gap: 0, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid #2a2a35', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#252530'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: '#cc2222', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                {ar.wildcard ? `*${ar.trigger}*` : ar.trigger}
              </span>
              <span style={{ color: '#aaa', fontSize: 12, alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                {ar.response_type === 'reaction'
                  ? `React: ${ar.reaction || '—'}`
                  : ar.response_type === 'embed'
                    ? ar.embed?.description ? `[embed] ${ar.embed.description}` : '[embed]'
                    : ar.response || '—'}
              </span>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ background: `${TYPE_COLOR[ar.response_type] || '#555'}22`, color: TYPE_COLOR[ar.response_type] || '#aaa', border: `1px solid ${TYPE_COLOR[ar.response_type] || '#555'}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  {TYPE_LABEL[ar.response_type] || ar.response_type}
                </span>
              </div>
              <div style={{ alignSelf: 'center' }}>
                <button
                  onClick={() => handleToggle(ar)}
                  style={{ width: 32, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', background: ar.enabled ? '#00c896' : '#444', position: 'relative', transition: 'background 0.2s' }}
                >
                  <span style={{ position: 'absolute', top: 2, left: ar.enabled ? 15 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, alignSelf: 'center' }}>
                <button
                  onClick={() => setModal(ar)}
                  style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: '#cc2222', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  <Settings size={11} />
                </button>
                <button
                  onClick={() => handleDelete(ar)}
                  style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: '#cc2222', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ARModal
          ar={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          channels={channels}
          roles={roles}
        />
      )}
    </div>
  )
}

// ── Giveaways ─────────────────────────────────────────────────────────────────
function GiveawaysPanel({ guildId }) {
  const [giveaways, setGiveaways] = React.useState([])
  const [settings, setSettings] = React.useState({ manager_role: null, multipliers: [] })
  const [roles, setRoles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [tab, setTab] = React.useState('active')

  const S = { bg: '#16161e', card: '#1e1e24', border: '#2a2a35', text1: '#fff', text2: '#aaa', text3: '#ccc', accent: '#cc2222' }
  const inp = { background: S.card, border: `1px solid #333`, borderRadius: 6, padding: '9px 12px', color: S.text3, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

  const load = React.useCallback(() => {
    if (!guildId) return
    Promise.all([
      getGiveaways(guildId).catch(() => ({ data: [] })),
      getGiveawaySettings(guildId).catch(() => ({ data: { manager_role: null, multipliers: [] } })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
    ]).then(([gw, st, ro]) => {
      setGiveaways(gw.data || [])
      setSettings(st.data || { manager_role: null, multipliers: [] })
      setRoles(ro.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  React.useEffect(() => { load() }, [load])

  async function saveSettings() {
    setSaving(true)
    try { await saveGiveawaySettings(guildId, settings); toast.success('Settings saved!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  async function handleEnd(msgId) {
    try { await endGiveaway(guildId, msgId); load(); toast.success('Giveaway ended') }
    catch { toast.error('Failed to end giveaway') }
  }

  async function handleDelete(msgId) {
    try { await deleteGiveaway(guildId, msgId); setGiveaways(p => p.filter(g => g.message_id !== msgId)); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  function addMultiplier() {
    setSettings(p => ({ ...p, multipliers: [...p.multipliers, { role_id: '', multiplier: 2 }] }))
  }
  function removeMultiplier(i) {
    setSettings(p => ({ ...p, multipliers: p.multipliers.filter((_, idx) => idx !== i) }))
  }
  function setMultiplier(i, patch) {
    setSettings(p => ({ ...p, multipliers: p.multipliers.map((m, idx) => idx === i ? { ...m, ...patch } : m) }))
  }

  const active = giveaways.filter(g => g.status === 'running')
  const ended = giveaways.filter(g => g.status !== 'running')

  function fmtTime(ts) {
    if (!ts) return '—'
    return new Date(ts * 1000).toLocaleString()
  }

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(3)].map((_, i) => <div key={i} style={{ height: 60, borderRadius: 8, background: S.card }} />)}</div>

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: S.text1, margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: S.accent }}>Modules</span> / Giveaways
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['active', 'Active'], ['ended', 'Ended'], ['settings', 'Settings']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: tab === id ? S.accent : 'transparent',
                border: `1px solid ${tab === id ? S.accent : '#444'}`,
                color: tab === id ? '#fff' : S.text2
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active giveaways */}
      {tab === 'active' && (
        <div>
          {active.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
              <p style={{ fontSize: 15 }}>No active giveaways. Use <code style={{ color: S.accent }}>/gstart</code> in Discord to create one.</p>
            </div>
          ) : (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', padding: '10px 16px', borderBottom: `1px solid ${S.border}` }}>
                {['PRIZE', 'WINNERS', 'ENTRIES', 'ENDS', 'ACTIONS'].map(h => (
                  <span key={h} style={{ color: '#555', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {active.map((g, i) => (
                <div key={g.message_id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', padding: '12px 16px', borderTop: i === 0 ? 'none' : `1px solid ${S.border}`, alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#252530'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <p style={{ margin: 0, color: S.text1, fontSize: 13, fontWeight: 600 }}>🎉 {g.prize}</p>
                    <p style={{ margin: 0, color: '#555', fontSize: 11 }}>ID: {g.message_id}</p>
                  </div>
                  <span style={{ color: S.text3, fontSize: 13 }}>{g.winners}</span>
                  <span style={{ color: S.text3, fontSize: 13 }}>—</span>
                  <span style={{ color: S.text2, fontSize: 12 }}>{fmtTime(g.end_time)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleEnd(g.message_id)}
                      style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: S.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      End
                    </button>
                    <button onClick={() => handleDelete(g.message_id)}
                      style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: S.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 16, padding: 14, background: S.card, border: `1px solid ${S.border}`, borderRadius: 8 }}>
            <p style={{ color: S.text2, fontSize: 13, margin: 0 }}>
              Use Discord slash commands to manage giveaways:
              <code style={{ color: S.accent, marginLeft: 8 }}>/gstart</code>
              <code style={{ color: S.accent, marginLeft: 8 }}>/gend</code>
              <code style={{ color: S.accent, marginLeft: 8 }}>/greroll</code>
              <code style={{ color: S.accent, marginLeft: 8 }}>/gdel</code>
              <code style={{ color: S.accent, marginLeft: 8 }}>/glist</code>
            </p>
          </div>
        </div>
      )}

      {/* Ended giveaways */}
      {tab === 'ended' && (
        <div>
          {ended.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
              <p style={{ fontSize: 15 }}>No ended giveaways.</p>
            </div>
          ) : (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px', padding: '10px 16px', borderBottom: `1px solid ${S.border}` }}>
                {['PRIZE', 'WINNERS', 'ENDED', ''].map(h => (
                  <span key={h} style={{ color: '#555', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {ended.map((g, i) => (
                <div key={g.message_id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px', padding: '12px 16px', borderTop: i === 0 ? 'none' : `1px solid ${S.border}`, alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#252530'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <p style={{ margin: 0, color: '#666', fontSize: 13 }}>🎁 {g.prize}</p>
                  <span style={{ color: '#666', fontSize: 13 }}>{g.winners}</span>
                  <span style={{ color: '#555', fontSize: 12 }}>{fmtTime(g.end_time)}</span>
                  <button onClick={() => handleDelete(g.message_id)}
                    style={{ background: '#2a2a35', border: '1px solid #444', borderRadius: 5, padding: '4px 10px', color: S.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Manager Role */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20 }}>
            <p style={{ color: S.text1, fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>Giveaway Manager Role</p>
            <p style={{ color: S.text2, fontSize: 12, margin: '0 0 12px' }}>Members with this role can create and manage giveaways.</p>
            <select value={settings.manager_role || ''} onChange={e => setSettings(p => ({ ...p, manager_role: e.target.value || null }))}
              style={{ ...inp, maxWidth: 300 }}>
              <option value="">Select a role...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Entry Multipliers */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: 20 }}>
            <p style={{ color: S.text1, fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>Entry Multipliers</p>
            <p style={{ color: S.text2, fontSize: 12, margin: '0 0 14px' }}>Give certain roles bonus entries in giveaways.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settings.multipliers.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select value={m.role_id || ''} onChange={e => setMultiplier(i, { role_id: e.target.value })}
                    style={{ ...inp, flex: 2 }}>
                    <option value="">Select role...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ color: S.text2, fontSize: 13 }}>×</span>
                    <input type="number" min={2} max={10} value={m.multiplier} onChange={e => setMultiplier(i, { multiplier: parseInt(e.target.value) || 2 })}
                      style={{ ...inp, width: 70 }} />
                    <span style={{ color: S.text2, fontSize: 12 }}>entries</span>
                  </div>
                  <button onClick={() => removeMultiplier(i)}
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addMultiplier}
                style={{ background: 'none', border: `1px dashed #444`, borderRadius: 6, padding: '8px 16px', color: S.text2, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}>
                + Add Multiplier
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={saveSettings} disabled={saving}
              style={{ background: saving ? '#333' : S.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 28px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reaction Roles ────────────────────────────────────────────────────────────
const RR = {
  bg: '#16161e',
  card: '#1e1e24',
  card2: '#2a2a35',
  border: '#3a3a4a',
  accent: '#cc2222',
  btnBg: '#540000',
  text1: '#f0f0f5',
  text2: '#9090a0',
  textDis: '#555565',
}

const EMPTY_EMBED = {
  color: '#cc2222',
  title: '',
  title_url: '',
  description: '',
  author_name: '',
  author_icon: '',
  image_url: '',
  thumbnail_url: '',
  footer_text: '',
  footer_icon: '',
  fields: [],
}

const EMPTY_MSG = {
  name: '',
  channel_id: null,
  message_type: 'plain',
  selection_type: 'reactions',
  content: '',
  embed: { ...EMPTY_EMBED },
  unique_roles: false,
  remove_on_react: false,
  entries: [],
}

function RRSingleSelect({ items, value, onChange, placeholder = 'Select...', prefix = '' }) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const ref = React.useRef(null)

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = items.find(i => i.id === value)
  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        background: RR.card2, border: `1px solid ${RR.border}`, borderRadius: 6,
        padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', color: selected ? RR.text1 : RR.text2, fontSize: 13,
      }}>
        <span>{selected ? `${prefix}${selected.name}` : placeholder}</span>
        <span style={{ color: RR.text2, fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: '#1a1a24', border: `1px solid ${RR.border}`, borderRadius: 6,
          marginTop: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 8px', borderBottom: `1px solid ${RR.border}` }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%', background: RR.card2, border: `1px solid ${RR.border}`,
                borderRadius: 4, padding: '5px 8px', color: RR.text1, fontSize: 12,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <div onClick={() => { onChange(null); setOpen(false); setSearch('') }}
              style={{ padding: '8px 12px', cursor: 'pointer', color: RR.text2, fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.background = RR.card2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {placeholder}
            </div>
            {filtered.map(item => (
              <div key={item.id} onClick={() => { onChange(item.id); setOpen(false); setSearch('') }}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                  color: item.id === value ? '#fff' : RR.text1,
                  background: item.id === value ? RR.accent : 'transparent',
                }}
                onMouseEnter={e => { if (item.id !== value) e.currentTarget.style.background = RR.card2 }}
                onMouseLeave={e => { if (item.id !== value) e.currentTarget.style.background = 'transparent' }}>
                {prefix}{item.name}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '8px 12px', color: RR.textDis, fontSize: 13 }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function RRLabel({ children }) {
  return (
    <label style={{ color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
      {children}
    </label>
  )
}

function RRInput({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: RR.card2, border: `1px solid ${RR.border}`, color: RR.text1,
        borderRadius: 6, padding: '7px 10px', fontSize: 13, width: '100%', outline: 'none',
        boxSizing: 'border-box', ...style,
      }}
    />
  )
}

function RRTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: RR.card2, border: `1px solid ${RR.border}`, color: RR.text1,
        borderRadius: 6, padding: '8px 10px', fontSize: 13, width: '100%', outline: 'none',
        resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
      }}
    />
  )
}

function RRRadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
            background: value === opt.value ? RR.accent : RR.card2,
            border: `1px solid ${value === opt.value ? RR.accent : RR.border}`,
            color: value === opt.value ? '#fff' : RR.text2,
            transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function RRCheckbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          background: checked ? RR.accent : RR.card2,
          border: `2px solid ${checked ? RR.accent : RR.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', cursor: 'pointer',
        }}
      >
        {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ color: RR.text1, fontSize: 13 }}>{label}</span>
    </label>
  )
}

function ReactionRolesPanel({ guildId }) {
  const [messages, setMessages] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [form, setForm] = React.useState({ ...EMPTY_MSG, embed: { ...EMPTY_MSG.embed } })
  const [channels, setChannels] = React.useState([])
  const [roles, setRoles] = React.useState([])
  const [serverEmojis, setServerEmojis] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [posting, setPosting] = React.useState(false)
  const [optOpen, setOptOpen] = React.useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false)
  const [emojiSearch, setEmojiSearch] = React.useState('')
  const emojiPickerRef = React.useRef(null)
  const [embedModalOpen, setEmbedModalOpen] = React.useState(false)
  const [newDesc, setNewDesc] = React.useState('')  // for dropdown description
  const [embedSections, setEmbedSections] = React.useState({ author: false, imagethumb: false, footer: false, fields: false })

  React.useEffect(() => {
    function handleClick(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setEmojiPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // New entry row state
  const [newEmoji, setNewEmoji] = React.useState('')
  const [newRole, setNewRole] = React.useState('')
  const [newLabel, setNewLabel] = React.useState('')

  useEffect(() => {
    if (!guildId) return
    Promise.all([
      getReactionRoles(guildId).catch(() => ({ data: [] })),
      getGuildChannels(guildId).catch(() => ({ data: [] })),
      getGuildRoles(guildId).catch(() => ({ data: [] })),
      getGuildEmojis(guildId).catch(() => ({ data: [] })),
    ]).then(([rr, ch, ro, em]) => {
      setMessages(rr.data || [])
      setChannels(ch.data || [])
      setRoles(ro.data || [])
      setServerEmojis(em.data || [])
    }).finally(() => setLoading(false))
  }, [guildId])

  function selectMessage(idx) {
    setSelected(idx)
    const msg = messages[idx]
    setForm({
      ...EMPTY_MSG,
      ...msg,
      embed: { ...EMPTY_MSG.embed, ...(msg.embed || {}) },
      entries: (msg.entries || []).map(e => ({ ...e })),
    })
    setNewEmoji(''); setNewRole(''); setNewLabel('')
  }

  function newMessage() {
    setSelected(null)
    setForm({ ...EMPTY_MSG, embed: { ...EMPTY_MSG.embed }, entries: [] })
    setNewEmoji(''); setNewRole(''); setNewLabel('')
  }

  function set(patch) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  function setEmbed(patch) {
    setForm(prev => ({ ...prev, embed: { ...prev.embed, ...patch } }))
  }

  function addEntry() {
    if (!newRole) return
    // For reaction type, emoji is required
    if (form.selection_type === 'reactions' && !newEmoji.trim()) {
      toast.error('Emoji is required for reaction type')
      return
    }
    const entry = { emoji: newEmoji.trim(), role_id: newRole, label: newLabel.trim(), description: newDesc.trim() }
    set({ entries: [...form.entries, entry] })
    setNewEmoji(''); setNewRole(''); setNewLabel(''); setNewDesc('')
  }

  function removeEntry(idx) {
    set({ entries: form.entries.filter((_, i) => i !== idx) })
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { ...form }
      if (selected !== null && messages[selected]?.id) {
        payload.id = messages[selected].id
      }
      const res = await saveReactionRole(guildId, payload)
      const savedId = res.data?.id
      // Refresh list
      const rr = await getReactionRoles(guildId)
      const newList = rr.data || []
      setMessages(newList)
      // Re-select the saved item
      const newIdx = newList.findIndex(m => m.id === savedId)
      if (newIdx >= 0) selectMessage(newIdx)
      toast.success('Reaction roles saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function postMessage() {
    const id = selected !== null ? messages[selected]?.id : null
    if (!id) { toast.error('Save first before posting'); return }
    setPosting(true)
    try {
      await postReactionRole(guildId, id)
      toast.success('Message posted to Discord!')
    } catch {
      toast.error('Failed to post message')
    } finally {
      setPosting(false)
    }
  }

  async function deleteMsg(id, e) {
    e.stopPropagation()
    try {
      await deleteReactionRole(guildId, id)
      const rr = await getReactionRoles(guildId)
      const newList = rr.data || []
      setMessages(newList)
      setSelected(null)
      setForm({ ...EMPTY_MSG, embed: { ...EMPTY_MSG.embed }, entries: [] })
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function cloneMessage() {
    const cloned = {
      ...form,
      embed: { ...form.embed, fields: (form.embed.fields || []).map(f => ({ ...f })) },
      entries: form.entries.map(e => ({ ...e })),
      name: (form.name || 'Untitled') + ' (copy)',
    }
    delete cloned.id
    setSaving(true)
    try {
      const res = await saveReactionRole(guildId, cloned)
      const savedId = res.data?.id
      const rr = await getReactionRoles(guildId)
      const newList = rr.data || []
      setMessages(newList)
      const newIdx = newList.findIndex(m => m.id === savedId)
      if (newIdx >= 0) selectMessage(newIdx)
      toast.success('Cloned!')
    } catch {
      toast.error('Failed to clone')
    } finally {
      setSaving(false)
    }
  }

  const entryLabel = form.selection_type === 'reactions' ? 'Reaction' : form.selection_type === 'buttons' ? 'Button' : 'Option'

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: RR.card }} />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', minHeight: 600, animation: 'fadeIn 0.2s' }}>

      {/* Left sidebar */}
      <div style={{
        width: 200, flexShrink: 0, background: RR.card,
        border: `1px solid ${RR.border}`, borderRadius: '10px 0 0 10px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <button
          onClick={newMessage}
          style={{
            margin: 10, padding: '9px 0', borderRadius: 6, fontSize: 13, fontWeight: 700,
            background: RR.accent, color: '#fff', border: 'none', cursor: 'pointer',
            letterSpacing: 0.5,
          }}
        >
          + NEW MESSAGE
        </button>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {messages.length === 0 && (
            <p style={{ color: RR.textDis, fontSize: 12, textAlign: 'center', marginTop: 20 }}>No messages yet</p>
          )}
          {messages.map((msg, idx) => {
            const ch = channels.find(c => c.id === msg.channel_id)
            const isActive = selected === idx
            return (
              <div
                key={msg.id}
                onClick={() => selectMessage(idx)}
                style={{
                  padding: '8px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  background: isActive ? RR.btnBg : 'transparent',
                  border: `1px solid ${isActive ? RR.accent : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = RR.card2 }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: RR.text1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {msg.name || 'Untitled'}
                  </span>
                  <button
                    onClick={ev => deleteMsg(msg.id, ev)}
                    style={{ background: 'none', border: 'none', color: RR.textDis, cursor: 'pointer', fontSize: 14, padding: '0 0 0 4px', lineHeight: 1 }}
                    title="Delete"
                  >×</button>
                </div>
                {ch && (
                  <span style={{ color: RR.text2, fontSize: 11 }}>#{ch.name}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, background: RR.bg, border: `1px solid ${RR.border}`, borderLeft: 'none',
        borderRadius: '0 10px 10px 0', overflowY: 'auto', padding: 24,
      }}>
        {selected === null && messages.length > 0 && (
          <div style={{ color: RR.text2, textAlign: 'center', marginTop: 60, fontSize: 14 }}>
            Select a message from the sidebar or create a new one.
          </div>
        )}

        {(selected !== null || messages.length === 0) && (
          <div style={{ maxWidth: 700 }}>

            {/* MESSAGE SETTINGS */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                Message Settings
              </p>
              <div style={{ background: RR.card, border: `1px solid ${RR.border}`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div>
                  <RRLabel>Name</RRLabel>
                  <RRInput value={form.name} onChange={v => set({ name: v })} placeholder="e.g. Color Roles" />
                </div>

                <div>
                  <RRLabel>Channel to Post</RRLabel>
                  <RRSingleSelect
                    items={channels}
                    value={form.channel_id}
                    onChange={v => set({ channel_id: v })}
                    placeholder="Select a channel..."
                    prefix="#"
                  />
                </div>

                <div>
                  <RRLabel>Message Type</RRLabel>
                  <RRRadioGroup
                    options={[
                      { value: 'plain', label: 'Plain Message' },
                      { value: 'embed', label: 'Embed Message' },
                      { value: 'existing', label: 'Existing Message' },
                    ]}
                    value={form.message_type}
                    onChange={v => set({ message_type: v })}
                  />
                </div>

                {/* Plain message content */}
                {form.message_type === 'plain' && (
                  <div>
                    <RRLabel>Message Content</RRLabel>
                    <RRTextarea value={form.content} onChange={v => set({ content: v })} placeholder="Enter message text..." />
                  </div>
                )}

                {/* Embed preview + edit button */}
                {form.message_type === 'embed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Mini embed preview */}
                    <div style={{
                      borderLeft: `4px solid ${form.embed.color || '#cc2222'}`,
                      background: '#23232d',
                      borderRadius: '0 6px 6px 0',
                      padding: '10px 14px',
                      minHeight: 48,
                    }}>
                      {form.embed.title ? (
                        <div style={{ color: RR.text1, fontWeight: 700, fontSize: 14, marginBottom: form.embed.description ? 4 : 0 }}>
                          {form.embed.title}
                        </div>
                      ) : (
                        <div style={{ color: RR.textDis, fontSize: 13, fontStyle: 'italic' }}>No title set</div>
                      )}
                      {form.embed.description && (
                        <div style={{ color: RR.text2, fontSize: 13, whiteSpace: 'pre-wrap' }}>{form.embed.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => setEmbedModalOpen(true)}
                      style={{
                        alignSelf: 'flex-start', padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                        background: RR.accent, border: 'none', color: '#fff', cursor: 'pointer',
                      }}
                    >
                      Edit Embed
                    </button>
                  </div>
                )}

                {/* Existing message ID */}
                {form.message_type === 'existing' && (
                  <div>
                    <RRLabel>Existing Message ID</RRLabel>
                    <RRInput value={form.message_id} onChange={v => set({ message_id: v })} placeholder="Discord message ID" />
                  </div>
                )}

                <div>
                  <RRLabel>Selection Type</RRLabel>
                  <RRRadioGroup
                    options={[
                      { value: 'reactions', label: 'Reactions' },
                      { value: 'buttons', label: 'Buttons' },
                      { value: 'dropdowns', label: 'Dropdowns' },
                    ]}
                    value={form.selection_type}
                    onChange={v => set({ selection_type: v })}
                  />
                </div>
              </div>
            </div>

            {/* ENTRY SETTINGS */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                {form.selection_type === 'reactions' ? 'Reaction Settings' : form.selection_type === 'buttons' ? 'Button Settings' : 'Dropdown Settings'}
              </p>
              <div style={{ background: RR.card, border: `1px solid ${RR.border}`, borderRadius: 10, padding: 18 }}>

                {/* Column headers */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${RR.border}` }}>
                  <div style={{ width: 48, flexShrink: 0, color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {form.selection_type === 'reactions' ? 'Reaction' : 'Button'}
                  </div>
                  <div style={{ flex: 1, color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Roles</div>
                  {form.selection_type !== 'reactions' && (
                    <div style={{ flex: 1, color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                      {form.selection_type === 'buttons' ? 'Button Label' : 'Dropdown Label'}
                    </div>
                  )}
                  {form.selection_type === 'dropdowns' && (
                    <div style={{ flex: 1, color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Dropdown Description</div>
                  )}
                  <div style={{ width: 24, flexShrink: 0 }} />
                </div>

                {/* Existing entries */}
                {form.entries.length > 0 && (
                  <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.entries.map((entry, idx) => {
                      const roleObj = roles.find(r => r.id === entry.role_id)
                      const isCustomEmoji = entry.emoji && entry.emoji.startsWith('<')
                      const customEmojiUrl = isCustomEmoji
                        ? (() => { const m = entry.emoji.match(/:(\d+)>$/); return m ? `https://cdn.discordapp.com/emojis/${m[1]}.webp?size=32` : null })()
                        : null
                      return (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                          background: RR.card2, borderRadius: 6, border: `1px solid ${RR.border}`,
                        }}>
                          <div style={{
                            width: 48, height: 36, flexShrink: 0, borderRadius: 6,
                            border: `1px solid ${RR.border}`, background: RR.card,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                          }}>
                            {entry.emoji
                              ? (customEmojiUrl
                                ? <img src={customEmojiUrl} alt={entry.emoji} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                                : <span>{entry.emoji}</span>)
                              : <span style={{ color: RR.textDis, fontSize: 13 }}>—</span>
                            }
                          </div>
                          <div style={{ flex: 1, color: RR.text1, fontSize: 13 }}>
                            {roleObj ? `@${roleObj.name}` : <span style={{ color: RR.textDis }}>Unknown role</span>}
                          </div>
                          {form.selection_type !== 'reactions' && (
                            <div style={{ flex: 1, color: RR.text2, fontSize: 13 }}>{entry.label || <span style={{ color: RR.textDis }}>—</span>}</div>
                          )}
                          {form.selection_type === 'dropdowns' && (
                            <div style={{ flex: 1, color: RR.text2, fontSize: 13 }}>{entry.description || <span style={{ color: RR.textDis }}>—</span>}</div>
                          )}
                          <button
                            onClick={() => removeEntry(idx)}
                            style={{ width: 24, background: 'none', border: 'none', color: RR.textDis, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}
                          >×</button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add entry row */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 auto', position: 'relative' }} ref={emojiPickerRef}>
                    <button
                      onClick={() => setEmojiPickerOpen(o => !o)}
                      style={{
                        width: 48, height: 38, borderRadius: 6, border: `1px solid ${RR.border}`,
                        background: RR.card2, cursor: 'pointer', fontSize: 20, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Pick emoji"
                    >
                      {newEmoji
                        ? (newEmoji.startsWith('<')
                          ? (() => { const m = newEmoji.match(/:(\d+)>$/); return m ? <img src={`https://cdn.discordapp.com/emojis/${m[1]}.webp?size=32`} alt="" style={{ width: 22, height: 22 }} /> : newEmoji })()
                          : newEmoji)
                        : <span style={{ color: RR.accent, fontSize: 22, fontWeight: 700 }}>+</span>}
                    </button>

                    {/* Emoji picker dropdown */}
                    {emojiPickerOpen && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, zIndex: 200,
                        background: '#1a1a24', border: `1px solid ${RR.border}`, borderRadius: 10,
                        width: 320, maxHeight: 380, overflowY: 'auto',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', marginTop: 4,
                      }}>
                        {/* Search */}
                        <div style={{ padding: '10px 10px 6px', position: 'sticky', top: 0, background: '#1a1a24', zIndex: 1 }}>
                          <input value={emojiSearch} onChange={e => setEmojiSearch(e.target.value)}
                            placeholder="Search emoji..."
                            style={{ width: '100%', background: RR.card2, border: `1px solid ${RR.border}`, borderRadius: 6, padding: '6px 10px', color: '#ccc', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        {/* Server custom emojis */}
                        {serverEmojis.length > 0 && (
                          <div style={{ padding: '6px 10px' }}>
                            <p style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px' }}>Custom</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {serverEmojis
                                .filter(e => !emojiSearch || e.name.toLowerCase().includes(emojiSearch.toLowerCase()))
                                .map(e => (
                                  <button key={e.id} onClick={() => { setNewEmoji(e.string); setEmojiPickerOpen(false); setEmojiSearch('') }}
                                    title={e.name}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onMouseEnter={ev => ev.currentTarget.style.background = '#2a2a35'}
                                    onMouseLeave={ev => ev.currentTarget.style.background = 'none'}>
                                    <img src={e.url} alt={e.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Common unicode emojis */}
                        {[
                          ['Smileys', ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖']],
                          ['Hands', ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🫀', '🫁', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄']],
                          ['Animals', ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔']],
                          ['Food', ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍢', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🧃', '🥤', '🧋', '☕', '🍵', '🫖', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊']],
                          ['Symbols', ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈹', '🚺', '🚹', '🚼', '⚧', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔷', '🔶', '🔹', '🔸', '🔲', '🔳', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🎲', '♟', '🎭', '🎨']],
                        ].map(([cat, emojis]) => {
                          const filtered = emojis.filter(e => !emojiSearch || e.includes(emojiSearch))
                          if (filtered.length === 0) return null
                          return (
                            <div key={cat} style={{ padding: '6px 10px' }}>
                              <p style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px' }}>{cat}</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {filtered.map((e, i) => (
                                  <button key={i} onClick={() => { setNewEmoji(e); setEmojiPickerOpen(false); setEmojiSearch('') }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 3, borderRadius: 4, lineHeight: 1 }}
                                    onMouseEnter={ev => ev.currentTarget.style.background = '#2a2a35'}
                                    onMouseLeave={ev => ev.currentTarget.style.background = 'none'}>
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <RRLabel>Roles</RRLabel>
                    <RRSingleSelect
                      items={roles}
                      value={newRole}
                      onChange={setNewRole}
                      placeholder="Select Role"
                    />
                  </div>
                  {form.selection_type !== 'reactions' && (
                    <div style={{ flex: '0 0 130px' }}>
                      <RRLabel>{form.selection_type === 'buttons' ? 'Button Label' : 'Dropdown Label'}</RRLabel>
                      <RRInput value={newLabel} onChange={setNewLabel} placeholder="Label" />
                    </div>
                  )}
                  {form.selection_type === 'dropdowns' && (
                    <div style={{ flex: '0 0 150px' }}>
                      <RRLabel>Description</RRLabel>
                      <RRInput value={newDesc} onChange={setNewDesc} placeholder="Optional description" />
                    </div>
                  )}
                  <button
                    onClick={() => { setEmojiPickerOpen(false); addEntry() }}
                    disabled={!newRole}
                    style={{
                      background: 'none',
                      border: `1px solid ${newRole ? '#cc2222' : RR.border}`,
                      color: newRole ? '#cc2222' : RR.textDis,
                      borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: newRole ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap', marginBottom: 1,
                    }}
                  >
                    {form.selection_type === 'reactions' ? 'Add Reaction' : form.selection_type === 'buttons' ? 'Add Button' : 'Add Dropdown Option'}
                  </button>
                </div>
              </div>
            </div>

            {/* OPTIONS (collapsible) */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => setOptOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, marginBottom: optOpen ? 10 : 0,
                }}
              >
                <ChevronRight size={14} style={{ color: RR.text2, transform: optOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                <span style={{ color: RR.text2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Options</span>
              </button>
              {optOpen && (
                <div style={{ background: RR.card, border: `1px solid ${RR.border}`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <RRCheckbox
                    checked={form.unique_roles}
                    onChange={v => set({ unique_roles: v })}
                    label="Unique Roles — only one role from this message at a time"
                  />
                  <RRCheckbox
                    checked={form.remove_on_react}
                    onChange={v => set({ remove_on_react: v })}
                    label="Remove on React — remove role when reacting instead of adding"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: '9px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: saving ? RR.card2 : RR.accent,
                  border: 'none',
                  color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => selected !== null && messages[selected]?.id && deleteMsg(messages[selected].id, { stopPropagation: () => { } })}
                disabled={selected === null || !messages[selected]?.id}
                style={{
                  padding: '9px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: 'none',
                  border: `1px solid ${(selected === null || !messages[selected]?.id) ? RR.border : RR.text2}`,
                  color: (selected === null || !messages[selected]?.id) ? RR.textDis : RR.text2,
                  cursor: (selected === null || !messages[selected]?.id) ? 'not-allowed' : 'pointer',
                }}
              >
                Delete
              </button>
              <button
                onClick={cloneMessage}
                disabled={saving}
                style={{
                  padding: '9px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: saving ? RR.card2 : RR.accent,
                  border: 'none',
                  color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                Clone
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Embed Editor Modal */}
      {embedModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setEmbedModalOpen(false)}>
          <div style={{
            background: RR.card, border: `1px solid ${RR.border}`, borderRadius: 12,
            maxWidth: 900, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            padding: 24,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: RR.text1, fontSize: 20, fontWeight: 700, margin: 0 }}>Embed Editor</h2>
              <button onClick={() => setEmbedModalOpen(false)}
                style={{ background: 'none', border: 'none', color: RR.text2, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <p style={{ color: RR.text2, fontSize: 12, marginBottom: 20, fontStyle: 'italic' }}>* All fields are optional</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Color */}
              <div>
                <RRLabel>Color</RRLabel>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    onClick={() => document.getElementById('embed-color-input').click()}
                    style={{
                      padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                      background: RR.accent, border: 'none', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    Choose Color
                  </button>
                  <input
                    id="embed-color-input"
                    type="color"
                    value={form.embed.color || '#cc2222'}
                    onChange={e => setEmbed({ color: e.target.value })}
                    style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer' }}
                  />
                  <RRInput value={form.embed.color || '#cc2222'} onChange={v => setEmbed({ color: v })} placeholder="#cc2222" style={{ flex: 1, maxWidth: 120 }} />
                </div>
              </div>

              {/* Title + Title URL */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <RRLabel>Title</RRLabel>
                  <RRInput value={form.embed.title || ''} onChange={v => setEmbed({ title: v })} placeholder="Embed title" />
                </div>
                <div style={{ flex: 1 }}>
                  <RRLabel>Title URL</RRLabel>
                  <RRInput value={form.embed.title_url || ''} onChange={v => setEmbed({ title_url: v })} placeholder="https://..." />
                </div>
              </div>

              {/* Description */}
              <div>
                <RRLabel>Description</RRLabel>
                <RRTextarea value={form.embed.description || ''} onChange={v => setEmbed({ description: v })} placeholder="Embed description..." rows={4} />
              </div>

              {/* Author (collapsible) */}
              <div>
                <button
                  onClick={() => setEmbedSections(s => ({ ...s, author: !s.author }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, marginBottom: embedSections.author ? 10 : 0,
                  }}
                >
                  <span style={{ color: RR.text2, fontSize: 16 }}>{embedSections.author ? '⊖' : '⊕'}</span>
                  <span style={{ color: RR.text2, fontSize: 13, fontWeight: 700 }}>Author</span>
                </button>
                {embedSections.author && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <RRLabel>Author Name</RRLabel>
                      <RRInput value={form.embed.author_name || ''} onChange={v => setEmbed({ author_name: v })} placeholder="Author name" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <RRLabel>Author Icon URL</RRLabel>
                      <RRInput value={form.embed.author_icon || ''} onChange={v => setEmbed({ author_icon: v })} placeholder="https://..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Image/Thumbnail (collapsible) */}
              <div>
                <button
                  onClick={() => setEmbedSections(s => ({ ...s, imagethumb: !s.imagethumb }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, marginBottom: embedSections.imagethumb ? 10 : 0,
                  }}
                >
                  <span style={{ color: RR.text2, fontSize: 16 }}>{embedSections.imagethumb ? '⊖' : '⊕'}</span>
                  <span style={{ color: RR.text2, fontSize: 13, fontWeight: 700 }}>Image / Thumbnail</span>
                </button>
                {embedSections.imagethumb && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <RRLabel>Image URL</RRLabel>
                      <RRInput value={form.embed.image_url || ''} onChange={v => setEmbed({ image_url: v })} placeholder="https://..." />
                    </div>
                    <div style={{ flex: 1 }}>
                      <RRLabel>Thumbnail URL</RRLabel>
                      <RRInput value={form.embed.thumbnail_url || ''} onChange={v => setEmbed({ thumbnail_url: v })} placeholder="https://..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer (collapsible) */}
              <div>
                <button
                  onClick={() => setEmbedSections(s => ({ ...s, footer: !s.footer }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, marginBottom: embedSections.footer ? 10 : 0,
                  }}
                >
                  <span style={{ color: RR.text2, fontSize: 16 }}>{embedSections.footer ? '⊖' : '⊕'}</span>
                  <span style={{ color: RR.text2, fontSize: 13, fontWeight: 700 }}>Footer</span>
                </button>
                {embedSections.footer && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <RRLabel>Footer Text</RRLabel>
                      <RRInput value={form.embed.footer_text || ''} onChange={v => setEmbed({ footer_text: v })} placeholder="Footer text" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <RRLabel>Footer Icon URL</RRLabel>
                      <RRInput value={form.embed.footer_icon || ''} onChange={v => setEmbed({ footer_icon: v })} placeholder="https://..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Fields (collapsible) */}
              <div>
                <button
                  onClick={() => setEmbedSections(s => ({ ...s, fields: !s.fields }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, marginBottom: embedSections.fields ? 10 : 0,
                  }}
                >
                  <span style={{ color: RR.text2, fontSize: 16 }}>{embedSections.fields ? '⊖' : '⊕'}</span>
                  <span style={{ color: RR.text2, fontSize: 13, fontWeight: 700 }}>Fields</span>
                </button>
                {embedSections.fields && (
                  <div style={{ marginTop: 8 }}>
                    {(form.embed.fields || []).map((field, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, padding: 10, background: RR.card2, borderRadius: 6 }}>
                        <div style={{ flex: 1 }}>
                          <RRInput value={field.name || ''} onChange={v => {
                            const newFields = [...(form.embed.fields || [])]
                            newFields[idx] = { ...newFields[idx], name: v }
                            setEmbed({ fields: newFields })
                          }} placeholder="Field name" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <RRInput value={field.value || ''} onChange={v => {
                            const newFields = [...(form.embed.fields || [])]
                            newFields[idx] = { ...newFields[idx], value: v }
                            setEmbed({ fields: newFields })
                          }} placeholder="Field value" />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', color: RR.text2, fontSize: 12 }}>
                          <input type="checkbox" checked={field.inline || false} onChange={e => {
                            const newFields = [...(form.embed.fields || [])]
                            newFields[idx] = { ...newFields[idx], inline: e.target.checked }
                            setEmbed({ fields: newFields })
                          }} />
                          Inline
                        </label>
                        <button onClick={() => {
                          const newFields = (form.embed.fields || []).filter((_, i) => i !== idx)
                          setEmbed({ fields: newFields })
                        }} style={{ background: 'none', border: 'none', color: RR.textDis, cursor: 'pointer', fontSize: 18 }}>×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEmbed({ fields: [...(form.embed.fields || []), { name: '', value: '', inline: false }] })}
                      style={{
                        background: 'none', border: `1px dashed ${RR.border}`, borderRadius: 6,
                        padding: '8px 16px', color: RR.text2, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      + Add Field
                    </button>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div>
                <RRLabel>Preview</RRLabel>
                <div style={{
                  borderLeft: `4px solid ${form.embed.color || '#cc2222'}`,
                  background: '#23232d',
                  borderRadius: '0 8px 8px 0',
                  padding: 14,
                  minHeight: 60,
                }}>
                  {form.embed.author_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {form.embed.author_icon && <img src={form.embed.author_icon} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                      <span style={{ color: RR.text1, fontSize: 13, fontWeight: 600 }}>{form.embed.author_name}</span>
                    </div>
                  )}
                  {form.embed.title && (
                    <div style={{ color: RR.text1, fontWeight: 700, fontSize: 15, marginBottom: form.embed.description ? 6 : 0 }}>
                      {form.embed.title_url ? <a href={form.embed.title_url} style={{ color: '#5865f2' }}>{form.embed.title}</a> : form.embed.title}
                    </div>
                  )}
                  {form.embed.description && (
                    <div style={{ color: RR.text2, fontSize: 13, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{form.embed.description}</div>
                  )}
                  {(form.embed.fields || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {form.embed.fields.map((f, i) => (
                        <div key={i} style={{ flex: f.inline ? '0 0 calc(33.33% - 6px)' : '1 1 100%', minWidth: f.inline ? 120 : 'auto' }}>
                          <div style={{ color: RR.text1, fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{f.name || 'Field Name'}</div>
                          <div style={{ color: RR.text2, fontSize: 12 }}>{f.value || 'Field value'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.embed.image_url && (
                    <img src={form.embed.image_url} alt="" style={{ maxWidth: '100%', borderRadius: 6, marginTop: 8 }} />
                  )}
                  {form.embed.thumbnail_url && (
                    <img src={form.embed.thumbnail_url} alt="" style={{ maxWidth: 80, borderRadius: 6, float: 'right', marginLeft: 10 }} />
                  )}
                  {form.embed.footer_text && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${RR.border}` }}>
                      {form.embed.footer_icon && <img src={form.embed.footer_icon} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }} />}
                      <span style={{ color: RR.text2, fontSize: 11 }}>{form.embed.footer_text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={() => setEmbedModalOpen(false)}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: RR.accent, border: 'none', color: '#fff', cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                Save Embed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Placeholder ───────────────────────────────────────────────────────────────
function PlaceholderPanel({ label, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(84,0,0,0.12)', border: '1px solid rgba(84,0,0,0.25)' }}>
        <Icon size={28} style={{ color: '#8b0000' }} />
      </div>
      <h3 className="mb-2" style={{ color: 'var(--text-1)' }}>{label}</h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-3)' }}>
        Coming soon. Use bot commands to configure this module for now.
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Manage() {
  const { guildId } = useParams()
  const navigate = useNavigate()
  const [guild, setGuild] = useState(null)
  const [botStatus, setBotStatus] = useState(null)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(true)  // default true until check completes
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getMe().then(r => setUser(r.data)).catch(() => { })
    getGuild(guildId).then(r => setGuild(r.data)).catch(() => { })
    getBotStatus().then(r => setBotStatus(r.data)).catch(() => { })
    // Check if user can manage this guild
    getMemberCheck(guildId).then(r => {
      setIsAdmin(r.data?.is_admin || r.data?.is_owner || false)
    }).catch(() => setIsAdmin(false))
  }, [guildId])

  async function handlePrefixSave(prefix) {
    await updatePrefix(guildId, prefix)
    setGuild(prev => ({ ...prev, prefix }))
  }

  const avatarUrl = user?.avatar_url
    || (user?.avatar && user?.sub
      ? `https://cdn.discordapp.com/avatars/${user.sub}/${user.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png')

  const online = botStatus?.online && (Date.now() / 1000 - (botStatus?.last_seen || 0)) < 90

  function renderContent() {
    switch (active) {
      case 'overview': return <OverviewPanel guild={guild} botStatus={botStatus} />
      case 'commands': return <CommandsPanel guildId={guildId} />
      case 'settings': return <SettingsPanel guild={guild} onPrefixSave={handlePrefixSave} />
      case 'logs': return <ActionLogPanel guildId={guildId} />
      case 'automod': return <AutoModPanel guildId={guildId} />
      case 'welcomer': return <WelcomerPanel guildId={guildId} />
      case 'customcmds': return <CustomCommandsPanel guildId={guildId} />
      case 'giveaways': return <GiveawaysPanel guildId={guildId} />
      case 'autoresponder': return <AutoResponderPanel guildId={guildId} />
      case 'moderation': return <ModerationPanel guildId={guildId} />
      case 'reactionroles': return <ReactionRolesPanel guildId={guildId} />
      default: {
        const mod = MODULES.flatMap(s => s.items).find(i => i.id === active)
        return <PlaceholderPanel label={mod?.label || active} icon={mod?.icon || Settings} />
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static z-30 h-full w-56 flex flex-col shrink-0
                    transition-transform duration-200
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
      >
        {/* Back + guild */}
        <div className="px-3 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => navigate('/servers')}
            className="flex items-center gap-1.5 text-xs mb-3 transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <ArrowLeft size={12} /> All Servers
          </button>
          <div className="flex items-center gap-2.5">
            <GuildAvatar guild={guild} size={9} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                {guild?.name || '…'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-d)' }}>
                {guild?.member_count?.toLocaleString() || '—'} members
              </p>
            </div>
            <button className="lg:hidden" style={{ color: 'var(--text-3)' }}
              onClick={() => setSidebarOpen(false)}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Modules */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {MODULES.map(({ section, items }) => (
            <div key={section}>
              <p className="nav-section-label">{section}</p>
              <div className="space-y-0.5 mt-1">
                {items.map(({ id, label, icon: Icon }) => (
                  <button key={id}
                    onClick={() => { setActive(id); setSidebarOpen(false) }}
                    className={`nav-item w-full ${active === id ? 'active' : ''}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-1">
            <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full"
              style={{ border: '1px solid var(--border)' }} />
            <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--text-2)' }}>
              {user?.username || '…'}
            </span>
            <button onClick={() => { localStorage.clear(); navigate('/login') }}
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 h-14 shrink-0"
          style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--border)' }}>
          <button className="lg:hidden" style={{ color: 'var(--text-3)' }}
            onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:block" style={{ color: 'var(--text-3)' }}>{guild?.name}</span>
            <ChevronRight size={13} className="hidden sm:block" style={{ color: 'var(--text-d)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-1)' }}>
              {MODULES.flatMap(s => s.items).find(i => i.id === active)?.label || 'Overview'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-g-success' : 'bg-g-error'}`}
              style={{ boxShadow: online ? '0 0 5px #2ECC71' : '0 0 5px #E74C3C' }} />
            <span className="text-xs hidden sm:block" style={{ color: 'var(--text-3)' }}>
              {online ? `${Math.round(botStatus?.latency_ms || 0)}ms` : 'Offline'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* Read-only banner for non-admins */}
          {!isAdmin && (
            <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
              style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)' }}>
              <Shield size={16} style={{ color: '#FFC107' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#FFC107' }}>Read-Only Mode</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,193,7,0.8)' }}>
                  You need Administrator or Manage Server permission to modify settings.
                </p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
