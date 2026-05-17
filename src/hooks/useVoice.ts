import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { VoiceScan } from '../lib/supabase'

export function useVoice(userId: string | undefined) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<VoiceScan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (file: File) => {
    if (!userId) return
    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/voice/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('doberman-files')
        .upload(path, file, { upsert: true })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage
        .from('doberman-files')
        .getPublicUrl(path)

      const { data, error: fnError } = await supabase.functions.invoke('voice-analyze', {
        body: {
          file_url: urlData.publicUrl,
          file_name: file.name,
          user_id: userId,
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setResult(data.scan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice analysis failed')
    } finally {
      setScanning(false)
    }
  }

  const getHistory = async (): Promise<VoiceScan[]> => {
    if (!userId) return []
    const { data } = await supabase
      .from('voice_scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    return data || []
  }

  const getDailyCount = async (): Promise<number> => {
    if (!userId) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('module', 'voice')
      .gte('created_at', today.toISOString())
    return count || 0
  }

  return { scanning, result, error, analyze, getHistory, getDailyCount, setResult }
}
