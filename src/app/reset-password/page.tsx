'use client'

import { useState } from 'react'
import { CheckCircle2, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form')
  const [error, setError] = useState('')

  // Get token from URL on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const t = params.get('token')
      if (t) setToken(t)
    }
  })

  const handleSubmit = async () => {
    if (!token) { setError('No reset token found. Use the link from your email.'); setStatus('error'); return }
    if (password !== confirm) { setError('Passwords do not match'); setStatus('error'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); setStatus('error'); return }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
      } else {
        setError(data.error || 'Failed to reset password')
        setStatus('error')
      }
    } catch {
      setError('Network error. Try again.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 mb-3">
            <Lock className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your new password below</p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <p className="font-semibold text-white">Password Updated!</p>
            <p className="text-sm text-slate-400 mt-2">You can now log in with your new password.</p>
            <a href="/" className="inline-block mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-400">
              Go to Login
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password *</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!password || !confirm}
              className="w-full py-2.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset Password
            </button>
            <a href="/" className="block text-center text-sm text-slate-400 hover:text-sky-400">← Back to Eswatini Cars</a>
          </div>
        )}
      </div>
    </div>
  )
}
