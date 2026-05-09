import { useStore, Todo } from '../store'

interface TodoItemProps {
  todo: Todo
}

const priorityColors = {
  1: { dot: '#f43f5e', glow: 'rgba(244, 63, 94, 0.2)' },
  2: { dot: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },
  3: { dot: '#6366f1', glow: 'rgba(99, 102, 241, 0.2)' },
}

export default function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useStore()

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-2xl transition-all"
      style={{
        background: todo.completed ? 'transparent' : 'var(--bg-secondary)',
        border: '1px solid var(--divider)'
      }}
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
                    backgroundColor: tag.color + '15',
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
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: priorityColors[todo.priority].dot,
            boxShadow: `0 0 6px ${priorityColors[todo.priority].glow}`
          }}
          title={`P${todo.priority}`}
        />
      )}

      {/* Delete button - subtle X icon */}
      <button
        onClick={() => deleteTodo(todo.id)}
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
      >
        <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
          <line x1="2" y1="2" x2="10" y2="10" />
          <line x1="10" y1="2" x2="2" y2="10" />
        </svg>
      </button>
    </div>
  )
}