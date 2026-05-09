import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

export default function TrashList() {
  const { todos, permanentlyDeleteTodo, permanentlyDeleteAllTrash, restoreTodo, todoLists } = useStore()

  const deletedTodos = todos.filter(t => t.deletedAt)

  if (deletedTodos.length === 0) {
    return (
      <div className="h-full flex flex-col theme-transition" style={{ background: 'var(--bg-primary)' }}>
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                🗑️
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  回收站
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  已删除的待办事项
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-30">🗑️</div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              回收站是空的
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col theme-transition" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-8 pt-8 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              🗑️
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                回收站
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {deletedTodos.length} 项已删除
              </p>
            </div>
          </div>

          {deletedTodos.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={permanentlyDeleteAllTrash}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)'
              }}
            >
              清空回收站
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-8 pb-5">
        <div
          className="h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--divider), transparent)'
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <AnimatePresence>
          {deletedTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.025, duration: 0.25 }}
              className="mb-2.5"
            >
              <div
                className="group flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--divider)',
                  opacity: 0.7
                }}
              >
                <button
                  onClick={() => restoreTodo(todo.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{
                    color: 'var(--text-tertiary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--success)'
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  title="恢复"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {todo.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {todoLists.find(l => l.id === todo.listId)?.icon} {todoLists.find(l => l.id === todo.listId)?.name || '未知清单'} · 删除于 {new Date(todo.deletedAt!).toLocaleString('zh-CN')}
                  </p>
                </div>

                <button
                  onClick={() => permanentlyDeleteTodo(todo.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{
                    color: 'var(--text-tertiary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--danger)'
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  title="永久删除"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}