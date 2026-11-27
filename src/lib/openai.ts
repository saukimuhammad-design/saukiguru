import OpenAI from 'openai'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  })
}

export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    const client = getOpenAIClient()
    return Reflect.get(client, prop)
  }
})

export const MODELS = {
  fast: 'gpt-4o-mini',
  smart: 'gpt-4o',
  cheap: 'gpt-3.5-turbo',
} as const

export type ModelType = keyof typeof MODELS