import type { SyntheticEvent } from 'react'

/** Hide the broken <img> and reveal the sibling fallback element. */
export function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  img.style.display = 'none'
  const fallback = img.nextSibling as HTMLElement | null
  if (fallback?.style) fallback.style.display = 'flex'
}
