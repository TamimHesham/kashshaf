import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const governorate = searchParams.get('governorate')
    const endorsed = searchParams.get('endorsed')
    const supabase = createServerSupabaseClient()

    let query = supabase.from('players').select(`*, sightings(count), endorsements(count)`).order('created_at', { ascending: false })

    if (position && position !== 'all') {
      if (position === 'gk') query = query.eq('position', 'GK')
      else if (position === 'def') query = query.in('position', ['CB','RB','LB'])
      else if (position === 'mid') query = query.in('position', ['CDM','CM','CAM'])
      else if (position === 'fwd') query = query.in('position', ['ST','LW','RW','Winger'])
    }
    if (governorate) query = query.eq('governorate', governorate)
    if (endorsed === 'true') query = query.eq('endorsed', true)

    const { data, error } = await query
    if (error) throw error
    return Response.json({ players: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, position, age, governorate, club, contact, videoLink } = body
    if (!name || !position) return Response.json({ error: 'Name and position required' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('players').insert({
      name, position, age: parseInt(age) || null,
      governorate, club, contact, video_link: videoLink
    }).select().single()

    if (error) throw error
    return Response.json({ player: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
