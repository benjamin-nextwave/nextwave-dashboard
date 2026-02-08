import { useState, useCallback, useRef, useEffect } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(
  saveFn: (updates: Record<string, unknown>) => Promise<void>
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const save = useCallback(
    async (field: string, value: unknown) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      setStatus('saving')

      try {
        await saveFn({ [field]: value })
        setStatus('saved')
        timeoutRef.current = setTimeout(() => {
          setStatus('idle')
        }, 2000)
      } catch {
        setStatus('error')
      }
    },
    [saveFn]
  )

  const saveAll = useCallback(
    async (updates: Record<string, unknown>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      setStatus('saving')

      try {
        await saveFn(updates)
        setStatus('saved')
        timeoutRef.current = setTimeout(() => {
          setStatus('idle')
        }, 2000)
      } catch {
        setStatus('error')
      }
    },
    [saveFn]
  )

  return { status, save, saveAll }
}
