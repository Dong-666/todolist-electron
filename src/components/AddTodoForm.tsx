import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'

interface AddTodoFormProps {
  listId: string
}

export default function AddTodoForm({ listId }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<0 | 1 | 2 | 3>(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const { addTodo } = useStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const priorityOptions = [
    { value: 0, label: '无', dotClass: '' },
    { value: 1, label: '高', dotClass: 'priority-high' },
    { value: 2, label: '中', dotClass: 'priority-medium' },
    { value: 3, label: '低', dotClass: 'priority-low' },
  ]

  const currentPriority = priorityOptions.find(p => p.value === priority) || priorityOptions[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let finalPriority: 1 | 2 | 3 | null = null
    let text = title

    if (priority > 0) {
      finalPriority = priority as 1 | 2 | 3
    } else {
      const p1Match = text.match(/#p1\b/i)
      const p2Match = text.match(/#p2\b/i)
      const p3Match = text.match(/#p3\b/i)

      if (p1Match) { finalPriority = 1; text = text.replace(p1Match[0], '').trim() }
      else if (p2Match) { finalPriority = 2; text = text.replace(p2Match[0], '').trim() }
      else if (p3Match) { finalPriority = 3; text = text.replace(p3Match[0], '').trim() }
    }

    addTodo({
      title: text,
      completed: false,
      priority: finalPriority,
      tags: [],
      listId,
    })

    setTitle('')
    setPriority(0)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Priority dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between px-4"
          style={{
            width: '80px',
            height: '50px',
            background: 'var(--bg-tertiary)',
            border: '1px solid transparent',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <div className="flex items-center gap-2">
            {priority > 0 ? (
              <div className={`priority-dot ${['priority-high', 'priority-medium', 'priority-low'][priority - 1]}`} />
            ) : (
              <div className="w-2 h-2 rounded-full opacity-30" style={{ background: 'var(--text-tertiary)' }} />
            )}
            <span className="text-xs">{currentPriority.label}</span>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '8px' }}>▼</span>
        </button>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute left-0 top-full mt-1 py-1 rounded-xl shadow-xl z-50 w-28"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {priorityOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  setPriority(opt.value as 0 | 1 | 2 | 3)
                  setShowDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors"
                style={{
                  background: priority === opt.value ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                  color: opt.value > 0 ? `var(--priority-${['high', 'medium', 'low'][opt.value - 1]})` : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = priority === opt.value ? 'rgba(59, 130, 246, 0.12)' : 'transparent'
                }}
              >
                <div className={opt.dotClass ? `priority-dot ${opt.dotClass}` : 'w-2.5 h-2.5 rounded-full opacity-30'} style={opt.value === 0 ? { background: 'var(--text-tertiary)' } : {}} />
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
      <motion.input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="添加新待办... (也可以输入 #p1/#p2/#p3)"
        className="input-field flex-1 text-sm"
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
      />
      <motion.button
        type="submit"
        disabled={!title.trim()}
        whileHover={title.trim() ? { scale: 1.03, boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)' } : {}}
        whileTap={{ scale: 0.97 }}
        className="btn-primary px-5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        添加
      </motion.button>
    </motion.form>
  )
}
