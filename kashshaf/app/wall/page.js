'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import Toast from '../../components/Toast'

const S = {
  card: { background: '#fff', border: '2px solid #cce8cc', borderRadius: '10px', padding: '12px', cursor: 'pointer' },
  cardEndorsed: { background: '#fff', border: '2px solid #1a2e1a', borderRadius: '10px', padding: '12px', cursor: 'pointer' },
  badge: (type) => ({ display: 'inline-block', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, marginBottom: '5px', background: type === 'e' ? '#1a2e1a' : '#e8f8e8', color: type === 'e' ? '#00e676' : '#336633' }),
  chip: (on) => ({ background: on ? '#1a2e1a' : '#fff', border: '2px solid #1a2e1a', color: on ? '#00e676' : '#1a2e1a', fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }),
  btn: (type) => ({ background: type === 'green' ? '#1a2e1a' : '#fff', color: type === 'green' ? '#00e676' : '#1a2e1a', border: type === 'outline' ? '2px solid #1a2e1a' : 'none', fontWeight: 800, fontSize: '13px', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', flex: 1 }),
  input: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '10px' },
  textarea: { width: '100%', background: '#fff', border: '2px solid #aad4aa', borderRadius: '6px', color: '#1a1a1a', fontSize: '13px', padding: '9px 11px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '80px', marginBottom: '10px' },
}

function getFingerprint() {
  let fp = localStorage.getItem('ksh_fp')
  if (!fp) { fp = Math.random().toString(36).slice(2); localStorage.setItem('ksh_fp', fp) }
  return fp
}

export default function WallPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [isPaid, setIsPaid] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [votedIds, setVotedIds] = useState({})
  const [toast, setToast] = useState('')
  const [endorseForm, setEndorseForm] = useState(false)
  const [sightingForm, setSightingForm] = useState(false)
  const [endorseText, setEndorseText] = useState('')
  const [endorseName, setEndorseName] = useState('')
  const [sightingText, setSightingText] = useState('')
  const [sightingName, setSightingName] = useState('')

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all' && filter !== 'endorsed') params.set('position', filter)
      if (filter === 'endorsed') params.set('endorsed', 'true')
      const res = await fetch(`/api/players?${params}`)
      const json = await res.json()
      setPlayers(json.players || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchPlayers()
    const saved = localStorage.getItem('ksh_votes')
    if (saved) setVotedIds(JSON.parse(saved))
  }, [fetchPlayers])

  async function vote(e, player) {
    e.stopPropagation()
    const fp = getFingerprint()
    const alreadyVoted = votedIds[player.id]
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player.id, fingerprint: fp, action: alreadyVoted ? 'remove' : 'add' })
    })
    if (res.ok) {
      const newVoted = { ...votedIds }
      if (alreadyVoted) delete newVoted[player.id]
      else newVoted[player.id] = true
      setVotedIds(newVoted)
      localStorage.setItem('ksh_votes', JSON.stringify(newVoted))
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, votes: p.votes + (alreadyVoted ? -1 : 1) } : p))
    }
  }

  async function saveEndorsement() {
    if (!endorseText.trim()) { alert('Please write your endorsement first.'); return }
    const res = await fetch('/api/endorsements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: selectedPlayer.id, coachName: endorseName || 'Anonymous Coach', text: endorseText })
    })
    if (res.ok) {
      setToast('Endorsement saved ✓')
      setEndorseForm(false); setEndorseText(''); setEndorseName('')
      setSelectedPlayer(null); fetchPlayers()
    }
  }

  async function saveSighting() {
    if (!sightingText.trim()) { alert('Please describe what you saw first.'); return }
    const res = await fetch('/api/sightings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: selectedPlayer.id, submitterName: sightingName || 'Anonymous', text: sightingText })
    })
    if (res.ok) {
      setToast('Sighting added ✓')
      setSightingForm(false); setSightingText(''); setSightingName('')
      setSelectedPlayer(null); fetchPlayers()
    }
  }

  const filters = [
    { key: 'all', label: 'All' }, { key: 'gk', label: 'GK' },
    { key: 'def', label: 'Defenders' }, { key: 'mid', label: 'Midfielders' },
    { key: 'fwd', label: 'Forwards' }, { key: 'endorsed', label: 'Endorsed' },
  ]

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1a2e1a', marginBottom: '14px' }}>Talent Wall</h1>

        {/* Tier toggle */}
        <div style={{ background: '#1a2e1a', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <p style={{ color: '#aaccaa', fontSize: '12px', margin: 0, flex: 1 }}>
            Viewing as: <strong style={{ color: '#00e676' }}>{isPaid ? 'Club Access' : 'Free'}</strong>
            {!isPaid && ' — full details are locked'}
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Free', 'Club Access'].map(t => (
              <button key={t} onClick={() => setIsPaid(t === 'Club Access')}
                style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: '2px solid #00e676', background: (t === 'Club Access') === isPaid ? '#00e676' : 'transparent', color: (t === 'Club Access') === isPaid ? '#1a2e1a' : '#00e676' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={S.chip(filter === f.key)}>{f.label}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#336633' }}>Loading players...</div>
        ) : players.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#336633' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>👁️</div>
            <p style={{ marginBottom: '16px' }}>No players found. Be the first to spot one!</p>
            <a href="/submit" style={{ background: '#1a2e1a', color: '#00e676', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 800 }}>Spot a Player</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '10px' }}>
            {players.map(p => {
              const sCount = p.sightings?.[0]?.count ?? 0
              const eCount = p.endorsements?.[0]?.count ?? 0
              return (
                <div key={p.id} onClick={() => { setSelectedPlayer(p); setEndorseForm(false); setSightingForm(false) }}
                  style={p.endorsed ? S.cardEndorsed : S.card}>
                  <span style={S.badge(p.endorsed ? 'e' : 'n')}>{p.endorsed ? 'Endorsed' : 'New'}</span>
                  <div style={{ fontSize: '11px', color: '#336633', marginBottom: '3px', fontWeight: 600 }}>{p.position}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2e1a', marginBottom: '3px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>{p.age} yrs · {p.governorate}{isPaid ? `\n${p.club}` : ''}</div>
                  {isPaid && p.club && <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>{p.club}</div>}
                  {!isPaid && sCount > 0 && <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginBottom: '4px' }}>🔒 {sCount} sighting{sCount !== 1 ? 's' : ''} — unlock to read</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <button onClick={(e) => vote(e, p)} style={{ background: 'none', border: 'none', color: votedIds[p.id] ? '#1a2e1a' : '#336633', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontWeight: 700 }}>
                      ▲ {p.votes}
                    </button>
                    <span style={{ fontSize: '11px', color: '#888' }}>{eCount} endorsement{eCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Player modal */}
      {selectedPlayer && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlayer(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', border: '2px solid #1a2e1a', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a2e1a' }}>{selectedPlayer.name}</div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                  {selectedPlayer.position} · {selectedPlayer.age} yrs · {selectedPlayer.governorate}
                  {isPaid ? ` · ${selectedPlayer.club}` : ' · Club locked'}
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', color: '#1a2e1a', fontSize: '22px', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}>×</button>
            </div>

            {/* Endorsements */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#336633', textTransform: 'uppercase', letterSpacing: '.5px', margin: '12px 0 6px' }}>Coach endorsements</div>
            {selectedPlayer.endorsements?.length > 0 ? (
              isPaid ? selectedPlayer.endorsements.map((e, i) => (
                <div key={i} style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '6px', padding: '10px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#00875a', marginBottom: '3px' }}>✓ {e.coach_name}{e.coach_badge ? ` · ${e.coach_badge}` : ''}</div>
                  <div style={{ fontSize: '12px', color: '#1a2e1a', lineHeight: 1.5 }}>{e.text}</div>
                </div>
              )) : (
                <div style={{ position: 'relative', marginBottom: '6px' }}>
                  <div style={{ filter: 'blur(4px)', userSelect: 'none', background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#00875a' }}>✓ Coach ██████ · ████</div>
                    <div style={{ fontSize: '12px', color: '#1a2e1a' }}>██████ ████████ ██ ███ ████ ████████ ████████ ████ ████████ ████.</div>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,247,240,.85)', borderRadius: '6px', gap: '4px' }}>
                    <div>🔒</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a2e1a', textAlign: 'center' }}>Endorsement locked · Upgrade to read</div>
                  </div>
                </div>
              )
            ) : <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>No endorsements yet.</div>}

            {/* Sightings */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#336633', textTransform: 'uppercase', letterSpacing: '.5px', margin: '12px 0 6px' }}>Sightings</div>
            {isPaid ? (
              selectedPlayer.sightings?.map((s, i) => (
                <div key={i} style={{ background: '#f0f7f0', border: '2px solid #cce8cc', borderRadius: '6px', padding: '10px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#336633', marginBottom: '3px', fontWeight: 700 }}>{s.submitter_name}{s.created_at ? ` · ${new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</div>
                  <div style={{ fontSize: '12px', color: '#333' }}>{s.text}</div>
                </div>
              ))
            ) : (
              <>
                {selectedPlayer.sightings?.[0] && (
                  <div style={{ background: '#f0f7f0', border: '2px solid #cce8cc', borderRadius: '6px', padding: '10px', marginBottom: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#336633', marginBottom: '3px', fontWeight: 700 }}>{selectedPlayer.sightings[0].submitter_name}</div>
                    <div style={{ fontSize: '12px', color: '#333' }}>{selectedPlayer.sightings[0].text?.substring(0, 80)}...</div>
                  </div>
                )}
                {selectedPlayer.sightings?.length > 1 && (
                  <div style={{ position: 'relative', marginBottom: '6px' }}>
                    <div style={{ filter: 'blur(4px)', background: '#f0f7f0', border: '2px solid #cce8cc', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ fontSize: '12px', color: '#333' }}>████████ ██ ███ ████████ ██ ████████ ████ ████████.</div>
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,247,240,.85)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a2e1a' }}>🔒 {selectedPlayer.sightings.length - 1} more sighting{selectedPlayer.sightings.length - 1 > 1 ? 's' : ''} locked</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Video + Contact (paid only) */}
            {isPaid && selectedPlayer.video_link && (
              <>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#336633', textTransform: 'uppercase', letterSpacing: '.5px', margin: '12px 0 6px' }}>Video</div>
                <div style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#1a2e1a', fontWeight: 600 }}>📹 {selectedPlayer.video_link}</div>
              </>
            )}
            {isPaid && selectedPlayer.contact && (
              <>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#336633', textTransform: 'uppercase', letterSpacing: '.5px', margin: '12px 0 6px' }}>Contact</div>
                <div style={{ background: '#1a2e1a', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#00e676', fontWeight: 700 }}>{selectedPlayer.contact}</div>
              </>
            )}

            {/* Paywall CTA */}
            {!isPaid && (
              <div style={{ background: '#1a2e1a', borderRadius: '10px', padding: '16px', margin: '14px 0', textAlign: 'center' }}>
                <h3 style={{ color: '#00e676', fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>Unlock this player's full profile</h3>
                <p style={{ color: '#aaccaa', fontSize: '12px', lineHeight: 1.5, marginBottom: '12px' }}>Get full sighting details, coach endorsements, video links, and direct contact information.</p>
                <a href="/pricing" style={{ display: 'block', background: '#00e676', color: '#1a2e1a', border: 'none', fontWeight: 800, fontSize: '14px', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>See Club Access plans →</a>
                <div style={{ fontSize: '11px', color: '#556655', marginTop: '8px' }}>From 799 EGP / month</div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button onClick={() => { setEndorseForm(true); setSightingForm(false) }} style={S.btn('green')}>Endorse this player</button>
              <button onClick={() => { setSightingForm(true); setEndorseForm(false) }} style={S.btn('outline')}>Add sighting</button>
            </div>

            {/* Endorse form */}
            {endorseForm && (
              <div style={{ background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '8px', padding: '14px', marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }}>Your endorsement</label>
                <textarea value={endorseText} onChange={e => setEndorseText(e.target.value)} placeholder="e.g. Exceptional first touch and awareness for his age." style={S.textarea} />
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }}>Your name + badge</label>
                <input value={endorseName} onChange={e => setEndorseName(e.target.value)} placeholder="e.g. Coach Karim · Licensed" style={S.input} />
                <button onClick={saveEndorsement} style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '14px', padding: '11px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}>Save Endorsement</button>
                <button onClick={() => setEndorseForm(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#336633', fontSize: '13px', fontWeight: 600, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>Cancel</button>
              </div>
            )}

            {/* Sighting form */}
            {sightingForm && (
              <div style={{ background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '8px', padding: '14px', marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }}>What did you see?</label>
                <textarea value={sightingText} onChange={e => setSightingText(e.target.value)} placeholder="e.g. Scored a stunning free kick. Composure was remarkable." style={S.textarea} />
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }}>Your name (optional)</label>
                <input value={sightingName} onChange={e => setSightingName(e.target.value)} placeholder="Leave blank to post anonymously" style={S.input} />
                <button onClick={saveSighting} style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '14px', padding: '11px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}>Save Sighting</button>
                <button onClick={() => setSightingForm(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#336633', fontSize: '13px', fontWeight: 600, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
