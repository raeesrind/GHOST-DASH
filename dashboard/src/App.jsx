import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Landing from './pages/Landing'
import Login from './pages/Login'
import ServerSelector from './pages/ServerSelector'
import Manage from './pages/Manage'
import Dashboard from './pages/Dashboard'
import Commands from './pages/Commands'
import CommandsList from './pages/CommandsList'
import Statistics from './pages/Statistics'
import StatusPage from './pages/StatusPage'
import Stats from './pages/Stats'
import Status from './pages/Status'
import Settings from './pages/Settings'
import Support from './pages/Support'
import DashLayout from './components/DashLayout'

function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      window.location.href = '/login?error=' + error
      return
    }
    if (!token) {
      window.location.href = '/login'
      return
    }

    localStorage.setItem('ghost_token', token)
    window.location.href = '/servers'
  }, [])
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-ghost-dark gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-t-transparent"
        style={{ borderColor: '#540000', borderTopColor: 'transparent' }}
      />
      <p className="text-gray-400 text-sm">Authenticating with Discord...</p>
    </div>
  )
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('ghost_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/servers" element={<RequireAuth><ServerSelector /></RequireAuth>} />
        <Route path="/manage/:guildId" element={<RequireAuth><Manage /></RequireAuth>} />
        <Route path="/commands-list" element={<CommandsList />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<RequireAuth><DashLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="commands" element={<Commands />} />
          <Route path="stats" element={<Stats />} />
          <Route path="status" element={<Status />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
