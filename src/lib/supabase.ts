import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  module: 'eyes' | 'nose' | 'brain'
  action: string
  created_at: string
}
