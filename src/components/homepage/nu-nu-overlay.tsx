'use client'

import { Check, X, Trash2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type NuNuItem =
  | { type: 'task'; id: string; companyName: string; title: string }
  | { type: 'mail'; id: string; companyName: string }

interface NuNuOverlayProps {
  open: boolean
  onClose: () => void
  items: NuNuItem[]
  onComplete: (item: NuNuItem) => void
  onRemove: (item: NuNuItem) => void
  onClearAll: () => void
}

export function NuNuOverlay({
  open,
  onClose,
  items,
  onComplete,
  onRemove,
  onClearAll,
}: NuNuOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0" style={{
        background: 'linear-gradient(135deg, #f5ebd4, #efe0be)',
        boxShadow: '0 8px 32px rgba(100,70,20,0.25), inset 0 1px 0 rgba(255,250,235,0.5)',
      }}>
        <DialogHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle
              className="text-lg flex items-center gap-2"
              style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
            >
              ⚔️ Nu Nu Taken
            </DialogTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs hover:opacity-80"
                style={{ color: '#8b4020', fontFamily: 'var(--font-medieval)' }}
                onClick={onClearAll}
              >
                <Trash2 className="size-3.5 mr-1" />
                Alles wissen
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="px-5 pb-5 pt-3">
          {items.length === 0 ? (
            <p
              className="text-sm text-center py-8"
              style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
            >
              Geen taken in de Nu Nu lijst.<br />
              Gebruik het ⚔️ icoon om taken toe te voegen.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-all"
                  style={{
                    background: item.type === 'mail'
                      ? 'linear-gradient(135deg, #f8f0dc, #f2e6c8)'
                      : 'linear-gradient(135deg, #f5ebd4, #efe0be)',
                    border: '1px solid rgba(139,109,56,0.3)',
                    boxShadow: '0 1px 4px rgba(100,70,20,0.08)',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs tracking-wide uppercase"
                      style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
                    >
                      {item.type === 'mail' && (
                        <Mail className="size-3 inline mr-1 -mt-0.5" />
                      )}
                      {item.companyName}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
                    >
                      {item.type === 'task' ? item.title : 'Mail sturen'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:opacity-80 rounded-full"
                      style={{ color: '#4a7a2a', background: 'rgba(74,122,42,0.12)' }}
                      onClick={() => onComplete(item)}
                      title="Afgerond"
                    >
                      <Check className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:opacity-80"
                      style={{ color: '#8b7d60' }}
                      onClick={() => onRemove(item)}
                      title="Verwijder uit Nu Nu lijst"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
