import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'

interface AddTodoFormProps {
  listId: string
}

export default function AddTodoForm({ listId }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const { addTodo } = useStore()

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
      listId,
    })

    setTitle('')
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex gap-3"
      style={{ pointerEvents: 'auto' }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="添加新待办..."
        className="input-field flex-1 text-sm"
      />
      <motion.button
        type="submit"
        disabled={!title.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        添加
      </motion.button>
    </motion.form>
  )
}