import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'D0B3RMAN: Missing Supabase environment variables.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export type Profile = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  plan: string
  scan_credits: number
  created_at: string
  last_login: string
}

export type EyesScan = {
  id: string
  user_id: string
  file_name: string
  file_type: 'image' | 'video' | 'audio'
  file_url: string
  result: 'authentic' | 'fake' | 'uncertain'
  confidence_score: number
  explanation: string
  hive_raw: Record<string, unknown>
  created_at: string
}

export type NoseScan = {
  id: string
  user_id: string
  environment_description: string
  devices: DeviceResult[]
  overall_risk_score: number
  vulnerabilities: unknown
  recommendations: unknown
  created_at: string
}

export type DeviceResult = {
  name: string
  risk_score: number
  vulnerabilities: { title: string; cve: string; severity: string }[]
  recommendations: string[]
}

export type BrainConversation = {
  id: string
  user_id: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export type UsageLog = {
  id: string
  user_id: string
  module: 'eyes' | 'nose' | 'brain' | 'breach' | 'scam_link' | 'voice' | 'news'
  action: string
  created_at: string
}

export type BreachCheck = {
  id: string
  user_id: string
  check_type: 'email' | 'phone' | 'password'
  query_display: string
  breach_count: number
  breaches: Array<{ name: string; date: string; data_types: string[] }>
  risk_level: 'low' | 'medium' | 'high'
  daye_analysis: string
  trust_score: number
  created_at: string
}

export type ScamLinkCheck = {
  id: string
  user_id: string
  url: string
  domain: string
  risk_score: number
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'phishing' | 'malware'
  threat_type: string
  indicators: string[]
  daye_analysis: string
  created_at: string
}

export type VoiceScan = {
  id: string
  user_id: string
  file_name: string
  file_url: string
  manipulation_probability: number
  clone_indicators: string[]
  emotional_manipulation_score: number
  verdict: 'authentic' | 'likely_authentic' | 'uncertain' | 'likely_ai' | 'certain_ai'
  daye_analysis: string
  trust_score: number
  created_at: string
}
