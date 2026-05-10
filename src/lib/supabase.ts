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

export type ThreatIndicator = {
  type: string
  value: string
  confidence: number
  description: string
}

export type CVEReference = {
  id: string
  description: string
  severity: string
  cvss: number
}

export type FangsScan = {
  id: string
  user_id: string
  input_value: string
  input_type: 'url' | 'ip' | 'domain' | 'hash' | 'email' | 'code' | 'text'
  threat_type: 'phishing' | 'malware' | 'intrusion' | 'vulnerability' | 'darkweb' | 'general'
  verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown'
  risk_score: number
  threat_name: string | null
  description: string
  indicators: ThreatIndicator[]
  cves: CVEReference[]
  apt_groups: string[]
  recommendations: string[]
  created_at: string
}

export type UsageLog = {
  id: string
  user_id: string
  module: 'eyes' | 'nose' | 'brain' | 'fangs'
  action: string
  created_at: string
}
