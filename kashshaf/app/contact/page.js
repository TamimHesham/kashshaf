'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Toast from '../../components/Toast'

export default function ContactPage() {
  const router = useRouter()
  const [form, setForm] = useState({ orgName: '', role: '', phone: '', email: '', targetPositions: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function submit() {
    if (!form.email || !form.orgName) { alert('Please fill in your organisation name and email.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setToast('Request received! We\'ll contact you within 24 hours ✓')
        setTimeout(() => router.push('/'), 2000)
      }
    } catch {}
    setLoading(false)
  }

  const inputStyle = { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1a2e1a', marginBottom: '6px' }}>Request Club Access</h1>
        <p style={{ fontSize: '13px', color: '#336633', marginBottom: '20px', lineHeight: 1.6 }}>Tell us about your organisation and what you're looking for. We'll set up your access within 24 hours.</p>

        <div style={{ background: '#fff', border: '2px solid #cce8cc', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          <label style={labelStyle}>Organisation name</label>
          <input style={inputStyle} placeholder="e.g. Al Ahly Academy, Pyramids FC" value={form.orgName} onChange={set('orgName')} />

          <label style={labelStyle}>Your role</label>
          <select style={inputStyle} value={form.role} onChange={set('role')}>
            <option value="">Select</option>
            {['Club Director', 'Head Coach', 'Scout / Agent', 'Academy Manager', 'Other'].map(r => <option key={r}>{r}</option>)}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={labelStyle}>Phone</label><input style={inputStyle} type="tel" placeholder="e.g. 010 1234 5678" value={form.phone} onChange={set('phone')} /></div>
            <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} /></div>
          </div>

          <label style={labelStyle}>Which positions / age groups are you targeting?</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} placeholder="e.g. U17-U19 central midfielders and strikers across Cairo and Giza" value={form.targetPositions} onChange={set('targetPositions')} />
        </div>

        <button onClick={submit} disabled={loading}
          style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}>
          {loading ? 'Sending...' : 'Send request'}
        </button>
        <p style={{ fontSize: '11px', color: '#336633', textAlign: 'center', marginTop: '8px' }}>We'll get back to you within 24 hours to set up your access</p>
      </main>
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
