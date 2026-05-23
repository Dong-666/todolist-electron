import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import PriorityDropdown from './PriorityDropdown'

interface AddTodoFormProps {
  listId: string
}

const priorityOptions = [
  { value: 0, label: '无', dotClass: '' },
  { value: 1, label: '高', dotClass: 'priority-high' },
  { value: 2, label: '中', dotClass: 'priority-medium' },
  { value: 3, label: '低', dotClass: 'priority-low' },
]

export default function AddTodoForm({ listId }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<0 | 1 | 2 | 3>(0)
  const [isOpen, setIsOpen] = useState(false)
  const { addTodo } = useStore()

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
      <PriorityDropdown
        value={priority || null}
        onChange={(val) => setPriority((val || 0) as 0 | 1 | 2 | 3)}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        button={
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
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
        }
      />
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