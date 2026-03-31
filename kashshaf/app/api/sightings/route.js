import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const { playerId, text, submitterName, videoLink } = await request.json()
    if (!playerId || !text) return Response.json({ error: 'Player ID and text required' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('sightings').insert({
      player_id: playerId,
      submitted_by: user?.id || null,
      submitter_name: submitterName || 'Anonymous',
      text,
      video_link: videoLink || null
    }).select().single()

    if (error) throw error
    return Response.json({ sighting: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
