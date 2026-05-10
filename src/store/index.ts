import { create } from 'zustand'
import { WeatherData } from '../utils/weather'
import { FOCUS_DURATION, BREAK_DURATION } from '../utils/pomodoro'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 1 | 2 | 3 | null
  tags: string[]
  listId: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

export interface TodoList {
  id: string
  name: string
  type: 'task' | 'book' | 'movie' | 'custom'
  icon: string
  color: string
  createdAt: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type FocusStatus = 'idle' | 'working' | 'paused' | 'break' | 'completed'

interface FocusState {
  focusMode: boolean
  focusTodoId: string | null
  focusTimeRemaining: number
  focusStatus: FocusStatus
  focusPreviousStatus: FocusStatus | null
  setFocusMode: (mode: boolean) => void
  setFocusTodoId: (id: string | null) => void
  setFocusTimeRemaining: (time: number) => void
  setFocusStatus: (status: FocusStatus) => void
  startFocus: (todoId: string) => void
  pauseFocus: () => void
  resumeFocus: () => void
  endFocus: () => void
  tickFocus: () => void
}

interface StoreState extends FocusState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  todoLists: TodoList[]
  activeListId: string
  setActiveListId: (id: string) => void
  addList: (list: Omit<TodoList, 'id' | 'createdAt'>) => void
  updateList: (id: string, updates: Partial<TodoList>) => void
  deleteList: (id: string) => void
  todos: Todo[]
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  permanentlyDeleteTodo: (id: string) => void
  permanentlyDeleteAllTrash: () => void
  restoreTodo: (id: string) => void
  toggleTodo: (id: string) => void
  tags: Tag[]
  addTag: (tag: Omit<Tag, 'id'>) => void
  updateTag: (id: string, updates: Partial<Tag>) => void
  deleteTag: (id: string) => void
  quickAddOpen: boolean
  setQuickAddOpen: (open: boolean) => void
  filter: {
    status: 'all' | 'active' | 'completed'
    priority: number | null
    tagId: string | null
  }
  setFilter: (filter: Partial<StoreState['filter']>) => void
  syncStatus: 'idle' | 'syncing' | 'error'
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void
  lastSyncTime: number | null
  setLastSyncTime: (time: number | null) => void
  setTodos: (todos: Todo[]) => void
  setTodoLists: (lists: TodoList[]) => void
  setTags: (tags: Tag[]) => void
  tombstones: string[]
  addTombstone: (id: string) => void
  clearTombstones: () => void
  weather: WeatherData | null
  setWeather: (weather: WeatherData | null) => void
}

const defaultLists: TodoList[] = [
  { id: 'default', name: '任务', type: 'task', icon: '📋', color: '#3B82F6', createdAt: Date.now() },
  { id: 'books', name: '阅读书单', type: 'book', icon: '📚', color: '#10B981', createdAt: Date.now() },
  { id: 'movies', name: '观影单', type: 'movie', icon: '🎬', color: '#8B5CF6', createdAt: Date.now() },
]

export const useStore = create<StoreState>((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    set({ theme })
    window.electronAPI.setStore('theme', theme)
  },
  todoLists: defaultLists,
  activeListId: 'default',
  setActiveListId: (id) => set({ activeListId: id }),
  addList: (list) => set((state) => ({
    todoLists: [...state.todoLists, { ...list, id: Date.now().toString(), createdAt: Date.now() }]
  })),
  updateList: (id, updates) => set((state) => ({
    todoLists: state.todoLists.map(l => l.id === id ? { ...l, ...updates } : l)
  })),
  deleteList: (id) => set((state) => {
    const listTodos = state.todos.filter(t => t.listId === id)
    const activeCount = listTodos.filter(t => !t.deletedAt).length
    const trashCount = listTodos.filter(t => t.deletedAt).length

    if (activeCount > 0 || trashCount > 0) {
      const msg = `确定要删除这个清单吗？\n\n将删除：\n• ${activeCount} 个待办${activeCount > 0 ? '（含活跃）' : ''}\n• ${trashCount} 个回收站待办${trashCount > 0 ? '（将一并物理删除）' : ''}`
      if (!confirm(msg)) return state
    }

    return {
      todoLists: state.todoLists.filter(l => l.id !== id),
      todos: state.todos.filter(t => t.listId !== id),
      activeListId: state.activeListId === id ? 'default' : state.activeListId
    }
  }),
  todos: [],
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, {
      ...todo,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null
    }]
  })),
  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t)
  })),
  deleteTodo: (id) => set((state) => ({
    todos: state.todos.map(t => t.id === id ? { ...t, deletedAt: Date.now() } : t)
  })),
  permanentlyDeleteTodo: (id) => set((state) => ({
    todos: state.todos.filter(t => t.id !== id),
    tombstones: [...state.tombstones, id]
  })),
  permanentlyDeleteAllTrash: () => set((state) => {
    const deletedIds = state.todos.filter(t => t.deletedAt).map(t => t.id)
    return {
      todos: state.todos.filter(t => !t.deletedAt),
      tombstones: [...state.tombstones, ...deletedIds]
    }
  }),
  restoreTodo: (id) => set((state) => ({
    todos: state.todos.map(t => t.id === id ? { ...t, deletedAt: null } : t)
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t)
  })),
  tags: [],
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, { ...tag, id: Date.now().toString() }]
  })),
  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter(t => t.id !== id)
  })),
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  filter: { status: 'all', priority: null, tagId: null },
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
  syncStatus: 'idle',
  setSyncStatus: (status) => set({ syncStatus: status }),
  lastSyncTime: null,
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setTodos: (todos) => set({ todos }),
  setTodoLists: (todoLists) => set({ todoLists }),
  setTags: (tags) => set({ tags }),
  tombstones: [],
  addTombstone: (id) => set((state) => ({ tombstones: [...state.tombstones, id] })),
  clearTombstones: () => set({ tombstones: [] }),
  weather: null,
  setWeather: (weather) => set({ weather }),
  focusMode: false,
  focusTodoId: null,
  focusTimeRemaining: FOCUS_DURATION,
  focusStatus: 'idle',
  setFocusMode: (mode) => set({ focusMode: mode }),
  setFocusTodoId: (id) => set({ focusTodoId: id }),
  setFocusTimeRemaining: (time) => set({ focusTimeRemaining: time }),
  setFocusStatus: (status) => set({ focusStatus: status }),
  startFocus: (todoId) => set({
    focusMode: true,
    focusTodoId: todoId,
    focusTimeRemaining: FOCUS_DURATION,
    focusStatus: 'working'
  }),
  focusPreviousStatus: null,
  pauseFocus: () => set((state) => ({
    focusStatus: 'paused',
    focusPreviousStatus: state.focusStatus === 'paused' ? state.focusPreviousStatus : state.focusStatus
  })),
  resumeFocus: () => set((state) => ({
    focusStatus: state.focusPreviousStatus || 'working'
  })),
  endFocus: () => set({
    focusMode: false,
    focusTodoId: null,
    focusTimeRemaining: FOCUS_DURATION,
    focusStatus: 'idle'
  }),
  tickFocus: () => set((state) => {
    if (state.focusTimeRemaining <= 0) {
      if (state.focusStatus === 'working') {
        return { focusStatus: 'break', focusTimeRemaining: BREAK_DURATION }
      } else if (state.focusStatus === 'break') {
        return { focusStatus: 'completed' }
      }
    }
    return { focusTimeRemaining: state.focusTimeRemaining - 1 }
  }),
}))
