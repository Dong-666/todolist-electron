import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'

interface AddTodoFormProps {
  listId: string
}

export default function AddTodoForm({ listId }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<0 | 1 | 2 | 3>(0)
  const { addTodo } = useStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let finalPriority: 1 | 2 | 3 | null = null
    let text = title

    // 优先使用下拉框选择的优先级
    if (priority > 0) {
      finalPriority = priority as 1 | 2 | 3
    } else {
      // 否则检查文字中的 #p1/#p2/#p3
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
      <select
        value={priority}
        onChange={(e) => setPriority(Number(e.target.value) as 0 | 1 | 2 | 3)}
        className="priority-select"
        style={{ width: '90px' }}
      >
        <option value={0}>无</option>
        <option value={1}>🔴 高</option>
        <option value={2}>🟡 中</option>
        <option value={3}>🟣 低</option>
      </select>
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
