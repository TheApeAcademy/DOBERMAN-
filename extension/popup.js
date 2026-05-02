chrome.storage.local.get('token', ({ token }) => {
  const el = document.getElementById('status')
  if (!token) {
    el.textContent = 'Sign in to activate'
    el.style.color = '#FF2D2D'
  }
})
