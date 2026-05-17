import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BreachScan } from '../lib/supabase'

export function useBreach(userId: string | undefined) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<BreachScan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scan = async (type: 'email' | 'password' | 'phone', value: string) => {
    if (!userId) return

    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('breach-check', {
        body: { type, value, user_id: userId },
      })

      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)

      setResult(data.scan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  const getHistory = async (): Promise<Array<{ id: string; scan_type: string; query: string; created_at: string }>> => {
    if (!userId) return []
    const { data } = await supabase
      .from('breach_scans')
      .select('id, scan_type, query, created_at')
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
      .eq('module', 'breach')
      .gte('created_at', today.toISOString())
    return count || 0
  }

  return { scanning, result, error, scan, getHistory, getDailyCount, setResult }
}
