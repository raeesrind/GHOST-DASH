import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111118',
            color: '#fff',
            border: '1px solid #540000',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#540000', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
