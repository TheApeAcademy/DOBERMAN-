const SUPABASE_URL = 'https://bemovimlzrzcztrtikpf.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbW92aW1senJ6Y3p0cnRpa3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjIwNTEsImV4cCI6MjA2MzY5ODA1MX0.Pnl_pNaIaF4bTBL24PN7S0kIHgv2Ht9sEe01Bgs43H0'
const APP_URL = 'https://doberman-kappa.vercel.app'

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'D0B3RMAN_STORE_AUTH') {
    chrome.storage.local.set({ token: msg.token, userId: msg.userId })
  } else if (msg.type === 'D0B3RMAN_CLEAR_AUTH') {
    chrome.storage.local.remove(['token', 'userId'])
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'doberman-image', title: 'Analyze image with D0B3RMAN', contexts: ['image'] })
  chrome.contextMenus.create({ id: 'doberman-text', title: 'Verify with D0B3RMAN', contexts: ['selection'] })
  chrome.contextMenus.create({ id: 'doberman-breach', title: 'Check for Breaches', contexts: ['selection'] })
  chrome.contextMenus.create({ id: 'doberman-link', title: 'Check link with D0B3RMAN', contexts: ['link'] })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { token } = await chrome.storage.local.get('token')

  // Breach check: open dashboard with email pre-filled
  if (info.menuItemId === 'doberman-breach') {
    const selected = info.selectionText || ''
    if (selected.includes('@')) {
      chrome.tabs.create({ url: `${APP_URL}/breach?email=${encodeURIComponent(selected.trim())}` })
    } else {
      chrome.tabs.create({ url: `${APP_URL}/breach` })
    }
    return
  }

  if (!token) {
    chrome.tabs.create({ url: `${APP_URL}/auth?ref=extension` })
    return
  }

  let endpoint, body

  if (info.menuItemId === 'doberman-image') {
    endpoint = 'eyes-analyze'
    body = { file_url: info.srcUrl, file_type: 'image', user_id: null, source: 'extension' }
  } else if (info.menuItemId === 'doberman-text') {
    endpoint = 'news-verify'
    body = { content: info.selectionText, user_id: null, source: 'extension' }
  } else if (info.menuItemId === 'doberman-link') {
    endpoint = 'news-verify'
    body = { content: info.linkUrl, user_id: null, source: 'extension' }
  }

  if (!endpoint || !tab?.id) return

  chrome.tabs.sendMessage(tab.id, { type: 'D0B3RMAN_LOADING' })

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    chrome.tabs.sendMessage(tab.id, { type: 'D0B3RMAN_RESULT', data, analysisType: info.menuItemId })
  } catch {
    chrome.tabs.sendMessage(tab.id, { type: 'D0B3RMAN_ERROR' })
  }
})
