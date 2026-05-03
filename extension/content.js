chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'D0B3RMAN_LOADING') showOverlay(null, true)
  if (msg.type === 'D0B3RMAN_RESULT') showOverlay(msg.data, false, msg.analysisType)
  if (msg.type === 'D0B3RMAN_ERROR') showOverlay(null, false, null, true)
})

function showOverlay(data, loading = false, type = null, error = false) {
  document.getElementById('dob-overlay')?.remove()

  const overlay = document.createElement('div')
  overlay.id = 'dob-overlay'

  const score = data?.confidence_score ?? data?.credibility_score ?? 0
  const result = data?.result ?? data?.verdict ?? ''
  const explanation = data?.explanation ?? data?.summary ?? ''
  const color = score < 40 ? '#30D158' : score < 70 ? '#FF9500' : '#FF2D2D'

  overlay.innerHTML = `
    <style>
      @keyframes dobSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    </style>
    <div style="
      position:fixed; bottom:24px; right:24px; z-index:2147483647;
      background:rgba(6,6,6,0.94); backdrop-filter:blur(28px);
      border:1px solid rgba(255,255,255,0.1); border-radius:20px;
      padding:24px; width:300px; font-family:-apple-system,sans-serif; color:white;
      box-shadow:0 24px 60px rgba(0,0,0,0.7);
      animation:dobSlideUp 0.35s ease;
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-family:monospace;font-size:10px;letter-spacing:0.2em;color:#666;">D0B3RMAN</span>
        <button onclick="document.getElementById('dob-overlay').remove()"
          style="background:none;border:none;color:#555;font-size:20px;line-height:1;cursor:pointer;">x</button>
      </div>

      ${loading ? `
        <div style="text-align:center;padding:20px 0;">
          <p style="font-size:13px;color:#666;font-family:monospace;letter-spacing:0.1em;">ANALYZING...</p>
        </div>
      ` : error ? `
        <p style="color:#FF2D2D;font-size:13px;font-family:monospace;">Analysis failed. Check your connection and try again.</p>
      ` : `
        <div style="font-size:56px;font-weight:800;color:${color};line-height:1;margin-bottom:6px;font-family:monospace;">
          ${score}<span style="font-size:24px;">%</span>
        </div>
        <div style="font-size:11px;letter-spacing:0.15em;color:${color};margin-bottom:14px;font-family:monospace;">
          ${result.toUpperCase()}
        </div>
        <p style="font-size:12px;color:#888;line-height:1.55;margin-bottom:18px;font-family:sans-serif;">
          ${explanation}
        </p>
        <a href="https://d0b3rman.vercel.app/dashboard" target="_blank"
          style="display:block;text-align:center;padding:10px;background:white;color:black;text-decoration:none;border-radius:10px;font-size:12px;font-weight:700;font-family:monospace;">
          VIEW FULL REPORT
        </a>
      `}
    </div>
  `

  document.body.appendChild(overlay)
  if (!loading) setTimeout(() => overlay.remove(), 14000)
}
