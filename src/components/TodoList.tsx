import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import TodoItem from './TodoItem'
import AddTodoForm from './AddTodoForm'

export default function TodoList() {
  const { todos, activeListId, filter, setFilter, todoLists } = useStore()
  const activeList = todoLists.find(l => l.id === activeListId)

  const filteredTodos = todos
    .filter(t => t.listId === activeListId && !t.deletedAt)
    .filter(t => {
      if (filter.status === 'active' && t.completed) return false
      if (filter.status === 'completed' && !t.completed) return false
      if (filter.priority && t.priority !== filter.priority) return false
      if (filter.tagId && !t.tags.includes(filter.tagId)) return false
      return true
    })
    .sort((a, b) => {
      if (a.priority && b.priority) return a.priority - b.priority
      if (a.priority) return -1
      if (b.priority) return 1
      return b.createdAt - a.createdAt
    })

  const activeCount = filteredTodos.filter(t => !t.completed).length
  const completedCount = filteredTodos.filter(t => t.completed).length

  return (
    <div className="h-full flex flex-col theme-transition" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-5">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--accent-soft)' }}
            >
              {activeList?.icon}
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {activeList?.name}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {activeCount > 0 ? `${activeCount} 项待完成` : completedCount > 0 ? '全部完成 ✓' : '暂无待办'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <select
              value={filter.status}
              onChange={(e) => setFilter({ status: e.target.value as 'all' | 'active' | 'completed' })}
              className="text-xs px-4 py-2 rounded-xl cursor-pointer transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <option value="all">全部</option>
              <option value="active">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </motion.div>
        </div>
      </div>

      {/* Add form */}
      <div className="px-8 pb-5">
        <AddTodoForm listId={activeListId} />
      </div>

      {/* Divider with gradient */}
      <div className="px-8">
        <div
          className="h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--divider), transparent)'
          }}
        />
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ pointerEvents: 'auto' }}>
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.025, duration: 0.25 }}
              className="mb-2.5"
            >
              <TodoItem todo={todo} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4 opacity-20">📋</div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {filter.status === 'all' ? '暂无待办事项' : filter.status === 'active' ? '没有待完成的事项' : '没有已完成的事项'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}