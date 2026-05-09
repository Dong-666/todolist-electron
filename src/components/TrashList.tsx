import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

export default function TrashList() {
  const { todos, permanentlyDeleteTodo, permanentlyDeleteAllTrash, restoreTodo, todoLists } = useStore()

  const deletedTodos = todos.filter(t => t.deletedAt)

  if (deletedTodos.length === 0) {
    return (
      <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        <div className="px-8 pt-8 pb-5">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              🗑️
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                回收站
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                已删除的待办事项
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-4xl mb-3 opacity-30">🗑️</div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              回收站是空的
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-8 pt-8 pb-5">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              🗑️
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                回收站
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {deletedTodos.length} 项已删除
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => {
              if (confirm('确定要清空回收站吗？此操作不可恢复。')) {
                permanentlyDeleteAllTrash()
              }
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(248, 113, 113, 0.12)',
              color: 'var(--priority-high)'
            }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(248, 113, 113, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            清空回收站
          </motion.button>
        </motion.div>
      </div>

      <div className="px-8">
        <div className="divider" />
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5">
        <AnimatePresence>
          {deletedTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="mb-2.5"
            >
              <div
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)'
                }}
              >
                <motion.button
                  onClick={() => restoreTodo(todo.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ color: 'var(--accent)', opacity: 0.6 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="恢复"
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </motion.button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" title={todo.title} style={{ color: 'var(--text-primary)' }}>
                    {todo.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {todoLists.find(l => l.id === todo.listId)?.icon} {todoLists.find(l => l.id === todo.listId)?.name || '未知清单'} · 删除于 {new Date(todo.deletedAt!).toLocaleString('zh-CN')}
                  </p>
                </div>

                <motion.button
                  onClick={() => {
                    if (confirm('确定要永久删除这条待办吗？此操作不可恢复。')) {
                      permanentlyDeleteTodo(todo.id)
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ color: 'var(--priority-high)', opacity: 0.6 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="永久删除"
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
