import { Octokit } from '@octokit/rest'
import { encrypt, decrypt } from './crypto'
import { useStore, Todo, TodoList, Tag } from '../store'

interface SyncData {
  todos: Todo[]
  lists: TodoList[]
  tags: Tag[]
  updatedAt: number
}

let octokit: Octokit | null = null

export function initOctokit(token: string) {
  octokit = new Octokit({ auth: token })
}

export async function syncToGist(gistId: string, encryptionKey: string, data: SyncData) {
  if (!octokit) return { success: false, error: 'Octokit not initialized' }

  try {
    const { tombstones } = useStore.getState()
    const filteredTodos = data.todos.filter(t => !tombstones.includes(t.id))
    const filteredLists = data.lists.filter(l => !tombstones.includes(l.id))
    const jsonData = JSON.stringify({ ...data, todos: filteredTodos, lists: filteredLists })
    const encrypted = await encrypt(jsonData, encryptionKey)

    await octokit.gists.update({
      gist_id: gistId,
      files: {
        'todolist-data.json': {
          content: encrypted,
        },
      },
    })

    useStore.getState().setLastSyncTime(Date.now())
    return { success: true }
  } catch (error) {
    console.error('Sync error:', error)
    return { success: false, error: String(error) }
  }
}

export async function syncFromGist(gistId: string, encryptionKey: string) {
  if (!octokit) return { success: false, error: 'Octokit not initialized' }

  try {
    const response = await octokit.gists.get({ gist_id: gistId })
    const file = response.data.files?.['todolist-data.json']
    if (!file?.content) {
      return { success: true, data: null }
    }

    const decrypted = await decrypt(file.content, encryptionKey)
    const data: SyncData = JSON.parse(decrypted)

    useStore.getState().setLastSyncTime(Date.now())
    return { success: true, data }
  } catch (error) {
    console.error('Fetch error:', error)
    return { success: false, error: String(error) }
  }
}

export function detectConflict(local: SyncData, remote: SyncData): boolean {
  return local.updatedAt > remote.updatedAt
}

export function mergeSyncData(local: SyncData, remote: SyncData, tombstones: string[] = []): SyncData {
  const mergeTodos = (localTodos: Todo[], remoteTodos: Todo[]): Todo[] => {
    const merged = new Map<string, Todo>()
    for (const t of localTodos) {
      if (!tombstones.includes(t.id)) merged.set(t.id, t)
    }
    for (const t of remoteTodos) {
      if (tombstones.includes(t.id)) continue
      const existing = merged.get(t.id)
      if (!existing || t.updatedAt > existing.updatedAt) merged.set(t.id, t)
    }
    return Array.from(merged.values())
  }

  const mergeLists = (localLists: TodoList[], remoteLists: TodoList[]): TodoList[] => {
    const merged = new Map<string, TodoList>()
    for (const l of localLists) merged.set(l.id, l)
    for (const l of remoteLists) {
      const existing = merged.get(l.id)
      if (!existing || (l as any).updatedAt > (existing as any).updatedAt) merged.set(l.id, l)
    }
    return Array.from(merged.values()).filter(l => !tombstones.includes(l.id))
  }

  const mergeTags = (localTags: Tag[], remoteTags: Tag[]): Tag[] => {
    const merged = new Map<string, Tag>()
    for (const t of localTags) merged.set(t.id, t)
    for (const t of remoteTags) {
      const existing = merged.get(t.id)
      if (!existing) merged.set(t.id, t)
      else merged.set(t.id, t)
    }
    return Array.from(merged.values())
  }

  return {
    todos: mergeTodos(local.todos, remote.todos),
    lists: mergeLists(local.lists, remote.lists),
    tags: mergeTags(local.tags, remote.tags),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  }
}
