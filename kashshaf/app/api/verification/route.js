import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const { requestedTier, notes } = await request.json()
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { error } = await supabase.from('verification_requests').insert({
      user_id: user.id,
      requested_tier: requestedTier,
      notes
    })

    if (error) throw error

    // Update profile to pending
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
