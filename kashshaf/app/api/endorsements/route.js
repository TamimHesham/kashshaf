import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const { playerId, coachName, coachBadge, text } = await request.json()
    if (!playerId || !text || !coachName) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('endorsements').insert({
      player_id: playerId,
      coach_id: user?.id || null,
      coach_name: coachName,
      coach_badge: coachBadge || null,
      text,
    }).select().single()

    if (error) throw error

    // Mark player as endorsed
    await supabase.from('players').update({ endorsed: true }).eq('id', playerId)

    return Response.json({ endorsement: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
