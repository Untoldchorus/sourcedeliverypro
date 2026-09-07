'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}

export function TranslateWidget() {
  useEffect(() => {
    // Add the translate init function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: true },
        'google_translate_element'
      )
    }

    // Inject the Google Translate script
    const existing = document.getElementById('google-translate-script')
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return null // The widget renders in the #google_translate_element div in the Navbar
}
