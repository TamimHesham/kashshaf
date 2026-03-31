'use client'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Toast from '../../components/Toast'

const RKEYS = ['Pace', 'Technique', 'Positioning', 'Work rate', 'Decision making', 'Physical']
const SPIN_MSGS = ['Analysing your observations...', 'Structuring the report...', 'Applying professional formatting...', 'Almost done...']

const S = {
  input: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' },
  select: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' },
  textarea: { width: '100%', background: '#f0f7f0', border: '2px solid #aad4aa', borderRadius: '7px', color: '#1a1a1a', fontSize: '14px', padding: '10px 12px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '90px', marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  tab: (on) => ({ background: on ? '#1a2e1a' : '#fff', border: '2px solid #1a2e1a', color: on ? '#00e676' : '#1a2e1a', fontSize: '13px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }),
}

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState('report')
  const [form, setForm] = useState({ name: '', age: '', position: '', match: '', club: '', strengths: '', development: '', recommendation: '' })
  const [ratings, setRatings] = useState(Object.fromEntries(RKEYS.map(k => [k, 5])))
  const [generating, setGenerating] = useState(false)
  const [spinMsg, setSpinMsg] = useState('')
  const [report, setReport] = useState(null)
  const [toast, setToast] = useState('')
  const [myReports, setMyReports] = useState([])

  useEffect(() => {
    if (activeTab === 'players') fetchMyReports()
  }, [activeTab])

  async function fetchMyReports() {
    try {
      const res = await fetch('/api/report')
      if (res.ok) { const j = await res.json(); setMyReports(j.reports || []) }
    } catch {}
  }

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function generate() {
    if (!form.name || !form.strengths || !form.recommendation) {
      alert('Please fill in: player name, your observations, and a recommendation.')
      return
    }
    setGenerating(true)
    setReport(null)
    let idx = 0
    setSpinMsg(SPIN_MSGS[0])
    const interval = setInterval(() => { idx = (idx + 1) % SPIN_MSGS.length; setSpinMsg(SPIN_MSGS[idx]) }, 1800)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, age: form.age, position: form.position, club: form.club, matchContext: form.match, strengths: form.strengths, development: form.development, recommendation: form.recommendation, ratings })
      })
      const json = await res.json()
      if (json.report) setReport({ ...json.report, playerName: form.name, position: form.position, age: form.age, club: form.club, match: form.match })
      else alert('Something went wrong. Please try again.')
    } catch { alert('Something went wrong. Please try again.') }

    clearInterval(interval)
    setGenerating(false)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1a2e1a', marginBottom: '14px' }}>Coach Portal</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[['report', 'Write Report'], ['players', 'My Reports'], ['verify', 'Get Verified']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={S.tab(activeTab === key)}>{label}</button>
          ))}
        </div>

        {/* WRITE REPORT */}
        {activeTab === 'report' && (
          <div style={{ background: '#fff', border: '2px solid #cce8cc', borderRadius: '10px', padding: '16px' }}>
            <div style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              {['Fill in player details and adjust the ratings', 'Write your raw observations in plain language', 'Hit generate — AI structures it into a professional report', 'Your judgment, professional presentation'].map((s, i) => (
                <p key={i} style={{ fontSize: '12px', color: '#1a2e1a', margin: '4px 0', lineHeight: 1.6, fontWeight: 600 }}><span style={{ color: '#00875a' }}>{i + 1}</span> {s}</p>
              ))}
            </div>

            <div style={S.row}>
              <div><label style={S.label}>Player name</label><input style={S.input} value={form.name} onChange={set('name')} placeholder="Full name" /></div>
              <div><label style={S.label}>Age</label><input style={S.input} type="number" value={form.age} onChange={set('age')} placeholder="Age" /></div>
            </div>
            <div style={S.row}>
              <div>
                <label style={S.label}>Position</label>
                <select style={S.select} value={form.position} onChange={set('position')}>
                  <option value="">Select</option>
                  {['GK','CB','RB','LB','CDM','CM','CAM','ST','Winger'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={S.label}>Match context</label><input style={S.input} value={form.match} onChange={set('match')} placeholder="e.g. U17 vs Zamalek" /></div>
            </div>
            <label style={S.label}>Club / Academy</label>
            <input style={S.input} value={form.club} onChange={set('club')} placeholder="e.g. Al Ahly Academy" />

            {/* Ratings */}
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '10px' }}>Player ratings</div>
            {RKEYS.map(k => {
              const pct = (ratings[k] / 10) * 100
              return (
                <div key={k} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a2e1a' }}>{k}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#00875a' }}>{ratings[k]} / 10</span>
                  </div>
                  <input type="range" min="0" max="10" value={ratings[k]}
                    onChange={e => setRatings(r => ({ ...r, [k]: parseInt(e.target.value) }))}
                    style={{ width: '100%', height: '6px', borderRadius: '3px', cursor: 'pointer', outline: 'none', background: `linear-gradient(to right,#1a2e1a ${pct}%,#cce8cc ${pct}%)` }} />
                </div>
              )
            })}

            <label style={S.label}>Strengths — what stood out?</label>
            <textarea style={S.textarea} value={form.strengths} onChange={set('strengths')} placeholder="e.g. His first touch in tight spaces was exceptional. Drew fouls intelligently..." />
            <label style={S.label}>Areas to develop</label>
            <textarea style={S.textarea} value={form.development} onChange={set('development')} placeholder="e.g. Needs to improve aerial duels..." />
            <label style={S.label}>Recommendation</label>
            <select style={S.select} value={form.recommendation} onChange={set('recommendation')}>
              <option value="">Select recommendation</option>
              {['Recommend for trial — priority', 'Recommend for trial — monitor first', 'Continue development at current level', 'Not ready — revisit in 6 months'].map(r => <option key={r}>{r}</option>)}
            </select>

            <button onClick={generate} disabled={generating}
              style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: generating ? .7 : 1 }}>
              {generating ? 'Generating...' : 'Generate Professional Report'}
            </button>

            {/* Spinner */}
            {generating && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px 0', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #cce8cc', borderTopColor: '#1a2e1a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <div style={{ fontSize: '13px', color: '#336633', fontWeight: 600 }}>{spinMsg}</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Report output */}
            {report && (
              <div style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '10px', padding: '20px', marginTop: '14px' }}>
                <div style={{ borderBottom: '2px solid #1a2e1a', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a2e1a' }}>{report.playerName}</div>
                  <div style={{ fontSize: '12px', color: '#336633', marginTop: '3px' }}>
                    {[report.position, report.age && `${report.age} yrs`, report.club, report.match].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display: 'inline-block', background: '#1a2e1a', color: '#00e676', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', marginTop: '6px' }}>
                    Kashshaf Report · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Ratings dots */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', background: '#fff', borderRadius: '8px', padding: '12px', border: '1px solid #cce8cc' }}>
                  {RKEYS.map(k => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#1a2e1a', fontWeight: 600 }}>
                      <span>{k}</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < ratings[k] ? '#1a2e1a' : '#cce8cc' }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {[['Player Overview', report.overview], ['Strengths', report.strengths], ['Areas for Development', report.development], ['Recommendation', report.recommendation]].map(([title, text]) => (
                  <div key={title} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#00875a', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>{title}</h4>
                    <p style={{ fontSize: '14px', color: '#1a2e1a', lineHeight: 1.7, margin: 0 }}>{text}</p>
                  </div>
                ))}

                <div style={{ fontSize: '11px', color: '#336633', padding: '10px 12px', background: '#fff', borderRadius: '6px', borderLeft: '3px solid #1a2e1a', lineHeight: 1.6 }}>
                  Written by the coach and structured by AI. All observations and judgments are entirely the coach's own.
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button style={{ flex: 1, background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '14px', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Download PDF</button>
                  <button style={{ flex: 1, background: '#fff', color: '#1a2e1a', border: '2px solid #1a2e1a', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Share link</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY REPORTS */}
        {activeTab === 'players' && (
          <div>
            {myReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#336633' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                <p>No reports yet. Generate your first report to get started.</p>
              </div>
            ) : myReports.map(r => (
              <div key={r.id} style={{ background: '#fff', border: '2px solid #cce8cc', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#1a2e1a', fontSize: '14px' }}>{r.player_name}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{r.position} · {r.age} yrs{r.club ? ` · ${r.club}` : ''}</div>
                </div>
                <span style={{ fontSize: '11px', color: '#888' }}>{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
              </div>
            ))}
          </div>
        )}

        {/* GET VERIFIED */}
        {activeTab === 'verify' && (
          <div>
            {[
              { icon: '🔵', title: 'Club affiliated', desc: 'Submit a club letter or ID. Adds a club badge to your reports.' },
              { icon: '✅', title: 'Licensed coach', desc: 'CAF C or above. Unlocks your full public profile and coach directory.' },
              { icon: '⭐', title: 'Senior licensed', desc: 'CAF A / UEFA B or above. Featured placement. Can endorse other coaches.' },
            ].map(t => (
              <div key={t.title} style={{ background: '#fff', border: '2px solid #1a2e1a', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '20px' }}>{t.icon}</div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1a2e1a', margin: '0 0 3px' }}>{t.title}</h4>
                  <p style={{ fontSize: '12px', color: '#444', margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
                </div>
              </div>
            ))}
            <label style={S.label} style={{ marginTop: '14px', display: 'block', fontSize: '12px', fontWeight: 700, color: '#1a2e1a', marginBottom: '5px' }}>Notes (optional)</label>
            <textarea style={S.textarea} placeholder="Any context about your documentation or role..." />
            <button style={{ width: '100%', background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => setToast('Verification request submitted ✓')}>
              Submit for Verification
            </button>
            <p style={{ fontSize: '11px', color: '#336633', textAlign: 'center', marginTop: '8px' }}>We review applications within 48 hours</p>
          </div>
        )}
      </main>
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
