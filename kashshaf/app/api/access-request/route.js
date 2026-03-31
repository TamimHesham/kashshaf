import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const { orgName, role, phone, email, targetPositions } = await request.json()
    if (!email || !orgName) return Response.json({ error: 'Email and organisation name required' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('access_requests').insert({
      org_name: orgName, role, phone, email,
      target_positions: targetPositions
    })

    if (error) throw error
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
