/**
 * Axios API client for the GHOST Dashboard backend.
 */
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE })

// Attach JWT from localStorage on every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('ghost_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const getMe           = () => api.get('/auth/me')
export const getDiscordGuilds= () => api.get('/auth/guilds')

/**
 * Direct Discord OAuth URL — goes straight to backend (bypasses Vite proxy).
 * The backend /auth/discord redirects to Discord OAuth.
 * Must NOT go through the Vite proxy because the proxy doesn't handle 307 redirects to external URLs correctly.
 */
export function loginUrl() {
  // Always point directly to the backend, not through the Vite proxy
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${backendUrl}/auth/discord`
}

// Helper: build Discord avatar URL from user object
export function avatarUrl(user) {
  if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png'
  if (user.avatar_url) return user.avatar_url
  if (user.avatar && user.sub)
    return `https://cdn.discordapp.com/avatars/${user.sub}/${user.avatar}.png?size=128`
  return `https://cdn.discordapp.com/embed/avatars/${Number(user.sub || 0) % 5}.png`
}

// ── Guilds ────────────────────────────────────────────────────────────────────
export const getGuilds    = ()          => api.get('/guilds')
export const getGuild     = (id)        => api.get(`/guild/${id}`)
export const updatePrefix = (id, pfx)   => api.post(`/guild/${id}/prefix?prefix=${encodeURIComponent(pfx)}`)

// ── Commands ──────────────────────────────────────────────────────────────────
export const getCommands  = (guildId)   => api.get(`/guild/${guildId}/commands`)
export const updateCommand= (guildId, payload) => api.post(`/guild/${guildId}/commands/update`, payload)

// ── Logs ──────────────────────────────────────────────────────────────────────
export const getLogs      = (guildId, limit = 50) => api.get(`/guild/${guildId}/logs?limit=${limit}`)

// ── Action Log ────────────────────────────────────────────────────────────────
export const getActionLog  = (guildId)          => api.get(`/guild/${guildId}/actionlog`)
export const saveActionLog = (guildId, payload)  => api.post(`/guild/${guildId}/actionlog`, payload)
export const getGuildChannels = (guildId)        => api.get(`/guild/${guildId}/channels`)
export const getGuildRoles    = (guildId)        => api.get(`/guild/${guildId}/roles`)
export const getGuildEmojis   = (guildId)        => api.get(`/guild/${guildId}/emojis`)

// ── AutoMod ───────────────────────────────────────────────────────────────────
export const getAutoMod  = (guildId)          => api.get(`/guild/${guildId}/automod`)
export const saveAutoMod = (guildId, payload)  => api.post(`/guild/${guildId}/automod`, payload)

// ── Welcomer ──────────────────────────────────────────────────────────────────
export const getWelcomer  = (guildId)          => api.get(`/guild/${guildId}/welcomer`)
export const saveWelcomer = (guildId, payload)  => api.post(`/guild/${guildId}/welcomer`, payload)

// ── Custom Commands ───────────────────────────────────────────────────────────
export const getCustomCommands    = (guildId)          => api.get(`/guild/${guildId}/custom-commands`)
export const createCustomCommand  = (guildId, payload)  => api.post(`/guild/${guildId}/custom-commands`, payload)
export const deleteCustomCommand  = (guildId, trigger)  => api.delete(`/guild/${guildId}/custom-commands/${encodeURIComponent(trigger)}`)
export const toggleCustomCommand  = (guildId, trigger, enabled) => api.patch(`/guild/${guildId}/custom-commands/${encodeURIComponent(trigger)}/toggle`, { enabled })

// ── Auto Responder ────────────────────────────────────────────────────────────
export const getAutoResponders    = (guildId)          => api.get(`/guild/${guildId}/autoresponder`)
export const saveAutoResponder    = (guildId, payload)  => api.post(`/guild/${guildId}/autoresponder`, payload)
export const deleteAutoResponder  = (guildId, id)       => api.delete(`/guild/${guildId}/autoresponder/${id}`)
export const toggleAutoResponder  = (guildId, id, enabled) => api.patch(`/guild/${guildId}/autoresponder/${id}/toggle`, { enabled })

// ── Giveaways ─────────────────────────────────────────────────────────────────
export const getGiveaways         = (guildId)          => api.get(`/guild/${guildId}/giveaways`)
export const getGiveawaySettings  = (guildId)          => api.get(`/guild/${guildId}/giveaways/settings`)
export const saveGiveawaySettings = (guildId, payload)  => api.post(`/guild/${guildId}/giveaways/settings`, payload)
export const endGiveaway          = (guildId, msgId)    => api.post(`/guild/${guildId}/giveaways/end/${msgId}`)
export const deleteGiveaway       = (guildId, msgId)    => api.delete(`/guild/${guildId}/giveaways/${msgId}`)
export const getModerationSettings  = (guildId)          => api.get(`/guild/${guildId}/moderation-settings`)
export const saveModerationSettings = (guildId, payload)  => api.post(`/guild/${guildId}/moderation-settings`, payload)

// ── Reaction Roles ────────────────────────────────────────────────────────────
export const getReactionRoles  = (guildId)          => api.get(`/guild/${guildId}/reaction-roles`)
export const saveReactionRole  = (guildId, payload)  => api.post(`/guild/${guildId}/reaction-roles`, payload)
export const deleteReactionRole= (guildId, id)       => api.delete(`/guild/${guildId}/reaction-roles/${id}`)
export const postReactionRole  = (guildId, id)       => api.post(`/guild/${guildId}/reaction-roles/${id}/post`)

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getStats      = ()          => api.get('/stats')
export const getPublicStats= ()          => api.get('/public-stats')  // no auth needed

// ── Bot status ────────────────────────────────────────────────────────────────
export const getBotStatus    = ()          => api.get('/bot-status')
export const getPublicStatus = ()          => api.get('/public-status')

export default api
