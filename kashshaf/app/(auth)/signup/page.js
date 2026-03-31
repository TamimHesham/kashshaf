'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import { createClient } from '../../../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', club: '', role: 'coach' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function signup() {
    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all required fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, role: form.role, club_name: form.club }
      }
    })

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
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2e1a', marginBottom: '4px' }}>Join Kashshaf</h1>
          <p style={{ fontSize: '13px', color: '#336633', marginBottom: '20px' }}>Create an account to write reports and manage your scouted players.</p>

          {/* Role toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[['coach', 'Coach / Club'], ['fan', 'Scout / Fan']].map(([key, label]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, role: key }))}
                style={{ flex: 1, background: form.role === key ? '#1a2e1a' : '#f0f7f0', border: '2px solid #1a2e1a', color: form.role === key ? '#00e676' : '#1a2e1a', fontSize: '13px', fontWeight: 700, padding: '9px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {label}
              </button>
            ))}
          </div>

          {error && <div style={{ background: '#fff0f0', border: '2px solid #cc4444', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#cc4444' }}>{error}</div>}

          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} type="text" placeholder="Your name" value={form.fullName} onChange={set('fullName')} />
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" placeholder="Create a password (min 6 chars)" value={form.password} onChange={set('password')} />

          {form.role === 'coach' && (
            <>
              <label style={labelStyle}>Club / Academy</label>
              <input style={inputStyle} type="text" placeholder="e.g. Al Ahly Academy, Independent" value={form.club} onChange={set('club')} />
              <div style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#1a2e1a', lineHeight: 1.6, fontWeight: 600 }}>
                <strong style={{ display: 'block', marginBottom: '3px', fontWeight: 800 }}>Apply for verification after signing up</strong>
                Submit your coaching license or club letter. Verified coaches get a badge on all reports and a public profile. Reviewed within 48 hours.
              </div>
            </>
          )}

          <button onClick={signup} disabled={loading}
            style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1, marginBottom: '12px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#336633' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#00875a', fontWeight: 800, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </main>
    </>
  )
}
