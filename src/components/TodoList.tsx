import { DragEvent, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Todo, useStore } from '../store'
import TodoItem from './TodoItem'
import AddTodoForm from './AddTodoForm'

export default function TodoList() {
  const { todos, activeListId, filter, setFilter, todoLists, setTodos } = useStore()
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null)
  const [dropTargetTodoId, setDropTargetTodoId] = useState<string | null>(null)
  const [insertAfterTargetId, setInsertAfterTargetId] = useState<string | null>(null)
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null)
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
      const aPriority = a.priority ?? 4
      const bPriority = b.priority ?? 4
      if (aPriority !== bPriority) return aPriority - bPriority
      if (a.sortOrder !== undefined || b.sortOrder !== undefined) {
        return (a.sortOrder ?? Number.MAX_SAFE_INTEGER - a.createdAt) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER - b.createdAt)
      }
      return b.createdAt - a.createdAt
    })

  const activeCount = filteredTodos.filter(t => !t.completed).length
  const completedCount = filteredTodos.filter(t => t.completed).length
  const draggedTodo = draggedTodoId ? todos.find(t => t.id === draggedTodoId) : null

  const isVerticalDrag = (event: DragEvent<HTMLDivElement>) => {
    if (!dragStartPosition.current) return true

    const deltaX = Math.abs(event.clientX - dragStartPosition.current.x)
    const deltaY = Math.abs(event.clientY - dragStartPosition.current.y)
    return deltaY >= deltaX
  }

  const canDropOnTodo = (targetTodo: Todo, event?: DragEvent<HTMLDivElement>) => {
    if (!draggedTodo || draggedTodo.id === targetTodo.id) return false
    if (draggedTodo.completed !== targetTodo.completed) return false
    if (event && !isVerticalDrag(event)) return false

    return true
  }

  const clearDragState = () => {
    setDraggedTodoId(null)
    setDropTargetTodoId(null)
    setInsertAfterTargetId(null)
    dragStartPosition.current = null
  }

  const handleDragStart = (todo: Todo, event: DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement

    if (target.closest('button, input, select, textarea')) {
      event.preventDefault()
      return
    }

    setDraggedTodoId(todo.id)
    setDropTargetTodoId(null)
    dragStartPosition.current = { x: event.clientX, y: event.clientY }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', todo.id)
  }

  const handleDragOver = (todo: Todo, event: DragEvent<HTMLDivElement>) => {
    if (!draggedTodo) return

    const isVertical = isVerticalDrag(event)
    if (isVertical && draggedTodo.id !== todo.id) {
      setDropTargetTodoId(todo.id)
      const targetRect = event.currentTarget.getBoundingClientRect()
      setInsertAfterTargetId(event.clientY > targetRect.top + targetRect.height / 2 ? todo.id : null)
    } else {
      setDropTargetTodoId(null)
      setInsertAfterTargetId(null)
    }

    if (!isVertical) {
      event.dataTransfer.dropEffect = 'none'
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = canDropOnTodo(todo, event) ? 'move' : 'none'
  }

  const moveTodoToTarget = (sourceTodo: Todo, targetTodo: Todo, insertAfter: boolean) => {
    const visibleSameStatusTodos = filteredTodos.filter(t => t.completed === sourceTodo.completed)
    const reorderedTodos = visibleSameStatusTodos.filter(t => t.id !== sourceTodo.id)
    const targetIndex = reorderedTodos.findIndex(t => t.id === targetTodo.id)

    if (targetIndex === -1) return

    reorderedTodos.splice(targetIndex + (insertAfter ? 1 : 0), 0, {
      ...sourceTodo,
      priority: targetTodo.priority,
    })

    const now = Date.now()
    const orderByTodoId = new Map(reorderedTodos.map((t, index) => [t.id, index]))
    const nextTodos = todos.map(t => {
      const nextSortOrder = orderByTodoId.get(t.id)

      if (t.id === sourceTodo.id) {
        return {
          ...t,
          priority: targetTodo.priority,
          sortOrder: nextSortOrder,
          updatedAt: now,
        }
      }

      if (nextSortOrder !== undefined) {
        return {
          ...t,
          sortOrder: nextSortOrder,
        }
      }

      return t
    })

    setTodos(nextTodos)
  }

  const handleDrop = (todo: Todo, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (canDropOnTodo(todo, event) && draggedTodo) {
      const targetRect = event.currentTarget.getBoundingClientRect()
      const insertAfter = event.clientY > targetRect.top + targetRect.height / 2
      moveTodoToTarget(draggedTodo, todo, insertAfter)
    }

    clearDragState()
  }

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
              <TodoItem
                todo={todo}
                draggable
                isDragging={draggedTodoId === todo.id}
                isDropTarget={dropTargetTodoId === todo.id}
                insertAfter={dropTargetTodoId === todo.id ? insertAfterTargetId === todo.id : false}
                canDrop={canDropOnTodo(todo)}
                onNativeDragStart={(event) => handleDragStart(todo, event)}
                onDragOver={(event) => handleDragOver(todo, event)}
                onDragLeave={() => setDropTargetTodoId(current => current === todo.id ? null : current)}
                onDrop={(event) => handleDrop(todo, event)}
                onDragEnd={clearDragState}
              />
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
