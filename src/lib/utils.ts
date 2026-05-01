export function getRiskColor(score: number): string {
  if (score >= 70) return '#FF3B3B'
  if (score >= 40) return '#FFB020'
  return '#00D46A'
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return 'CRITICAL'
  if (score >= 40) return 'HIGH'
  if (score >= 20) return 'MEDIUM'
  return 'LOW'
}

export function getConfidenceColor(score: number): string {
  if (score <= 40) return '#00D46A'
  if (score <= 70) return '#FFB020'
  return '#FF3B3B'
}

export function getResultLabel(result: string): { label: string; color: string } {
  switch (result) {
    case 'authentic':
      return { label: 'AUTHENTIC', color: '#00D46A' }
    case 'fake':
      return { label: 'LIKELY FAKE', color: '#FF3B3B' }
    default:
      return { label: 'UNCERTAIN', color: '#FFB020' }
  }
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

export function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}

export function getAvatarColor(str: string): string {
  const colors = [
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#EF4444',
    '#06B6D4',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str
}
