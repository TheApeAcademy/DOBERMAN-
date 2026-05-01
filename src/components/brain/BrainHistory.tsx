import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Clock } from 'lucide-react'
import type { BrainConversation } from '../../lib/supabase'
import { formatRelativeTime, truncate } from '../../lib/utils'

interface BrainHistoryProps {
  userId: string
  activeId?: string
  getHistory: () => Promise<BrainConversation[]>
  onSelect: (conv: BrainConversation) => void
  onNew: () => void
}

export function BrainHistory({ userId, activeId, getHistory, onSelect, onNew }: BrainHistoryProps) {
  const [conversations, setConversations] = useState<BrainConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then((data) => {
      setConversations(data)
      setLoading(false)
    })
  }, [userId])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border-color">
        <button
          onClick={onNew}
          className="w-full btn-secondary text-sm py-2"
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse" />
          ))
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={20} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-muted font-label text-xs">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                conv.id === activeId
                  ? 'bg-green-900/20 border border-green-800/30'
                  : 'hover:bg-bg-tertiary'
              }`}
            >
              <p className={`font-body text-xs truncate ${conv.id === activeId ? 'text-accent-green' : 'text-text-secondary'}`}>
                {truncate(conv.title || 'Untitled conversation', 40)}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={9} className="text-text-muted" />
                <span className="text-text-muted font-label text-xs">{formatRelativeTime(conv.updated_at)}</span>
                <span className="text-text-muted font-label text-xs ml-auto">{conv.messages?.length || 0} msgs</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
