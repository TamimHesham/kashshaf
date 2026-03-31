'use client'
import { useState, useEffect } from 'react'

export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [message, onDone])

  if (!message) return null
  return (
    <div className="toast-enter" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#1a2e1a', color: '#00e676', fontWeight: 700, fontSize: '13px', padding: '12px 20px', borderRadius: '8px', zIndex: 999, whiteSpace: 'nowrap' }}>
      {message}
    </div>
  )
}
