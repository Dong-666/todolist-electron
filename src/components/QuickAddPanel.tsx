import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'

interface QuickAddPanelProps {
  onClose: () => void
}

export default function QuickAddPanel({ onClose }: QuickAddPanelProps) {
  const [title, setTitle] = useState('')
  const [selectedListId, setSelectedListId] = useState(useStore.getState().activeListId)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addTodo, todoLists } = useStore()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let priority: 1 | 2 | 3 | null = null
    let text = title

    const p1Match = text.match(/#p1\b/i)
    const p2Match = text.match(/#p2\b/i)
    const p3Match = text.match(/#p3\b/i)

    if (p1Match) { priority = 1; text = text.replace(p1Match[0], '').trim() }
    else if (p2Match) { priority = 2; text = text.replace(p2Match[0], '').trim() }
    else if (p3Match) { priority = 3; text = text.replace(p3Match[0], '').trim() }

    addTodo({
      title: text,
      completed: false,
      priority,
      tags: [],
      listId: selectedListId,
    })

    setTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-[480px] p-6 rounded-3xl shadow-2xl"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--divider)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold mb-5"
          style={{ color: 'var(--text-primary)' }}
        >
          快速添加
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入待办内容... (#p1 高优先级 / #p2 中 / #p3 低)"
            className="input-field w-full text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          />

          <motion.select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="input-field w-full text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {todoLists.map(list => (
              <option key={list.id} value={list.id}>{list.icon} {list.name}</option>
            ))}
          </motion.select>

          <div className="flex justify-end gap-3 pt-3">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)'
              }}
            >
              Esc 取消
            </motion.button>
            <motion.button
              type="submit"
              disabled={!title.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enter 添加
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}