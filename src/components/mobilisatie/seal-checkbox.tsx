'use client'

import { cn } from '@/lib/utils'

interface SealCheckboxProps {
  checked: boolean
  onChange: () => void
}

export function SealCheckbox({ checked, onChange }: SealCheckboxProps) {
  return (
    <button
      onClick={onChange}
      className="flex-shrink-0 relative w-14 h-14 flex items-center justify-center transition-transform hover:scale-110"
      title={checked ? 'Markeer als onvoltooid' : 'Markeer als voltooid'}
    >
      {checked ? (
        // Broken seal
        <div className="relative animate-in zoom-in duration-300">
          <span className="text-3xl opacity-40 blur-[0.5px]">🔴</span>
          <span className="absolute inset-0 flex items-center justify-center text-lg">💥</span>
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-widest whitespace-nowrap"
            style={{ color: '#8b2020', fontFamily: 'var(--font-medieval)' }}
          >
            VOLTOOID
          </span>
        </div>
      ) : (
        // Intact wax seal
        <div className={cn(
          'relative transition-all duration-200',
          'hover:drop-shadow-[0_0_8px_rgba(180,40,40,0.4)]'
        )}>
          <span className="text-4xl">🔴</span>
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ color: '#f4e4c1', fontFamily: 'var(--font-medieval)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            ⚜️
          </span>
        </div>
      )}
    </button>
  )
}
