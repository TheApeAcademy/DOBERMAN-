import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BreachCheck } from '../lib/supabase'

export function useBreach(userId: string | undefined) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<BreachCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  const check = async (check_type: 'email' | 'phone' | 'password', query: string) => {
    if (!userId) return
    setChecking(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('breach-check', {
        body: { check_type, query, user_id: userId },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setResult(data.check)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Breach check failed')
    } finally {
      setChecking(false)
    }
  }

  const getHistory = async (): Promise<BreachCheck[]> => {
    if (!userId) return []
    const { data } = await supabase
      .from('breach_checks')
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
      .eq('module', 'breach')
      .gte('created_at', today.toISOString())
    return count || 0
  }

  return { checking, result, error, check, getHistory, getDailyCount, setResult }
}
