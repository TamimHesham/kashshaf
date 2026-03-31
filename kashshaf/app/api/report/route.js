import { generateReport } from '../../../lib/report'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const data = await request.json()
    const { name, age, position, club, matchContext, strengths, development, recommendation, ratings, playerId } = data

    if (!name || !strengths || !recommendation) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate the report
    const generated = await generateReport({ name, age, position, club, matchContext, strengths, development, recommendation, ratings })

    // Save to database if user is authenticated
    try {
      const supabase = createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('reports').insert({
          player_id: playerId || null,
          coach_id: user.id,
          player_name: name,
          position, age: parseInt(age) || null, club, match_context: matchContext,
          ratings, strengths, development, recommendation,
          generated_overview: generated.overview,
          generated_strengths: generated.strengths,
          generated_development: generated.development,
          generated_recommendation: generated.recommendation,
        })
      }
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr)
    }

    return Response.json({ success: true, report: generated })
  } catch (err) {
    console.error('Report generation error:', err)
    return Response.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
