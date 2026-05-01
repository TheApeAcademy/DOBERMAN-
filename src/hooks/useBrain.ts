import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BrainConversation, ChatMessage } from '../lib/supabase'

export function useBrain(userId: string | undefined) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] = useState<BrainConversation | null>(null)

  const sendMessage = async (content: string, conversationId?: string) => {
    if (!userId) return

    setLoading(true)
    setError(null)

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const currentMessages = activeConversation?.messages || []
    const updatedMessages = [...currentMessages, userMessage]

    setActiveConversation((prev) =>
      prev
        ? { ...prev, messages: updatedMessages }
        : {
            id: '',
            user_id: userId,
            title: content.slice(0, 50),
            messages: updatedMessages,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
    )

    try {
      const { data, error: fnError } = await supabase.functions.invoke('brain-chat', {
        body: {
          messages: updatedMessages,
          user_id: userId,
          conversation_id: conversationId || activeConversation?.id || undefined,
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (data.error) throw new Error(data.error)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]

      setActiveConversation({
        id: data.conversation_id,
        user_id: userId,
        title: content.slice(0, 50),
        messages: finalMessages,
        created_at: activeConversation?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      setActiveConversation((prev) =>
        prev ? { ...prev, messages: currentMessages } : null
      )
    } finally {
      setLoading(false)
    }
  }

  const getHistory = async (): Promise<BrainConversation[]> => {
    if (!userId) return []
    const { data } = await supabase
      .from('brain_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(30)
    return data || []
  }

  const loadConversation = async (id: string) => {
    const { data } = await supabase
      .from('brain_conversations')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setActiveConversation(data)
  }

  const newConversation = () => {
    setActiveConversation(null)
    setError(null)
  }

  const getDailyCount = async (): Promise<number> => {
    if (!userId) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('module', 'brain')
      .gte('created_at', today.toISOString())
    return count || 0
  }

  return {
    loading,
    error,
    activeConversation,
    sendMessage,
    getHistory,
    loadConversation,
    newConversation,
    getDailyCount,
  }
}
