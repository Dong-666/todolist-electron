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
    const jsonData = JSON.stringify(data)
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
