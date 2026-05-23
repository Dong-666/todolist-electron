import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PriorityOption {
  value: number | null
  label: string
  dotClass?: string
}

interface PriorityDropdownProps {
  value: number | null
  onChange: (value: number | null) => void
  isOpen?: boolean
  onClose?: () => void
  dropup?: boolean
  button?: React.ReactNode
}

const defaultOptions: PriorityOption[] = [
  { value: null, label: '无', dotClass: '' },
  { value: 1, label: '高', dotClass: 'priority-high' },
  { value: 2, label: '中', dotClass: 'priority-medium' },
  { value: 3, label: '低', dotClass: 'priority-low' },
]

export default function PriorityDropdown({
  value,
  onChange,
  isOpen,
  onClose,
  dropup = false,
  button,
}: PriorityDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [autoDropup, setAutoDropup] = useState(dropup)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const open = isOpen !== undefined ? isOpen : internalOpen
  const setOpen = onClose ? () => {} : setInternalOpen

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (onClose) onClose()
        else setInternalOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  useEffect(() => {
    if (open && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      setAutoDropup(rect.bottom + 150 > viewportHeight || dropup)
    }
  }, [open, dropup])

  const handleSelect = (val: number | null) => {
    onChange(val)
    if (onClose) onClose()
    else setInternalOpen(false)
  }

  const options = value === 0 ? defaultOptions.map(o => ({ ...o, value: o.value as number | null })) : defaultOptions

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>
        {button || (
          <div className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-[var(--bg-card)] transition-colors">
            {value ? (
              <div className={`priority-dot priority-${['high', 'medium', 'low'][value - 1]}`} />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full opacity-30" style={{ background: 'var(--text-tertiary)' }} />
            )}
            <span className="text-xs" style={{ color: value ? `var(--priority-${['high', 'medium', 'low'][value - 1]})` : 'var(--text-secondary)' }}>
              {options.find(o => o.value === value)?.label || '无'}
            </span>
          </div>
        )}
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: autoDropup ? 5 : -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`absolute right-0 py-1 rounded-lg shadow-xl z-50 w-28 ${autoDropup ? 'bottom-full mb-1' : 'top-full mt-1'}`}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors"
              style={{
                background: value === opt.value ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: opt.value ? `var(--priority-${['high', 'medium', 'low'][opt.value - 1]})` : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = value === opt.value ? 'rgba(59, 130, 246, 0.12)' : 'transparent'
              }}
            >
              <div
                className={opt.dotClass ? `priority-dot ${opt.dotClass}` : 'w-2.5 h-2.5 rounded-full opacity-30'}
                style={opt.value === null ? { background: 'var(--text-tertiary)' } : {}}
              />
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}