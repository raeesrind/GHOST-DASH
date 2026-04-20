import React, { useState } from 'react'
import { Globe, Plus, ChevronDown, Calendar, Copy, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnalyticsPanel({ botStatus }) {
  const [pkgManager, setPkgManager] = useState('npm')
  const online = botStatus?.online && (Date.now() / 1000 - (botStatus?.last_seen || 0)) < 90

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Header info (Vercel style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)]">
            <Globe size={14} className="opacity-50" />
            <span className="text-sm font-medium text-[var(--tx-1)]">ghostbot.qzz.io</span>
            <Plus size={12} className="opacity-50" />
            <span className="text-xs opacity-50">1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-[var(--ok)]' : 'bg-[var(--err)]'}`} />
            <span className="text-xs opacity-50">{online ? '0' : 'offline'} online</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-h)] transition-colors">
            <span className="text-xs font-medium text-[var(--tx-1)]">All environments</span>
            <ChevronDown size={14} className="opacity-50" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-h)] transition-colors">
            <Calendar size={14} className="opacity-50" />
            <span className="text-xs font-medium text-[var(--tx-1)]">Last 7 Days</span>
            <ChevronDown size={14} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--tx-1)] tracking-tight">Get Started</h1>
        <p className="text-[var(--tx-3)] mt-1">To start counting visitors and page views, follow these steps.</p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="surface p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-full bg-[var(--tx-1)] text-[var(--bg)] flex items-center justify-center font-bold text-sm">1</div>
            <h3 className="text-lg font-bold text-[var(--tx-1)]">Install our package</h3>
          </div>
          <p className="text-sm text-[var(--tx-3)] mb-4">
            Start by <span className="text-[var(--tx-1)] font-medium">installing @vercel/analytics</span> in your existing project.
          </p>

          <div className="mt-auto bg-[var(--bg)] rounded-lg border border-[var(--border)] overflow-hidden">
            <div className="flex items-center bg-[var(--surface)] border-b border-[var(--border)] px-2">
              {['npm', 'yarn', 'pnpm'].map(mgr => (
                <button
                  key={mgr}
                  onClick={() => setPkgManager(mgr)}
                  className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                    pkgManager === mgr ? 'border-[var(--brand)] text-[var(--tx-1)]' : 'border-transparent text-[var(--tx-3)] hover:text-[var(--tx-2)]'
                  }`}
                >
                  {mgr}
                </button>
              ))}
              <div className="ml-auto pr-2">
                <button onClick={() => copyToClipboard(pkgManager === 'npm' ? 'npm i @vercel/analytics' : pkgManager === 'yarn' ? 'yarn add @vercel/analytics' : 'pnpm add @vercel/analytics')}>
                  <Copy size={13} className="text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <code className="text-xs font-mono text-[var(--brand)]">
                {pkgManager === 'npm' ? 'npm i @vercel/analytics' : pkgManager === 'yarn' ? 'yarn add @vercel/analytics' : 'pnpm add @vercel/analytics'}
              </code>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="surface p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-full bg-[var(--tx-1)] text-[var(--bg)] flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="text-lg font-bold text-[var(--tx-1)]">Add the React component</h3>
          </div>
          <p className="text-sm text-[var(--tx-3)] mb-4 leading-relaxed">
            Import and use the <code className="bg-[var(--surface)] px-1 rounded text-[var(--tx-2)]">&lt;Analytics /&gt;</code> React component into your app&apos;s layout.
          </p>

          <div className="mt-auto bg-[var(--bg)] rounded-lg border border-[var(--border)] overflow-hidden p-4 relative group">
            <button 
               onClick={() => copyToClipboard(`import { Analytics } from '@vercel/analytics/react';\n\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>\n        {children}\n        <Analytics />\n      </body>\n    </html>\n  );\n}`)}
               className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Copy size={13} className="text-[var(--tx-3)] hover:text-[var(--tx-1)]" />
            </button>
            <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto">
              <span className="text-pink-500">import</span> {'{ Analytics }'} <span className="text-pink-500">from</span> <span className="text-emerald-500">&apos;@vercel/analytics/react&apos;</span>;
              {'\n\n'}
              <span className="text-[var(--tx-3)] text-[10px]">For full examples and further reference, please refer to our <span className="text-[var(--brand)] hover:underline cursor-pointer">documentation</span></span>
            </pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className="surface p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-full bg-[var(--tx-1)] text-[var(--bg)] flex items-center justify-center font-bold text-sm">3</div>
            <h3 className="text-lg font-bold text-[var(--tx-1)]">Deploy & Visit your Site</h3>
          </div>
          <p className="text-sm text-[var(--tx-3)] mb-4 leading-relaxed">
            Deploy your changes and visit the deployment to collect your page views.
          </p>
          <p className="text-xs text-[var(--tx-3)] leading-relaxed mt-auto border-l-2 border-[var(--border)] pl-4 italic">
            If you don&apos;t see data after 30 seconds, please check for content blockers and try to navigate between pages on your site.
          </p>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="surface p-5 mt-4 flex items-center justify-between group overflow-hidden relative">
        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
            <Activity size={18} className="text-[var(--brand)]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--tx-1)]">Implement with Ghost Agent</h4>
            <p className="text-xs text-[var(--tx-3)]">Automatically generate a pull request with Web Analytics configured.</p>
          </div>
        </div>
        <button className="btn btn-primary z-10 group-hover:scale-105 transition-transform">
          Enable with Agent
        </button>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[var(--brand)]/5 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
