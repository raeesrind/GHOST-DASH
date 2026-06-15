import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronRight, ArrowLeft, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const SECTIONS = [
  {
    id: 'acceptance',
    label: '1. Acceptance of Terms',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          By inviting GHOST Bot ("the Bot") to your Discord server, using any of its commands
          or features, or accessing the web dashboard at{' '}
          <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: 'rgba(84,0,0,0.15)', color: 'var(--c3)' }}>ghostbot.qzz.io</code>
          , you agree to be bound by these Terms of Service ("Terms"). If you do not agree
          to these Terms, do not use the Bot or dashboard.
        </p>
      </div>
    ),
  },
  {
    id: 'eligibility',
    label: '2. Eligibility',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <ul className="space-y-3 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>You must be at least <strong>13 years of age</strong> to use GHOST Bot, in compliance with Discord's Terms of Service and the Children's Online Privacy Protection Act (COPPA).</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>You must comply with <a href="https://discord.com/terms" target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1" style={{ color: 'var(--c3)' }}>Discord's Terms of Service<ExternalLink size={10} /></a> and <a href="https://discord.com/guidelines" target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1" style={{ color: 'var(--c3)' }}>Community Guidelines<ExternalLink size={10} /></a>.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>You may not use the Bot or dashboard for any illegal or unauthorized purpose.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>Server administrators who add GHOST Bot to their server are responsible for ensuring that their members comply with these Terms.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'bot-use',
    label: '3. Proper Use of the Bot',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <p>You agree to use GHOST Bot responsibly. The following behaviors are strictly prohibited:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Abuse & Exploitation:</strong> Do not attempt to crash, overload, exploit bugs, or disrupt the bot's operation. Do not use the bot to spam, flood, or harass others.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Automation:</strong> Do not use self-bots, user-bots, macros, scripts, or any form of automation to interact with GHOST Bot. All interactions must be performed manually through a legitimate Discord client.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Impersonation:</strong> Do not impersonate the bot, its developers, or other users through the bot's features (custom commands, auto-responders).</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Reverse Engineering:</strong> Do not reverse-engineer, decompile, or attempt to extract the bot's source code, API keys, or database contents.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>Illegal Content:</strong> Do not use the bot to share, generate, or promote illegal content, hate speech, harassment, or any content that violates applicable laws.</div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <div><strong>AI Misuse:</strong> Do not use the AI chat feature to generate harmful, abusive, or inappropriate content. AI responses are processed through third-party providers (Groq / OpenRouter) and subject to their acceptable use policies.</div>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard-use',
    label: '4. Proper Use of the Dashboard',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <ul className="space-y-3 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>Dashboard access requires authentication via Discord OAuth2. You may only access servers where you have the appropriate permissions (Manage Server or Administrator).</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>Do not attempt to access server configurations for servers you do not administrate.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>Do not tamper with the dashboard's API endpoints, attempt to escalate privileges, or inject malicious payloads.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
            <span>Dashboard access may be revoked at any time for violation of these Terms, without notice.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'moderation',
    label: '5. Moderation Actions',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <p>GHOST Bot provides moderation tools that server administrators and moderators may use at their discretion:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>Commands such as <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>warn</code>, <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>mute</code>, <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>kick</code>, <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>ban</code>, <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>jail</code>, and <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(84,0,0,0.15)' }}>demote</code> are initiated by server staff and executed by the bot. The bot developers are not responsible for how server staff use these tools.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>AutoMod is configured by server administrators and enforces rules automatically. The bot developers are not responsible for the rules configured or their enforcement.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>The bot owner reserves the right to <strong>blacklist</strong> any user or server from using GHOST Bot for violation of these Terms, without prior notice or refund (if applicable).</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'availability',
    label: '6. Service Availability',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>GHOST Bot is provided "as is" and "as available." We do not guarantee 100% uptime. The bot may be taken offline for maintenance, updates, or due to factors beyond our control.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>Features may be added, modified, or removed at any time without prior notice.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span>Data (XP, economy balances, configuration) may be reset or migrated during major updates. We will make reasonable efforts to preserve data, but cannot guarantee against data loss.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'liability',
    label: '7. Disclaimer of Warranty & Limitation of Liability',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--err)' }}>Disclaimer of Warranty</h4>
            <p>
              GHOST Bot is provided <strong>without warranty of any kind</strong>, express or implied,
              including but not limited to the warranties of merchantability, fitness for a particular purpose,
              and non-infringement. The bot developers make no guarantee that the bot will meet your requirements
              or be error-free, secure, or uninterrupted.
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--err)' }}>Limitation of Liability</h4>
            <p>
              In no event shall the bot developers be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to loss of data, server disruption,
              or financial loss arising out of or in connection with the use or inability to use GHOST Bot
              or the dashboard.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'indemnification',
    label: '8. Indemnification',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          You agree to indemnify, defend, and hold harmless the GHOST Bot developers from any claims,
          liabilities, damages, losses, or expenses (including legal fees) arising out of your use of the
          bot or dashboard, your violation of these Terms, or your violation of any third-party rights.
        </p>
      </div>
    ),
  },
  {
    id: 'termination',
    label: '9. Termination',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4 leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Voluntary removal:</strong> Server administrators may remove GHOST Bot from their server at any time. This stops data collection for that server but existing data persists until deletion is requested.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Blacklisting:</strong> We reserve the right to blacklist any user or server for violation of these Terms. Blacklisted parties will be unable to use the bot.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--c3)' }} />
              <span><strong>Dashboard access:</strong> Dashboard authentication can be revoked at any time without notice for violation of these Terms.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'changes',
    label: '10. Changes to These Terms',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          We reserve the right to update or modify these Terms at any time. Changes will be posted on this
          page with an updated "Last Updated" date. Your continued use of GHOST Bot or the dashboard after
          changes are posted constitutes your acceptance of the new Terms. It is your responsibility to
          review these Terms periodically.
        </p>
      </div>
    ),
  },
  {
    id: 'governing-law',
    label: '11. Governing Law',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="leading-relaxed" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
          in which the bot owner resides, without regard to its conflict of law provisions. Any disputes
          arising under these Terms shall be resolved through informal negotiation or through Discord
          moderation channels.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    label: '12. Contact Information',
    content: () => (
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="leading-relaxed mb-4" style={{ color: 'var(--tx-2)', fontSize: 15 }}>
          For questions about these Terms, or to report violations, contact:
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(84,0,0,0.08)' }}>
            <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>Discord:</span>
            <span style={{ color: 'var(--c3)' }}>adrind01</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(84,0,0,0.08)' }}>
            <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>Email:</span>
            <span style={{ color: 'var(--c3)' }}>jrrais2003@gmail.com</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(84,0,0,0.08)' }}>
            <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>Support:</span>
            <span style={{ color: 'var(--c3)' }}>ghostbot.qzz.io/support</span>
          </div>
        </div>
      </div>
    ),
  },
]

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance')

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
                  <FileText size={15} style={{ color: 'var(--c3)' }} />
                </div>
                <h2 className="font-bold text-sm" style={{ color: 'var(--tx-1)' }}>Terms of Service</h2>
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
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--tx-1)' }}>Terms of Service</h1>
              <p className="text-xs" style={{ color: 'var(--tx-3)' }}>Last Updated: June 13, 2026</p>
            </div>
            {SECTIONS.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mb-8 scroll-mt-24"
              >
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--tx-1)' }}>
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
        <Link to="/privacy-policy" className="hover:underline" style={{ color: 'var(--tx-3)' }}>Privacy Policy</Link>
      </footer>
    </div>
  )
}
