import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const MODELS = {
  fast: 'gpt-4o-mini',
  smart: 'gpt-4o',
  cheap: 'gpt-3.5-turbo',
} as const

export type ModelType = keyof typeof MODELS