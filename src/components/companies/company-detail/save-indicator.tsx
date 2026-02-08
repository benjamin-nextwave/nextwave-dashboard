'use client'

import { Loader2, Check } from 'lucide-react'
import type { SaveStatus } from '@/hooks/use-auto-save'

interface SaveIndicatorProps {
  status: SaveStatus
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null

  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Opslaan...
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
        <Check className="size-3" />
        Opgeslagen
      </span>
    )
  }

  // status === 'error'
  return (
    <span className="flex items-center gap-1 text-sm text-destructive">
      Fout bij opslaan
    </span>
  )
}
