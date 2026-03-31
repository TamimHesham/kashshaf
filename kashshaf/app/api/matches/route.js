import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('matches')
      .select('*, match_players(*)')
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
    if (error) throw error
    return Response.json({ matches: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { title, location, governorate, matchDate, ageGroup, competition, playerNames } = await request.json()
    if (!title || !location || !matchDate) return Response.json({ error: 'Missing required fields' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: match, error } = await supabase.from('matches').insert({
      posted_by: user?.id || null,
      title, location, governorate, match_date: matchDate,
      age_group: ageGroup, competition
    }).select().single()

    if (error) throw error

    // Tag players if provided
    if (playerNames?.length) {
      const tags = playerNames.map(name => ({ match_id: match.id, player_name: name }))
      await supabase.from('match_players').insert(tags)
    }

    return Response.json({ match })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
