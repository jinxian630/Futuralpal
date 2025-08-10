import OpenAI from 'openai'

let _openai: OpenAI | null = null

export const getOpenAI = (): OpenAI => {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: "My API Key" }).')
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

export async function callOpenAI(messages: any[], max_tokens = 400) {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens,
      temperature: 0.6,
      top_p: 0.9,
      frequency_penalty: 0.2
    })
  })
  
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json.choices?.[0]?.message?.content ?? ''
}