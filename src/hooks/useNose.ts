import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NoseScan } from '../lib/supabase'

export function useNose(userId: string | undefined) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<NoseScan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (description: string, devices: string[]) => {
    if (!userId) return

    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('nose-analyze', {
        body: {
          environment_description: description,
          devices,
          user_id: userId,
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (data.error) throw new Error(data.error)

      setResult(data.scan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setScanning(false)
    }
  }

  const getHistory = async (): Promise<NoseScan[]> => {
    if (!userId) return []
    const { data } = await supabase
      .from('nose_scans')
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
      .eq('module', 'nose')
      .gte('created_at', today.toISOString())
    return count || 0
  }

  return { scanning, result, error, analyze, getHistory, getDailyCount, setResult }
}
