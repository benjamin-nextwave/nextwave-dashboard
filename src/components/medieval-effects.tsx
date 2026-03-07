'use client'

import { useEffect } from 'react'

function createSlash(x: number, y: number) {
  const el = document.createElement('span')
  el.className = 'sword-slash'
  el.textContent = '⚔️'
  el.style.left = `${x - 14}px`
  el.style.top = `${y - 14}px`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 350)
}

export function MedievalEffects() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      createSlash(e.clientX, e.clientY)
    }
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}
