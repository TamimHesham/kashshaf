// Smart report formatter - uses Claude API if key available, falls back to template
export async function generateReport(data) {
  const { name, age, position, club, matchContext, strengths, development, recommendation, ratings } = data

  // Try Claude API first
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const ratingsText = Object.entries(ratings).map(([k, v]) => `${k}: ${v}/10`).join(', ')
      const prompt = `You are a professional football scouting report formatter for Kashshaf, an Egyptian grassroots scouting platform. A coach has submitted raw observations. Structure and elevate the language into a professional scouting report. DO NOT invent facts not mentioned by the coach.

Player: ${name}
Age: ${age || 'Not specified'}
Position: ${position || 'Not specified'}
Club: ${club || 'Not specified'}
Match: ${matchContext || 'Not specified'}
Ratings: ${ratingsText}
Coach strengths notes: ${strengths}
Coach development notes: ${development || 'Not provided'}
Coach recommendation: ${recommendation}

Write a professional report with exactly these four sections in flowing prose (no bullet points). Keep each section 2-4 sentences. Respond ONLY with valid JSON:
{"overview":"...","strengths":"...","development":"...","recommendation":"..."}`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const json = await res.json()
      const text = json.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch (e) {
      console.error('Claude API error, falling back to template:', e)
    }
  }

  // Template fallback
  return buildTemplateReport(data)
}

function buildTemplateReport({ name, age, position, club, matchContext, strengths, development, recommendation }) {
  const posLabel = position || 'the player'
  const ageLabel = age ? `${age}-year-old ` : ''
  const clubLabel = club ? `, currently attached to ${club}` : ''
  const matchLabel = matchContext ? ` during ${matchContext}` : ''

  const overviews = [
    `${name} is a ${ageLabel}${posLabel}${clubLabel} who demonstrated considerable promise${matchLabel}. The player showed technical and tactical maturity that stands out at this stage of development, with the coaching staff noting several qualities that suggest significant potential for progression to a higher level.`,
    `Observed${matchLabel}, ${name} is a ${ageLabel}${posLabel}${clubLabel} who caught attention through consistent quality and intelligent decision-making throughout. The player presents a compelling profile for further assessment at a higher level.`
  ]

  const strFormatted = strengths.charAt(0).toUpperCase() + strengths.slice(1) + (strengths.slice(-1) !== '.' ? '.' : '')
  const strExpanded = `${strFormatted} These qualities represent a significant foundation for development and suggest the player has both the technical ability and football intelligence to compete at a higher level.`

  const devFormatted = development
    ? `${development.charAt(0).toUpperCase() + development.slice(1)}${development.slice(-1) !== '.' ? '.' : ''} These are areas that, with focused coaching and consistent training, are well within the player's capacity to address given the strengths already demonstrated.`
    : 'No specific areas of concern were noted at this stage of assessment. Continued monitoring is recommended to build a more complete picture over time.'

  const recMap = {
    'Recommend for trial — priority': `${name} is strongly recommended for an immediate trial opportunity. The qualities observed are sufficiently impressive to warrant priority consideration, and the coaching assessment suggests the player is ready for exposure to a higher competitive level without delay.`,
    'Recommend for trial — monitor first': `${name} is recommended for trial, with the suggestion that the coaching staff conduct one additional observation session first. The potential is clear and a further assessment will provide the context needed to proceed with confidence.`,
    'Continue development at current level': `${name} is best served by continued development within the current environment. The foundations are solid, and structured progression at this level will position the player well for advancement in the coming months.`,
    'Not ready — revisit in 6 months': `At this stage, ${name} would benefit from a focused development period at the current level. The coaching staff recommends reassessment in approximately six months, by which time the identified areas should have been meaningfully addressed.`
  }

  return {
    overview: overviews[Math.floor(Math.random() * overviews.length)],
    strengths: strExpanded,
    development: devFormatted,
    recommendation: recMap[recommendation] || recommendation
  }
}
