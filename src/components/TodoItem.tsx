import { motion } from 'framer-motion'
import { useStore, Todo } from '../store'

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useStore()

  return (
    <div
      className={`todo-item group ${todo.completed ? 'completed' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`checkbox ${todo.completed ? 'checked' : ''}`}
      >
        {todo.completed && (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2">
            <polyline points="1.5,5.5 4.5,8.5 9.5,2.5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          title={todo.title}
          style={{
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? 'var(--text-tertiary)' : 'var(--text-primary)'
          }}
        >
          {todo.title}
        </p>
        {todo.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {todo.tags.map(tagId => {
              const tag = useStore.getState().tags.find(t => t.id === tagId)
              return tag ? (
                <span
                  key={tagId}
                  className="badge"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* Priority indicator */}
      {todo.priority && !todo.completed && (
        <div
          className={`priority-dot priority-${['high', 'medium', 'low'][todo.priority - 1]}`}
          title={`P${todo.priority}`}
        />
      )}

      {/* Delete button - always visible when not completed */}
      {!todo.completed && (
        <button
          onClick={() => deleteTodo(todo.id)}
          className="delete-btn"
          style={{ opacity: 0.6 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.color = 'var(--priority-high)'
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6'
            e.currentTarget.style.color = 'var(--text-tertiary)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>
      )}
    </div>
  )
}
