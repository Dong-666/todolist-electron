import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

export default function Sidebar() {
  const { todoLists, activeListId, setActiveListId, addList, deleteList, todos, updateList } = useStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📝')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [listNameDraft, setListNameDraft] = useState('')

  const deletedCount = todos.filter(t => t.deletedAt).length

  const handleCreateList = () => {
    if (newListName.trim()) {
      addList({ name: newListName.trim(), type: 'custom', icon: selectedIcon, color: '#3b82f6' })
      setNewListName('')
      setSelectedIcon('📝')
      setIsCreating(false)
    }
  }

  const handleDeleteList = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation()
    deleteList(listId)
  }

  const handleListDoubleClick = (listId: string, currentName: string) => {
    setEditingListId(listId)
    setListNameDraft(currentName)
  }

  const handleListSave = () => {
    if (editingListId && listNameDraft.trim()) {
      const list = todoLists.find(l => l.id === editingListId)
      if (list && listNameDraft.trim() !== list.name) {
        updateList(editingListId, { name: listNameDraft.trim() })
      }
    }
    setEditingListId(null)
  }

  const handleListCancel = () => {
    setEditingListId(null)
  }

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleListSave()
    if (e.key === 'Escape') handleListCancel()
  }

  return (
    <aside
      className="w-60 h-full flex flex-col"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)'
      }}
    >
      <div className="p-5">
        <motion.h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-tertiary)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          清单
        </motion.h2>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {todoLists.map((list, index) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="group relative"
              >
                <button
                  onClick={() => setActiveListId(list.id)}
                  className={`sidebar-item w-full ${activeListId === list.id ? 'active' : ''}`}
                >
                  <span className="text-lg">{list.icon}</span>
                  {editingListId === list.id ? (
                    <div className="flex-1 pr-8">
                      <input
                        type="text"
                        value={listNameDraft}
                        onChange={(e) => setListNameDraft(e.target.value)}
                        onKeyDown={handleListKeyDown}
                        onBlur={handleListSave}
                        onClick={(e) => e.stopPropagation()}
                        className="input-field w-full text-sm h-8"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span
                      className="text-sm font-medium truncate cursor-text"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleListDoubleClick(list.id, list.name)
                      }}
                    >
                      {list.name}
                    </span>
                  )}
                </button>

                <button
                    onClick={(e) => handleDeleteList(e, list.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--priority-high)'
                      e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)'
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
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Trash item */}
          <motion.button
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: todoLists.length * 0.04, duration: 0.3 }}
            onClick={() => setActiveListId('__trash__')}
            className={`sidebar-item w-full ${activeListId === '__trash__' ? 'active' : ''}`}
          >
            <span className="text-lg">🗑️</span>
            <span className="text-sm font-medium">回收站</span>
            {deletedCount > 0 && (
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--priority-high)',
                  color: 'white'
                }}
              >
                {deletedCount}
              </span>
            )}
          </motion.button>

          {/* New list creation */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    placeholder="图标"
                    className="input-field w-full text-center"
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

      {/* Footer */}
      <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.button
          onClick={() => setIsCreating(true)}
          whileHover={{ scale: 1.02, backgroundColor: 'var(--accent-soft)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
          style={{ color: 'var(--accent)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
          <span>新建清单</span>
        </motion.button>
      </div>
    </aside>
  )
}
