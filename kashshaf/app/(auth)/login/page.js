'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import { createClient } from '../../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function login() {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    else router.push('/coach')
    setLoading(false)
  }

  const inputStyle = { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '380px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ background: '#fff', border: '2px solid #cce8cc', borderRadius: '10px', padding: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2e1a', marginBottom: '4px' }}>Sign in</h1>
          <p style={{ fontSize: '13px', color: '#336633', marginBottom: '20px' }}>Welcome back to Kashshaf</p>

          {error && <div style={{ background: '#fff0f0', border: '2px solid #cc4444', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#cc4444' }}>{error}</div>}

          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()} />

          <button onClick={login} disabled={loading}
            style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1, marginBottom: '12px' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#336633' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#00875a', fontWeight: 800, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </main>
    </>
  )
}
