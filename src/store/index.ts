import { create } from 'zustand'
import { WeatherData } from '../utils/weather'
import { getFocusDuration, getBreakDuration } from '../utils/pomodoro'

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
  addList: (list) => set((state) => {
    const newList = { ...list, id: Date.now().toString(), createdAt: Date.now() }
    const newLists = [...state.todoLists, newList]
    window.electronAPI.setStore('todoLists', newLists)
    return { todoLists: newLists }
  }),
  updateList: (id, updates) => set((state) => {
    const newLists = state.todoLists.map(l => l.id === id ? { ...l, ...updates } : l)
    window.electronAPI.setStore('todoLists', newLists)
    return { todoLists: newLists }
  }),
  deleteList: (id) => set((state) => {
    const listTodos = state.todos.filter(t => t.listId === id)
    const activeCount = listTodos.filter(t => !t.deletedAt).length
    const trashCount = listTodos.filter(t => t.deletedAt).length

    if (activeCount > 0 || trashCount > 0) {
      const msg = `确定要删除这个清单吗？\n\n将删除：\n• ${activeCount} 个待办${activeCount > 0 ? '（含活跃）' : ''}\n• ${trashCount} 个回收站待办${trashCount > 0 ? '（将一并物理删除）' : ''}`
      if (!confirm(msg)) return state
    }

    const newLists = state.todoLists.filter(l => l.id !== id)
    const newTodos = state.todos.filter(t => t.listId !== id)
    window.electronAPI.setStore('todoLists', newLists)
    window.electronAPI.setStore('todos', newTodos)
    return {
      todoLists: newLists,
      todos: newTodos,
      activeListId: state.activeListId === id ? 'default' : state.activeListId
    }
  }),
  todos: [],
  addTodo: (todo) => set((state) => {
    const newTodo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null
    }
    const newTodos = [...state.todos, newTodo]
    window.electronAPI.setStore('todos', newTodos)
    return { todos: newTodos }
  }),
  updateTodo: (id, updates) => set((state) => {
    const newTodos = state.todos.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t)
    window.electronAPI.setStore('todos', newTodos)
    return { todos: newTodos }
  }),
  deleteTodo: (id) => set((state) => {
    const newTodos = state.todos.map(t => t.id === id ? { ...t, deletedAt: Date.now() } : t)
    window.electronAPI.setStore('todos', newTodos)
    return { todos: newTodos }
  }),
  permanentlyDeleteTodo: (id) => set((state) => {
    const newTodos = state.todos.filter(t => t.id !== id)
    const newTombstones = [...state.tombstones, id]
    window.electronAPI.setStore('todos', newTodos)
    window.electronAPI.setStore('tombstones', newTombstones)
    return { todos: newTodos, tombstones: newTombstones }
  }),
  permanentlyDeleteAllTrash: () => set((state) => {
    const deletedIds = state.todos.filter(t => t.deletedAt).map(t => t.id)
    const newTodos = state.todos.filter(t => !t.deletedAt)
    const newTombstones = [...state.tombstones, ...deletedIds]
    window.electronAPI.setStore('todos', newTodos)
    window.electronAPI.setStore('tombstones', newTombstones)
    return { todos: newTodos, tombstones: newTombstones }
  }),
  restoreTodo: (id) => set((state) => {
    const newTodos = state.todos.map(t => t.id === id ? { ...t, deletedAt: null } : t)
    window.electronAPI.setStore('todos', newTodos)
    return { todos: newTodos }
  }),
  toggleTodo: (id) => set((state) => {
    const newTodos = state.todos.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t)
    window.electronAPI.setStore('todos', newTodos)
    return { todos: newTodos }
  }),
  tags: [],
  addTag: (tag) => set((state) => {
    const newTag = { ...tag, id: Date.now().toString() }
    const newTags = [...state.tags, newTag]
    window.electronAPI.setStore('tags', newTags)
    return { tags: newTags }
  }),
  updateTag: (id, updates) => set((state) => {
    const newTags = state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
    window.electronAPI.setStore('tags', newTags)
    return { tags: newTags }
  }),
  deleteTag: (id) => set((state) => {
    const newTags = state.tags.filter(t => t.id !== id)
    window.electronAPI.setStore('tags', newTags)
    return { tags: newTags }
  }),
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  filter: { status: 'all', priority: null, tagId: null },
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
  syncStatus: 'idle',
  setSyncStatus: (status) => set({ syncStatus: status }),
  lastSyncTime: null,
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setTodos: (todos) => {
    window.electronAPI.setStore('todos', todos)
    set({ todos })
  },
  setTodoLists: (todoLists) => {
    window.electronAPI.setStore('todoLists', todoLists)
    set({ todoLists })
  },
  setTags: (tags) => {
    window.electronAPI.setStore('tags', tags)
    set({ tags })
  },
  tombstones: [],
  addTombstone: (id) => set((state) => ({ tombstones: [...state.tombstones, id] })),
  clearTombstones: () => set({ tombstones: [] }),
  weather: null,
  setWeather: (weather) => set({ weather }),
  focusMode: false,
  focusTodoId: null,
  focusTimeRemaining: getFocusDuration(),
  focusStatus: 'idle',
  setFocusMode: (mode) => set({ focusMode: mode }),
  setFocusTodoId: (id) => set({ focusTodoId: id }),
  setFocusTimeRemaining: (time) => set({ focusTimeRemaining: time }),
  setFocusStatus: (status) => set({ focusStatus: status }),
  startFocus: (todoId) => set({
    focusMode: true,
    focusTodoId: todoId,
    focusTimeRemaining: getFocusDuration(),
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
    focusTimeRemaining: getFocusDuration(),
    focusStatus: 'idle'
  }),
  tickFocus: () => set((state) => {
    if (state.focusTimeRemaining <= 0) {
      if (state.focusStatus === 'working') {
        return { focusStatus: 'break', focusTimeRemaining: getBreakDuration() }
      } else if (state.focusStatus === 'break') {
        return { focusStatus: 'completed' }
      }
    }
    return { focusTimeRemaining: state.focusTimeRemaining - 1 }
  }),
}))
