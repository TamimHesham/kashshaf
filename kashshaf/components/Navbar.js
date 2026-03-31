'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const navLinks = [
    { href: '/', label: '🏠 Home' },
    { href: '/wall', label: '👁️ Talent Wall' },
    { href: '/coach', label: '📋 Coach Portal' },
    { href: '/matches', label: '📅 Matches' },
    { href: '/submit', label: '⚡ Spot a Player' },
    { href: '/pricing', label: '💼 For Clubs' },
  ]

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    setDrawerOpen(false)
  }

  return (
    <>
      <nav style={{ background: '#00e676', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px', position: 'sticky', top: 0, zIndex: 99 }}>
        <Link href="/" style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 800, textDecoration: 'none', letterSpacing: '-0.3px' }}>
          Kashshaf
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/pricing" style={{ background: '#1a2e1a', color: '#00e676', fontWeight: 800, fontSize: '13px', padding: '7px 15px', borderRadius: '6px', textDecoration: 'none' }}>
            For Clubs
          </Link>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: '#1a2e1a', borderRadius: '2px' }} />)}
          </button>
        </div>
      </nav>

      {/* Drawer backdrop */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 199 }} />
      )}

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: drawerOpen ? 0 : '-260px', width: '240px', height: '100%', background: '#00e676', zIndex: 200, transition: 'right .25s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '2px solid #1a2e1a' }}>
          <span style={{ color: '#1a2e1a', fontSize: '16px', fontWeight: 800 }}>Kashshaf</span>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#1a2e1a', fontSize: '24px', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)}
              style={{ background: pathname === link.href ? 'rgba(0,0,0,.1)' : 'none', borderLeft: pathname === link.href ? '3px solid #1a2e1a' : '3px solid transparent', color: '#1a2e1a', fontSize: '15px', fontWeight: 700, padding: '14px 20px', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/coach" onClick={() => setDrawerOpen(false)} style={{ color: '#1a2e1a', fontSize: '15px', fontWeight: 700, padding: '14px 20px', textDecoration: 'none', borderLeft: '3px solid transparent' }}>
                👤 My Account
              </Link>
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#1a2e1a', fontSize: '15px', fontWeight: 700, textAlign: 'left', padding: '14px 20px', cursor: 'pointer', borderLeft: '3px solid transparent' }}>
                🚪 Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setDrawerOpen(false)} style={{ color: '#1a2e1a', fontSize: '15px', fontWeight: 700, padding: '14px 20px', textDecoration: 'none', borderLeft: '3px solid transparent' }}>
              🔐 Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
