import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const CONTACTS = [
    {
        label: 'Discord',
        handle: 'adrind01',
        desc: 'DM me directly on Discord',
        href: 'https://discord.com/users/1329810301486501888',
        color: '#5865F2',
        glow: 'rgba(88,101,242,0.35)',
        icon: (
            // Official Discord logo SVG
            <svg width="28" height="28" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0A40.7 40.7 0 0 0 25.6.4 58.4 58.4 0 0 0 11 4.9C1.6 19.1-.9 33 .3 46.6a58.9 58.9 0 0 0 18 9.1 44.4 44.4 0 0 0 3.8-6.2 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42 42 0 0 0 36 0l1.5 1.1a38.4 38.4 0 0 1-6 2.9 44.4 44.4 0 0 0 3.8 6.2 58.7 58.7 0 0 0 18-9.1C72 30.9 68.2 17.1 60.1 4.9ZM23.7 38.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Z" />
            </svg>
        ),
    },
    {
        label: 'Instagram',
        handle: '@ad_rind1',
        desc: 'Follow or DM on Instagram',
        href: 'https://instagram.com/ad_rind1',
        color: '#E1306C',
        glow: 'rgba(225,48,108,0.35)',
        icon: (
            // Official Instagram logo SVG
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
        ),
    },
    {
        label: 'Email',
        handle: 'jrrais2003@gmail.com',
        desc: 'Send me an email',
        href: 'mailto:jrrais2003@gmail.com',
        color: '#EA4335',
        glow: 'rgba(234,67,53,0.35)',
        icon: (
            // Gmail / envelope icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
        ),
    },
]

export default function Support() {
    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <div className="text-5xl mb-4">👻</div>
                    <h1 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--tx-1)' }}>
                        Get in Touch
                    </h1>
                    <p style={{ color: 'var(--tx-3)', fontSize: 15 }}>
                        Need help with GHOST Bot? Reach out through any of the channels below.
                    </p>
                </motion.div>

                {/* Contact cards */}
                <div className="flex flex-col gap-4">
                    {CONTACTS.map(({ label, handle, desc, href, color, glow, icon }, i) => (
                        <motion.a
                            key={label}
                            href={href}
                            target={href.startsWith('mailto') ? '_self' : '_blank'}
                            rel="noreferrer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-5 p-5 rounded-2xl no-underline group"
                            style={{
                                background: 'var(--surface)',
                                border: `1px solid rgba(255,255,255,0.06)`,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                                cursor: 'pointer',
                                textDecoration: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.border = `1px solid ${color}55`
                                e.currentTarget.style.boxShadow = `0 4px 24px ${glow}`
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Icon circle */}
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                                style={{ background: `${color}18`, color }}
                            >
                                {icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-base mb-0.5" style={{ color: 'var(--tx-1)' }}>
                                    {label}
                                </p>
                                <p className="text-sm font-medium truncate" style={{ color }}>
                                    {handle}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--tx-3)' }}>
                                    {desc}
                                </p>
                            </div>

                            {/* Arrow */}
                            <svg
                                width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                                style={{ color: 'var(--tx-3)' }}
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </motion.a>
                    ))}
                </div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs mt-12"
                    style={{ color: 'var(--tx-3)' }}
                >
                    Usually responds within 24 hours 👻
                </motion.p>
            </div>
        </div>
    )
}
