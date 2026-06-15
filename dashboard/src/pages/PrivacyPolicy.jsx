import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ChevronRight, ArrowLeft, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const SECTIONS = [
  {
    id: 'introduction',
    label: 'Introduction',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <p>
          GHOST Bot ("we", "our", "the Bot") provides Discord server management,
          moderation, leveling, economy, and entertainment features through a
          Discord bot and a web dashboard. This Privacy Policy explains what
          personal data we collect, why we collect it, how we store and protect
          it, and your rights regarding your data.
        </p>
        <p>
          By using GHOST Bot or accessing the dashboard at{' '}
          <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: 'rgba(84,0,0,0.15)', color: 'var(--c3)' }}>ghostbot.qzz.io</code>
          , you agree to the collection and use of information in accordance
          with this policy.
        </p>
        <p><strong>Last Updated:</strong> June 13, 2026</p>
      </div>
    ),
  },
  {
    id: 'data-collection-bot',
    label: '1. Data Collected by the Bot',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <p>The Discord bot collects and stores the following categories of data:</p>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>a. Server & User Identifiers</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>User IDs, usernames, nicknames, and avatar URLs</strong> — for XP tracking, economy balances, moderation logs, AFK status, aura/class points, protection systems, slay lists, and giveaway entries</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Guild/server IDs, channel IDs, role IDs</strong> — for per-server configuration, reaction roles, lock/unlock, jail, mute, and all feature settings</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>b. Message Content</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Snipe data:</strong> The last 50 deleted messages, edited messages (before/after content), and removed reactions per channel are stored temporarily in a local database. Data is auto-pruned as new snipes replace old ones.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>AI/Chatbot messages:</strong> Messages sent to the AI chat feature are forwarded to third-party providers (Groq / OpenRouter) for processing. Message content is not permanently stored by the bot for AI purposes.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>AutoMod scanning:</strong> Messages are scanned in-memory against spam, caps, links, invites, mentions, duplicates, bad words, zalgo, emoji, and newline rules. No message content is stored from AutoMod processing.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Messenger system:</strong> Cross-guild inbox stores message routing maps (original channel, guild, author IDs) so authorized bot owners can reply. Message content is not stored server-side.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>c. Progression & Economy</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>XP and leveling data</strong> — per-user XP amounts, levels, XP cooldowns, multipliers (global/channel/role), level-up messages, role rewards, and leaderboard data</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Economy/Ghost Coins</strong> — balance amounts and transfers between users</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Aura and class points</strong> — aura points, power levels, and class assignment data per guild</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>d. Moderation & Enforcement</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Moderation logs</strong> — case numbers, warnings, mutes, kicks, bans, jail records, notes, demotions with user tags, moderator tags, reasons, durations, and timestamps</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Timed actions</strong> — temporary bans and mutes with expiry timestamps</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Ping protection</strong> — user IDs of protected users and Role-To-Mute configurations</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>e. Command Usage</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Command execution logs</strong> in the backend database (<code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>dashboard.db</code>) — guild ID, command name, user ID, user tag, and timestamp. Used for statistics and analytics.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>f. Guild Configuration</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>All per-server settings including prefix, disabled commands, command role-gating and cooldowns, AutoMod rules, action log channels, welcome message templates, custom commands, auto-responders, reaction roles, giveaway settings, moderation settings, leveling settings, and no-XP channels</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>g. Images & Media</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Background removal:</strong> Images submitted to the <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>removebg</code> command are sent to the Remove.bg API for processing. Images are not stored by the bot.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Action gifs:</strong> The bot fetches and serves animated gifs from external APIs for interactive commands (hug, kiss, slap, etc.). No media is stored server-side.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'data-collection-dashboard',
    label: '2. Data Collected by the Dashboard',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <p>When you access the web dashboard at <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: 'rgba(84,0,0,0.15)', color: 'var(--c3)' }}>ghostbot.qzz.io</code>, we collect:</p>

        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--tx-1)' }}>Discord OAuth2 Data</h4>
          <div className="space-y-3">
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--tx-1)' }}>Scopes requested:</p>
              <ul className="space-y-1.5 pl-4">
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>identify</code> — your Discord user ID, username, avatar, and discriminator</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>guilds</code> — list of Discord servers you belong to (to find mutual servers with the bot)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span><code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>email</code> — your Discord email address (used for account identification)</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--tx-1)' }}>Session handling:</p>
              <ul className="space-y-1.5 pl-4">
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span>A <strong>JWT (JSON Web Token)</strong> is created server-side containing your user ID, username, avatar, and discriminator. This token expires after <strong>24 hours</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span>The JWT is stored in your browser's <strong>localStorage</strong> under the key <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>ghost_token</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span>Your OAuth access token is held in server memory for <strong>10 minutes</strong> (for guild fetching), then discarded. It is never written to disk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
                  <span>The backend stores a <strong>guild cache</strong> in server memory (10-minute TTL) keyed by your user ID, containing your guild list and access token. This is used to compute mutual guilds with the bot.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--tx-1)' }}>What the Dashboard Does NOT Collect</h4>
          <ul className="space-y-1.5 pl-4">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>No IP addresses are logged or stored</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>No browser fingerprints or user-agent strings are stored</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>No analytics cookies or tracking scripts (beyond Vercel Analytics, see Section 4)</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>No file uploads, forms, or user-generated content on the dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'data-storage',
    label: '3. Data Storage & Retention',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>Storage Infrastructure</h4>
          <p>All data is stored in <strong>SQLite database files</strong> located on the bot's hosting server. Data is stored across multiple SQLite databases categorized by feature module (economy, moderation, utility, logging, and more).</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--tx-1)' }}>Retention Periods</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Guild configuration data:</strong> Retained until the bot is removed from the server or deletion is requested</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>User XP, economy, aura, AFK:</strong> Retained until the bot is removed from the server or deletion is requested</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Snipe data:</strong> Auto-pruned — maximum 50 deleted messages, 50 edited messages, and 50 removed reactions per channel; oldest entries are replaced by newer ones</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Latency history:</strong> Pruned after 48 hours</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Dashboard JWT sessions:</strong> Expire after 24 hours; no refresh tokens are stored</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Command usage logs:</strong> Retained indefinitely for analytics purposes</div>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'third-party',
    label: '4. Third-Party Services',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <p>The bot and dashboard interact with the following third-party services:</p>

        {[
          {
            name: 'Groq',
            purpose: 'AI chat completion provider',
            data: 'When you use the AI chat feature, your messages are sent to Groq for processing. No message content is permanently stored by the bot for this purpose.',
            url: 'https://groq.com',
          },
          {
            name: 'OpenRouter',
            purpose: 'AI fallback completion provider',
            data: 'If Groq is unavailable, messages may be routed through OpenRouter for processing.',
            url: 'https://openrouter.ai',
          },
          {
            name: 'Remove.bg',
            purpose: 'Image background removal',
            data: 'Images submitted via the removebg command are sent to the Remove.bg API. Images are not stored by the bot after processing.',
            url: 'https://remove.bg',
          },
          {
            name: 'Discord API (v10)',
            purpose: 'Bot operations and OAuth2 authentication',
            data: 'The bot communicates with Discord API for all server operations (sending messages, managing roles, fetching channel/role/emoji data). The dashboard uses Discord OAuth2 for authentication. API communications are encrypted via HTTPS.',
            url: 'https://discord.com/developers/docs',
          },
          {
            name: 'Vercel Analytics',
            purpose: 'Frontend analytics',
            data: 'The dashboard frontend uses @vercel/analytics for anonymous page view statistics. No personally identifiable information is collected.',
            url: 'https://vercel.com/analytics',
          },
          {
            name: 'Cloudflare',
            purpose: 'CDN and tunnel (cloudflared)',
            data: 'The backend is exposed via a Cloudflare tunnel. Cloudflare may process IP addresses and request metadata as part of standard CDN operations.',
            url: 'https://www.cloudflare.com',
          },
          {
            name: 'Firebase (planned/incomplete)',
            purpose: 'Future data storage',
            data: 'Firebase Admin SDK is initialized but not actively used for data storage at this time.',
            url: 'https://firebase.google.com',
          },
        ].map(svc => (
          <div key={svc.name} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold" style={{ color: 'var(--tx-1)' }}>{svc.name}</h4>
              <a href={svc.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs hover:underline" style={{ color: 'var(--c3)' }}>
                {new URL(svc.url).hostname} <ExternalLink size={10} />
              </a>
            </div>
            <p className="mb-1"><strong>Purpose:</strong> {svc.purpose}</p>
            <p><strong>Data shared:</strong> {svc.data}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'data-security',
    label: '5. Data Security',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Bot-to-backend communication</strong> is authenticated via a private API key.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Dashboard JWT tokens</strong> are signed using HS256 and verified on every authenticated API request.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>All Discord API communications</strong> use HTTPS encryption.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Database files</strong> are stored locally on the bot host and are not exposed publicly.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Sensitive configuration</strong> (bot tokens, API keys) is stored in environment variables, not in the codebase.</div>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'user-rights',
    label: '6. Your Rights',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Data deletion:</strong> You may request deletion of your personal data by contacting the bot owner (see Section 8). We will respond within 30 days.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Server data deletion:</strong> Server administrators can request full deletion of their server's data by contacting the bot owner or by removing the bot from their server. When the bot leaves a server, its configuration data persists until a deletion request is processed.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Data export:</strong> You may request an export of your XP, leveling, and economy data by contacting the bot owner.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Opt out of data collection:</strong> You may opt out of XP tracking by using the <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>enableleveling</code> command (server admins). Individual users cannot opt out of moderation logs, as those are necessary for server enforcement.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Access correction:</strong> You may request correction of inaccurate data (e.g., incorrect XP values) by contacting the bot owner.</div>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'coppa',
    label: '7. Children\'s Privacy (COPPA)',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p>
            GHOST Bot is not intended for use by children under <strong>13 years of age</strong>. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal data, please contact us immediately and we will delete that information.
          </p>
          <p className="mt-3">
            Use of GHOST Bot must comply with Discord's Terms of Service, which requires all users to be at least 13 years old.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'contact',
    label: '8. Contact Information',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p>For privacy-related inquiries, data deletion requests, or questions about this policy:</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(84,0,0,0.08)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>Discord:</span>
              <span style={{ color: 'var(--c3)' }}>adrind01</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(84,0,0,0.08)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>Email:</span>
              <span style={{ color: 'var(--c3)' }}>jrrais2003@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(84,0,0,0.08)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>Support Server:</span>
              <span style={{ color: 'var(--c3)' }}>Join via dashboard at ghostbot.qzz.io/support</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'changes',
    label: '9. Changes to This Policy',
    content: () => (
      <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of GHOST Bot or the dashboard after changes constitutes acceptance of the updated policy.
          </p>
          <p className="mt-3">
            Major changes may be announced via the bot's status page or support server.
          </p>
        </div>
      </div>
    ),
  },
]

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--tx-3)' }}>
            <ArrowLeft size={13} />
            Back to Home
          </Link>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar navigation */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:w-64 shrink-0"
          >
            <div className="lg:sticky lg:top-24 space-y-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(84,0,0,0.15)', border: '1px solid rgba(84,0,0,0.25)' }}>
                  <Shield size={15} style={{ color: 'var(--c3)' }} />
                </div>
                <h2 className="font-bold text-sm" style={{ color: 'var(--tx-1)' }}>Privacy Policy</h2>
              </div>
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id)
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    color: activeSection === s.id ? 'var(--tx-1)' : 'var(--tx-3)',
                    background: activeSection === s.id ? 'var(--brand-soft)' : 'transparent',
                    borderLeft: activeSection === s.id ? '2px solid var(--brand)' : '2px solid transparent',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.nav>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 min-w-0 max-w-3xl"
          >
            {SECTIONS.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mb-10 scroll-mt-24"
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--tx-1)' }}>
                  {section.label}
                </h3>
                <section.content />
              </motion.section>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--tx-3)' }}>
        <img src="/ghost.png" alt="GHOST" className="w-5 h-5 inline-block mr-2 opacity-40" />
        GHOST Bot Dashboard &copy; {new Date().getFullYear()}
        <span className="mx-2 opacity-30">|</span>
        <Link to="/terms" className="hover:underline" style={{ color: 'var(--tx-3)' }}>Terms of Service</Link>
      </footer>
    </div>
  )
}
