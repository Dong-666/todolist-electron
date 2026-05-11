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
      // 已完成的放到最后
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      // 未完成的按优先级排序（高优先级在前）
      if (a.priority && b.priority) return a.priority - b.priority
      if (a.priority) return -1
      if (b.priority) return 1
      return b.createdAt - a.createdAt
    })

  const activeCount = filteredTodos.filter(t => !t.completed).length
  const completedCount = filteredTodos.filter(t => t.completed).length

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-5">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              {activeList?.icon}
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {activeList?.name}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {activeCount > 0 ? `${activeCount} 项待完成` : completedCount > 0 ? '全部完成' : '暂无待办'}
              </p>
            </div>
          </div>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ status: e.target.value as 'all' | 'active' | 'completed' })}
          >
            <option value="all">全部</option>
            <option value="active">待完成</option>
            <option value="completed">已完成</option>
          </select>
        </motion.div>
      </div>

      {/* Add form */}
      <motion.div
        className="px-8 pb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <AddTodoForm listId={activeListId} />
      </motion.div>

      {/* Divider */}
      <div className="px-8">
        <div className="divider" />
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        <AnimatePresence>
          {filteredTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="mb-2.5"
            >
              <TodoItem todo={todo} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="text-center py-16"
          >
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {filter.status === 'all' ? '暂无待办事项' : filter.status === 'active' ? '没有待完成的事项' : '没有已完成的事项'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
