import Navbar from '../../components/Navbar'
import Link from 'next/link'

export default function PricingPage() {
  const free = ['View all players on the Talent Wall', 'See player name, position, age, location', 'Upvote and submit new players', 'Add sightings to any profile']
  const freeLocked = ['Full sighting descriptions locked', 'Coach endorsement text locked', 'Video links locked', 'Club and contact details locked', 'Advanced search and filters locked']
  const paid = ['Everything in Free', 'Full sighting descriptions unlocked', 'Coach endorsement text unlocked', 'Video links and timestamps unlocked', 'Club name and contact details unlocked', 'Advanced search by position, age, area', 'Email alerts for new players in target position', 'Download scouting reports as PDF', 'Up to 5 team members on one account']

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2e1a', marginBottom: '8px' }}>Find Egypt's next talent before anyone else</h1>
          <p style={{ fontSize: '14px', color: '#336633', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto' }}>
            Kashshaf gives clubs and agencies full access to verified scouting reports, player contacts, and real-time talent alerts across all governorates.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Free plan */}
          <div style={{ background: '#fff', border: '2px solid #cce8cc', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#00875a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Free forever</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a2e1a', marginBottom: '4px' }}>Browse</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#1a2e1a', marginBottom: '4px' }}>0 EGP <span style={{ fontSize: '13px', fontWeight: 500, color: '#336633' }}>/ month</span></div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', lineHeight: 1.5 }}>See who's out there. Good for fans and parents who want to see if their player is spotted.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {free.map(f => <div key={f} style={{ fontSize: '13px', color: '#1a2e1a' }}>✓ {f}</div>)}
              {freeLocked.map(f => <div key={f} style={{ fontSize: '13px', color: '#aaa' }}>✗ {f}</div>)}
            </div>
            <Link href="/wall" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', border: '2px solid #1a2e1a', background: '#fff', color: '#1a2e1a', textDecoration: 'none', textAlign: 'center' }}>
              Browse free
            </Link>
          </div>

          {/* Paid plan */}
          <div style={{ background: '#e0f7e0', border: '2px solid #1a2e1a', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#00875a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Most popular</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a2e1a', marginBottom: '4px' }}>Club Access</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#1a2e1a', marginBottom: '4px' }}>799 EGP <span style={{ fontSize: '13px', fontWeight: 500, color: '#336633' }}>/ month</span></div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', lineHeight: 1.5 }}>Full access to everything. Built for academies, clubs, and agencies actively looking for talent.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {paid.map(f => <div key={f} style={{ fontSize: '13px', color: '#1a2e1a' }}>✓ {f}</div>)}
            </div>
            <Link href="/contact" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: '#1a2e1a', color: '#00e676', textDecoration: 'none', textAlign: 'center' }}>
              Request access
            </Link>
          </div>
        </div>

        {/* Custom plan */}
        <div style={{ background: '#1a2e1a', borderRadius: '10px', padding: '16px', textAlign: 'center', marginTop: '14px' }}>
          <p style={{ color: '#aaccaa', fontSize: '13px', marginBottom: '10px' }}>
            Running a large academy or federation? <strong style={{ color: '#00e676' }}>Let's talk about a custom plan.</strong>
          </p>
          <Link href="/contact" style={{ display: 'inline-block', background: '#00e676', color: '#1a2e1a', border: 'none', fontWeight: 800, fontSize: '13px', padding: '10px 24px', borderRadius: '7px', textDecoration: 'none' }}>
            Contact us
          </Link>
        </div>
      </main>
    </>
  )
}
