import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const { playerId, fingerprint, action } = await request.json()
    if (!playerId || !fingerprint) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = createServerSupabaseClient()

    if (action === 'remove') {
      await supabase.from('votes').delete().match({ player_id: playerId, user_fingerprint: fingerprint })
      await supabase.rpc('decrement_votes', { player_id: playerId })
      return Response.json({ action: 'removed' })
    }

    const { error } = await supabase.from('votes').insert({ player_id: playerId, user_fingerprint: fingerprint })
    if (error && error.code === '23505') return Response.json({ error: 'Already voted' }, { status: 409 })
    if (error) throw error

    await supabase.from('players').update({ votes: supabase.rpc('increment') }).eq('id', playerId)

    // Simpler vote count update
    const { data: player } = await supabase.from('players').select('votes').eq('id', playerId).single()
    await supabase.from('players').update({ votes: (player?.votes || 0) + 1 }).eq('id', playerId)

    return Response.json({ action: 'added' })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
