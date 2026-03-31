'use client'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Toast from '../../components/Toast'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', location: '', governorate: '', matchDate: '', ageGroup: '', competition: '', playerNames: '' })
  const [attended, setAttended] = useState({})

  useEffect(() => {
    fetchMatches()
    const saved = localStorage.getItem('ksh_attend')
    if (saved) setAttended(JSON.parse(saved))
  }, [])

  async function fetchMatches() {
    setLoading(true)
    try {
      const res = await fetch('/api/matches')
      const json = await res.json()
      setMatches(json.matches || [])
    } catch {}
    setLoading(false)
  }

  function toggleAttend(id) {
    const updated = { ...attended, [id]: !attended[id] }
    setAttended(updated)
    localStorage.setItem('ksh_attend', JSON.stringify(updated))
  }

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function postMatch() {
    if (!form.title || !form.location || !form.matchDate) { alert('Please fill in title, location, and date.'); return }
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, playerNames: form.playerNames.split(',').map(s => s.trim()).filter(Boolean) })
    })
    if (res.ok) { setToast('Match posted ✓'); setShowForm(false); fetchMatches() }
  }

  const inputStyle = { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1a2e1a', margin: 0 }}>Upcoming Matches</h1>
          <button onClick={() => setShowForm(s => !s)}
            style={{ background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '13px', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            + Post Match
          </button>
        </div>

        {/* Post match form */}
        {showForm && (
          <div style={{ background: '#fff', border: '2px solid #1a2e1a', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#336633', marginBottom: '12px' }}>Post a match</h3>
            <label style={labelStyle}>Match title</label>
            <input style={inputStyle} placeholder="e.g. U17 Cairo League — Al Ahly vs Zamalek" value={form.title} onChange={set('title')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={labelStyle}>Location</label><input style={inputStyle} placeholder="e.g. Nasr City Sports Complex" value={form.location} onChange={set('location')} /></div>
              <div>
                <label style={labelStyle}>Governorate</label>
                <select style={inputStyle} value={form.governorate} onChange={set('governorate')}>
                  <option value="">Select</option>
                  {['Cairo','Giza','Alexandria','Sharqia','Dakahlia','Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={labelStyle}>Date & time</label><input style={inputStyle} type="datetime-local" value={form.matchDate} onChange={set('matchDate')} /></div>
              <div><label style={labelStyle}>Age group</label><input style={inputStyle} placeholder="e.g. U17" value={form.ageGroup} onChange={set('ageGroup')} /></div>
            </div>
            <label style={labelStyle}>Players to watch (comma separated)</label>
            <input style={inputStyle} placeholder="e.g. Ahmed Hassan, Karim Nasser" value={form.playerNames} onChange={set('playerNames')} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={postMatch} style={{ flex: 1, background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '14px', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Post Match</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#fff', color: '#1a2e1a', border: '2px solid #1a2e1a', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#336633' }}>Loading matches...</div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#336633' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
            <p>No upcoming matches posted yet.</p>
          </div>
        ) : matches.map(m => {
          const date = new Date(m.match_date)
          const day = date.toLocaleDateString('en-GB', { day: 'numeric' })
          const mon = date.toLocaleDateString('en-GB', { month: 'short' })
          const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          const tags = m.match_players || []
          return (
            <div key={m.id} style={{ background: '#fff', border: '2px solid #cce8cc', borderRadius: '10px', padding: '14px', marginBottom: '10px', display: 'flex', gap: '12px' }}>
              <div style={{ background: '#1a2e1a', borderRadius: '8px', padding: '8px', textAlign: 'center', minWidth: '44px', flexShrink: 0 }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#00e676', lineHeight: 1 }}>{day}</div>
                <div style={{ fontSize: '10px', color: '#aaccaa' }}>{mon}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a2e1a', marginBottom: '3px' }}>{m.title}</div>
                <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>{m.location} · {m.governorate} · {time}{m.age_group ? ` · ${m.age_group}` : ''}</div>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
                    {tags.map(t => (
                      <span key={t.id} style={{ fontSize: '11px', background: '#e0f7e0', color: '#1a2e1a', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>{t.player_name}</span>
                    ))}
                  </div>
                )}
                {m.scouts_attending > 0 && <div style={{ fontSize: '11px', color: '#00875a', fontWeight: 700, marginBottom: '6px' }}>{m.scouts_attending} scout{m.scouts_attending > 1 ? 's' : ''} attending</div>}
                <button onClick={() => toggleAttend(m.id)}
                  style={{ background: attended[m.id] ? '#1a2e1a' : '#f0f7f0', border: '2px solid #1a2e1a', color: attended[m.id] ? '#00e676' : '#1a2e1a', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {attended[m.id] ? 'Going ✓' : 'Attend'}
                </button>
              </div>
            </div>
          )
        })}
      </main>
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
