import { useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions {
  data: unknown
  onSave: (data: unknown) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({ data, onSave, delay = 3000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const savedDataRef = useRef<string>()

  const save = useCallback(async () => {
    const serialized = JSON.stringify(data)
    if (serialized === savedDataRef.current) return

    try {
      await onSave(data)
      savedDataRef.current = serialized
    } catch (error) {
      console.error('[AutoSave] Save failed:', error)
    }
  }, [data, onSave])

  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(save, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  return { save }
}
