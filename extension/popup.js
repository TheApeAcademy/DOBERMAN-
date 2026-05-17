const SUPABASE_URL = 'https://bemovimlzrzcztrtikpf.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbW92aW1senJ6Y3p0cnRpa3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjIwNTEsImV4cCI6MjA2MzY5ODA1MX0.Pnl_pNaIaF4bTBL24PN7S0kIHgv2Ht9sEe01Bgs43H0'

async function loadStats() {
  const { token, userId } = await chrome.storage.local.get(['token', 'userId'])

  if (!token || !userId) {
    document.getElementById('status-dot').style.background = '#FF2D2D'
    document.getElementById('status-text').textContent = 'Sign in to activate'
    document.getElementById('status-text').style.color = '#FF2D2D'
    document.getElementById('auth-hint').style.display = 'block'
    document.getElementById('stats').style.opacity = '0.3'
    return
  }

  document.getElementById('user-label').textContent = 'AUTHENTICATED'

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/usage_logs?select=module&user_id=eq.${userId}&created_at=gte.${today.toISOString()}`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${token}`,
        }
      }
    )

    if (res.ok) {
      const logs = await res.json()
      const eyes = logs.filter(l => l.module === 'eyes').length
      const news = logs.filter(l => l.module === 'news').length
      const breach = logs.filter(l => l.module === 'breach').length

      document.getElementById('eyes-count').textContent = eyes
      document.getElementById('news-count').textContent = news
      document.getElementById('breach-count').textContent = breach
    }
  } catch {
    // Stats unavailable — show dashes
  }
}

loadStats()
