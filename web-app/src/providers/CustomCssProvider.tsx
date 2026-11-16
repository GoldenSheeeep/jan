import { useEffect } from 'react'
import { isPlatformTauri } from '@/lib/platform/utils'

const STYLE_ID = 'user-custom-css'

// Applies ~/.config/jan/custom.css over the theme, last in <head> so it wins
// over the app's own rules. Read again whenever the window gets focus, so
// edits show up without restarting.
export function CustomCssProvider() {
  useEffect(() => {
    if (!isPlatformTauri()) return
    let cancelled = false

    const apply = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const css = await invoke<string>('get_custom_css')
        if (cancelled) return
        let style = document.getElementById(STYLE_ID)
        if (!style) {
          style = document.createElement('style')
          style.id = STYLE_ID
        }
        // Re-append to stay after styles injected since the last read.
        document.head.appendChild(style)
        if (style.textContent !== css) style.textContent = css
      } catch (err) {
        console.error('get_custom_css failed:', err)
      }
    }

    apply()
    window.addEventListener('focus', apply)
    return () => {
      cancelled = true
      window.removeEventListener('focus', apply)
    }
  }, [])

  return null
}
