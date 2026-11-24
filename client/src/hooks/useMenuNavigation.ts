import { useState, useEffect } from 'react'

interface UseMenuNavigationOptions<T extends string> {
  items: T[]
  /** Called when Enter is pressed on the initial item (index 0) */
  onConfirm?: () => void
}

/**
 * Keyboard-driven navigation for a linear list of menu items.
 * ArrowUp/ArrowDown cycle through items; Enter confirms the active item.
 */
export function useMenuNavigation<T extends string>({
  items,
  onConfirm,
}: UseMenuNavigationOptions<T>) {
  const [activeItem, setActiveItem] = useState<T>(items[0])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const currentIndex = items.indexOf(activeItem)
      if (e.key === 'ArrowDown') {
        setActiveItem(items[(currentIndex + 1) % items.length])
      } else if (e.key === 'ArrowUp') {
        setActiveItem(items[(currentIndex - 1 + items.length) % items.length])
      } else if (e.key === 'Enter') {
        onConfirm?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [items, activeItem, onConfirm])

  function navigateTo(item: T) {
    setActiveItem(item)
  }

  return { activeItem, navigateTo }
}
