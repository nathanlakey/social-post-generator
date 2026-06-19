import { NextRequest, NextResponse } from 'next/server'

// This is the "system prompt" — instructions that apply to every request,
// before the user's specific input. Think of it as the AI's job description.
const SYSTEM_PROMPT = `You are a social media copywriter for small businesses.
Given a business name, industry, what they're promoting, and a desired tone,
generate 3 distinct social media post captions.

Each post should:
- Be ready to copy and paste directly to Instagram or Facebook
- Include relevant emoji where natural (not excessive)
- Include 3-5 relevant hashtags at the end
- Be genuinely different from the other two in angle or structure (e.g. one direct/promotional, one storytelling, one question/engagement-based)

Respond with ONLY valid JSON, no markdown formatting, no code fences, no preamble.
The JSON must match this exact shape:

{
  "posts": [
    { "label": "string describing the angle, e.g. 'Direct & Promotional'", "caption": "string" },
    { "label": "string", "caption": "string" },
    { "label": "string", "caption": "string" }
  ]
}`

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { businessName, industry, topic, tone } = body

  if (!businessName || !topic) {
    return NextResponse.json(
      { error: 'Business name and topic are required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it to .env.local' },
      { status: 500 }
    )
  }

  // This is the "user prompt" — the specific request, built from form input.
  const userPrompt = `Business name: ${businessName}
Industry: ${industry || 'not specified'}
What they're promoting / posting about: ${topic}
Desired tone: ${tone || 'friendly and approachable'}

Generate the 3 post captions now.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return NextResponse.json(
        { error: 'Failed to generate posts. Check server logs.' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Claude's response comes back as an array of content blocks.
    // For a plain text response, the text we want is in the first block.
    const rawText = data.content?.[0]?.text ?? ''

    // Strip markdown code fences if Claude added them anyway (it sometimes does)
    const cleaned = rawText.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (e) {
      console.error('Failed to parse Claude response as JSON:', rawText)
      return NextResponse.json(
        { error: 'AI response was not valid JSON. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Request error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
