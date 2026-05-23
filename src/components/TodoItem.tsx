import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore, Todo } from '../store'
import ActionButton from './ActionButton'

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo, startFocus, updateTodo } = useStore()
  const [showPriority, setShowPriority] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [priorityDropup, setPriorityDropup] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleTitleDoubleClick = () => {
    setTitleDraft(todo.title)
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    if (titleDraft.trim() && titleDraft !== todo.title) {
      updateTodo(todo.id, { title: titleDraft.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTitleDraft(todo.title)
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSave()
    if (e.key === 'Escape') handleTitleCancel()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPriority(false)
      }
    }
    if (showPriority) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPriority])

  useEffect(() => {
    if (showPriority && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      setPriorityDropup(rect.bottom + 150 > viewportHeight)
    }
  }, [showPriority])

  const priorityOptions: Array<{ value: 1 | 2 | 3 | null; label: string }> = [
    { value: null, label: '无' },
    { value: 1, label: '高' },
    { value: 2, label: '中' },
    { value: 3, label: '低' },
  ]

  return (
    <motion.div
      className={`todo-item group ${todo.completed ? 'completed' : ''}`}
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => {
        setShowButtons(false)
        setShowPriority(false)
      }}
      layout
      initial={false}
      animate={{
        opacity: todo.completed ? 0.65 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Checkbox */}
      <motion.button
        onClick={() => toggleTodo(todo.id)}
        className={`checkbox ${todo.completed ? 'checked' : ''}`}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.div
          initial={false}
          animate={todo.completed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2">
            <polyline points="1.5,5.5 4.5,8.5 9.5,2.5" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleSave}
            className="input-field w-full text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <motion.p
            className="text-sm truncate cursor-text"
            title={todo.title}
            onDoubleClick={handleTitleDoubleClick}
            animate={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
              opacity: todo.completed ? 0.6 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {todo.title}
          </motion.p>
        )}
        {todo.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {todo.tags.map(tagId => {
              const tag = useStore.getState().tags.find(t => t.id === tagId)
              return tag ? (
                <span
                  key={tagId}
                  className="badge"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* Priority selector */}
      {!todo.completed && (
        <div className="relative" ref={dropdownRef}>
          <ActionButton
            icon={
              todo.priority ? (
                <div className={`priority-dot priority-${['high', 'medium', 'low'][todo.priority - 1]}`} />
              ) : (
                <span className="text-xs">⚡</span>
              )
            }
            onClick={() => setShowPriority(!showPriority)}
            color={todo.priority ? `var(--priority-${['high', 'medium', 'low'][todo.priority - 1]})` : 'var(--text-tertiary)'}
            hoverBg="rgba(59, 130, 246, 0.12)"
            title="设置优先级"
            visible={showButtons || !!todo.priority}
          />
          {showPriority && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: priorityDropup ? 5 : -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`absolute right-0 py-1 rounded-lg shadow-xl z-50 w-28 ${priorityDropup ? 'bottom-full mb-1' : 'top-full mt-1'}`}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {priorityOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    updateTodo(todo.id, { priority: opt.value })
                    setShowPriority(false)
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors"
                  style={{
                    background: todo.priority === opt.value ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    color: opt.value ? `var(--priority-${['high', 'medium', 'low'][opt.value - 1]})` : 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = todo.priority === opt.value ? 'rgba(59, 130, 246, 0.12)' : 'transparent'
                  }}
                >
                  <div
                    className={opt.value ? `priority-dot priority-${['high', 'medium', 'low'][opt.value - 1]}` : 'w-2.5 h-2.5 rounded-full opacity-30'}
                    style={opt.value ? {} : { background: 'var(--text-tertiary)' }}
                  />
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Focus button */}
      {!todo.completed && (
        <ActionButton
          icon={<span>🍅</span>}
          onClick={() => startFocus(todo.id)}
          hoverBg="rgba(59, 130, 246, 0.12)"
          title="专注"
          visible={showButtons}
        />
      )}

      {/* Delete button */}
      {!todo.completed && (
        <ActionButton
          icon={
            <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          }
          onClick={() => deleteTodo(todo.id)}
          color="var(--priority-high)"
          hoverBg="rgba(248, 113, 113, 0.12)"
          title="删除"
          visible={showButtons}
        />
      )}
    </motion.div>
  )
}