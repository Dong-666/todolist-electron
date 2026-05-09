import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

export default function Sidebar() {
  const { todoLists, activeListId, setActiveListId, addList, deleteList, todos } = useStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📝')

  const deletedCount = todos.filter(t => t.deletedAt).length

  const handleCreateList = () => {
    if (newListName.trim()) {
      addList({ name: newListName.trim(), type: 'custom', icon: selectedIcon, color: '#6B7280' })
      setNewListName('')
      setSelectedIcon('📝')
      setIsCreating(false)
    }
  }

  const handleDeleteList = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation()
    deleteList(listId)
  }

  return (
    <aside className="w-60 h-full flex flex-col theme-transition" style={{ background: 'var(--bg-tertiary)', borderRight: '1px solid var(--divider)' }}>
      <div className="p-5">
        <motion.h2
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4"
        >
          清单
        </motion.h2>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {todoLists.map((list, index) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                className="group relative"
              >
                <motion.button
                  onClick={() => setActiveListId(list.id)}
                  className={`sidebar-item w-full ${activeListId === list.id ? 'active' : ''}`}
                >
                  <span className="text-lg">{list.icon}</span>
                  <span className="text-sm font-medium">{list.name}</span>
                </motion.button>
                {list.type === 'custom' && (
                  <button
                    onClick={(e) => handleDeleteList(e, list.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--danger)'
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5">
                      <line x1="2" y1="2" x2="8" y2="8" />
                      <line x1="8" y1="2" x2="2" y2="8" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Trash item */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: todoLists.length * 0.04 }}
            onClick={() => setActiveListId('__trash__')}
            className={`sidebar-item w-full ${activeListId === '__trash__' ? 'active' : ''}`}
          >
            <span className="text-lg">🗑️</span>
            <span className="text-sm font-medium">回收站</span>
            {deletedCount > 0 && (
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--danger)',
                  color: 'white'
                }}
              >
                {deletedCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    placeholder="图标 (输入任意emoji或字符)"
                    className="input-field w-full text-sm text-center"
                    style={{ fontSize: '20px', height: '44px' }}
                  />
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateList()
                      if (e.key === 'Escape') setIsCreating(false)
                    }}
                    placeholder="输入清单名称..."
                    className="input-field w-full text-sm"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--divider)' }}>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-secondary)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(true)}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all flex items-center justify-center gap-2 rounded-xl"
          style={{ background: 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          <span>新建清单</span>
        </motion.button>
      </div>
    </aside>
  )
}
