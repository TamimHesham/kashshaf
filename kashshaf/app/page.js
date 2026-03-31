import Link from 'next/link'
import Navbar from '../components/Navbar'
import { createServerSupabaseClient } from '../lib/supabase-server'

async function getStats() {
  try {
    const supabase = createServerSupabaseClient()
    const [{ count: playerCount }, { count: sightingCount }] = await Promise.all([
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('sightings').select('*', { count: 'exact', head: true }),
    ])
    return { players: playerCount || 0, sightings: sightingCount || 0 }
  } catch {
    return { players: 0, sightings: 0 }
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 8px 24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2e1a', lineHeight: 1.3, marginBottom: '10px' }}>
            Egyptian grassroots football deserves a{' '}
            <em style={{ color: '#00875a', fontStyle: 'normal' }}>real scouting platform</em>
          </h1>
          <p style={{ color: '#336633', fontSize: '14px', lineHeight: 1.6, marginBottom: '22px' }}>
            Coaches write professional reports. Fans spot hidden talent. Clubs find their next signing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '260px', margin: '0 auto' }}>
            <Link href="/coach" style={{ background: '#1a2e1a', color: '#00e676', border: 'none', fontWeight: 800, fontSize: '15px', padding: '13px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              I'm a Coach or Club
            </Link>
            <Link href="/submit" style={{ background: '#fff', color: '#1a2e1a', border: '2px solid #1a2e1a', fontWeight: 700, fontSize: '15px', padding: '13px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              I Spotted a Player
            </Link>
          </div>
        </div>

        {/* Live stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', margin: '22px 0' }}>
          {[
            { n: stats.players, l: 'Players spotted' },
            { n: stats.sightings, l: 'Total sightings' },
            { n: '12', l: 'Governorates' },
          ].map(s => (
            <div key={s.l} style={{ background: '#1a2e1a', borderRadius: '10px', padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#00e676' }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: '#aaccaa', marginTop: '2px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: '📋', title: 'Human reports', desc: 'Coaches write what they saw. AI structures it professionally. The judgment stays human.' },
            { icon: '👁️', title: 'Talent Wall', desc: 'Anyone spots a player. Verified coaches endorse with written comments for credibility.' },
            { icon: '📅', title: 'Match Calendar', desc: 'Find upcoming youth matches. Know exactly where to watch a player live.' },
            { icon: '💼', title: 'For Clubs', desc: 'Full access to scouting reports, contacts, and advanced search.', link: '/pricing' },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', border: '2px solid #1a2e1a', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1a2e1a', marginBottom: '4px' }}>{f.title}</h3>
              <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.5, margin: 0 }}>
                {f.desc}
                {f.link && <Link href={f.link} style={{ color: '#00875a', fontWeight: 700 }}> See plans →</Link>}
              </p>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
