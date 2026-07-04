import { useCallback } from 'react'
import { useStore } from '../store/useStore.js'
import { translate } from './i18n.js'

// Hook returning a translator bound to the current language.
export function useT() {
  const lang = useStore((s) => s.lang)
  return useCallback((key, vars) => translate(lang, key, vars), [lang])
}
