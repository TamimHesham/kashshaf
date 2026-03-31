'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Toast from '../../components/Toast'

const S = {
  card: { background: '#fff', border: '2px solid #cce8cc', borderRadius: '10px', padding: '16px', marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' },
  input: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' },
  select: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' },
  textarea: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '90px', marginBottom: '12px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
}

export default function SubmitPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', age: '', position: '', governorate: '', club: '', sighting: '', video: '', submitter: '' })
  const [dupResults, setDupResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function checkDup(val) {
    if (val.length < 3) { setDupResults([]); return }
    const res = await fetch(`/api/players`)
    const json = await res.json()
    const matches = (json.players || []).filter(p => p.name.toLowerCase().includes(val.toLowerCase()))
    setDupResults(matches.slice(0, 3))
  }

  async function submit() {
    if (!form.name || !form.position || !form.sighting) { alert('Please fill in: player name, position, and what you saw.'); return }
    setLoading(true)
    try {
      // Create player
      const pRes = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, position: form.position, age: form.age, governorate: form.governorate, club: form.club, videoLink: form.video })
      })
      const pJson = await pRes.json()
      if (!pJson.player) throw new Error('Failed to create player')

      // Add sighting
      await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: pJson.player.id, submitterName: form.submitter || 'Anonymous', text: form.sighting, videoLink: form.video })
      })

      setToast('Player added to the Talent Wall ✓')
      setTimeout(() => router.push('/wall'), 1500)
    } catch (e) {
      alert('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1a2e1a', marginBottom: '14px' }}>Spot a Player</h1>

        <div style={S.card}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#336633', marginBottom: '12px' }}>Player details</h3>

          <label style={S.label}>Player name</label>
          <input style={S.input} type="text" placeholder="e.g. Ahmed Hassan" value={form.name}
            onChange={e => { set('name')(e); checkDup(e.target.value) }} />

          {/* Duplicate results */}
          {dupResults.length > 0 && (
            <div style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '7px', padding: '10px 12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#1a2e1a', marginBottom: '8px', fontWeight: 700 }}>We found players with a similar name. Is one of these your player?</div>
              {dupResults.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #aad4aa', fontSize: '13px', color: '#1a2e1a' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#336633' }}>{p.position} · {p.age} yrs · {p.governorate}</div>
                  </div>
                  <a href="/wall" style={{ background: '#1a2e1a', color: '#00e676', border: 'none', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '5px', textDecoration: 'none' }}>Add sighting</a>
                </div>
              ))}
              <div style={{ fontSize: '11px', color: '#336633', marginTop: '6px' }}>Not listed? Continue below to create a new profile.</div>
            </div>
          )}

          <div style={S.row}>
            <div><label style={S.label}>Age</label><input style={S.input} type="number" placeholder="e.g. 16" value={form.age} onChange={set('age')} /></div>
            <div>
              <label style={S.label}>Position</label>
              <select style={S.select} value={form.position} onChange={set('position')}>
                <option value="">Select</option>
                {['GK','CB','RB','LB','CDM','CM','CAM','ST','LW','RW'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={S.row}>
            <div>
              <label style={S.label}>Governorate</label>
              <select style={S.select} value={form.governorate} onChange={set('governorate')}>
                <option value="">Select</option>
                {['Cairo','Giza','Alexandria','Sharqia','Dakahlia','Qalyubia','Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Club (optional)</label><input style={S.input} type="text" placeholder="e.g. Al Ahly Academy" value={form.club} onChange={set('club')} /></div>
          </div>
        </div>

        <div style={S.card}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#336633', marginBottom: '12px' }}>Your sighting</h3>
          <label style={S.label}>What did you see?</label>
          <textarea style={S.textarea} placeholder="Describe what impressed you. Be specific — a moment, a skill, a quality." value={form.sighting} onChange={set('sighting')} />
          <label style={S.label}>Video link + timestamp (optional)</label>
          <input style={S.input} type="text" placeholder="e.g. youtube.com/... — watch from 2:34" value={form.video} onChange={set('video')} />
          <label style={S.label}>Your name (optional)</label>
          <input style={S.input} type="text" placeholder="Leave blank to post anonymously" value={form.submitter} onChange={set('submitter')} />
        </div>

        <button onClick={submit} disabled={loading}
          style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}>
          {loading ? 'Submitting...' : 'Submit Player'}
        </button>
        <p style={{ fontSize: '11px', color: '#336633', textAlign: 'center', marginTop: '8px' }}>No account needed · Verified coaches can endorse profiles</p>
      </main>
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
