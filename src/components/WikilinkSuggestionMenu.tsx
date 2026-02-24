import { useRef, useEffect } from 'react'
import './WikilinkSuggestionMenu.css'

export interface WikilinkSuggestionItem {
  title: string
  onItemClick: () => void
  noteType?: string
  typeColor?: string
  aliases?: string[]
  entryTitle?: string
  path?: string
}

interface WikilinkSuggestionMenuProps {
  items: WikilinkSuggestionItem[]
  loadingState: 'loading-initial' | 'loading' | 'loaded'
  selectedIndex: number | undefined
  onItemClick?: (item: WikilinkSuggestionItem) => void
}

export function WikilinkSuggestionMenu({ items, selectedIndex, onItemClick }: WikilinkSuggestionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedIndex === undefined || !menuRef.current) return
    const el = menuRef.current.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (items.length === 0) {
    return (
      <div className="wikilink-menu" ref={menuRef}>
        <div className="wikilink-menu__empty">No results</div>
      </div>
    )
  }

  return (
    <div className="wikilink-menu" ref={menuRef}>
      {items.map((item, index) => (
        <div
          key={`${item.title}-${item.path ?? index}`}
          className={`wikilink-menu__item${index === selectedIndex ? ' wikilink-menu__item--selected' : ''}`}
          onClick={() => {
            item.onItemClick()
            onItemClick?.(item)
          }}
        >
          <span className="wikilink-menu__title">{item.title}</span>
          {item.noteType && (
            <span className="wikilink-menu__type" style={{ color: item.typeColor }}>
              {item.noteType}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
