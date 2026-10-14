import type { Playlist, PlaylistSong, Song, User } from './types'

const BASE = '/api'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  /** True when the API could not be reached at all (server down, proxy error). */
  get isOffline() {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504
  }
}

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}

/**
 * The API answers errors in two shapes: plain-text strings from BadRequest("...") / NotFound("...")
 * and RFC 7807 ProblemDetails JSON from model validation. Normalise both into one readable message.
 */
function readError(status: number, body: string, contentType: string): string {
  if (contentType.includes('json')) {
    try {
      const problem = JSON.parse(body) as ProblemDetails | string
      if (typeof problem === 'string') return problem
      const fieldErrors = problem.errors ? Object.values(problem.errors).flat() : []
      if (fieldErrors.length > 0) return fieldErrors.join(' ')
      return problem.detail ?? problem.title ?? `Request failed (${status})`
    } catch {
      // fall through to the raw body
    }
  }
  const text = body.trim()
  if (text) return text
  if (status >= 500) return 'The Playlist API hit an unexpected error.'
  return `Request failed (${status})`
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  let res: Response
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    })
  } catch {
    throw new ApiError(0, 'Could not reach the Playlist API.')
  }

  const contentType = res.headers.get('content-type') ?? ''
  const body = res.status === 204 ? '' : await res.text()

  if (!res.ok) {
    // Vite's proxy answers 500 with an empty body when the API process is not running.
    if (res.status === 500 && !body) throw new ApiError(502, 'Could not reach the Playlist API.')
    throw new ApiError(res.status, readError(res.status, body, contentType))
  }
  if (!body) return null
  return (contentType.includes('json') ? JSON.parse(body) : body) as T
}

/** List endpoints answer 204 (no body) when empty and search endpoints answer 404. Both mean "no results". */
async function list<T>(path: string): Promise<T[]> {
  try {
    return (await request<T[]>(path)) ?? []
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

/** Single-item lookups answer 404 when the id does not exist. */
async function maybe<T>(path: string): Promise<T | null> {
  try {
    return await request<T>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

const seg = (value: string) => encodeURIComponent(value.trim())
const json = (value: unknown) => JSON.stringify(value)

export const api = {
  users: {
    list: () => list<User>('/user'),
    get: (id: number) => maybe<User>(`/user/search/id/${id}`),
    searchByName: (name: string) => list<User>(`/user/search/name/${seg(name)}`),
    create: (name: string) =>
      request<User>('/user', { method: 'POST', body: json({ name }) }) as Promise<User>,
  },

  songs: {
    list: () => list<Song>('/song'),
    searchByName: (name: string) => list<Song>(`/song/search/name/${seg(name)}`),
    searchByArtist: (artist: string) => list<Song>(`/song/search/artist/${seg(artist)}`),
    create: (input: { name: string; artist: string }) =>
      request<Song>('/song', { method: 'POST', body: json(input) }) as Promise<Song>,
  },

  playlists: {
    forUser: (userId: number) => list<Playlist>(`/playlist/search/userId/${userId}`),
    get: (id: number) => maybe<Playlist>(`/playlist/search/playlistId/${id}`),
    songs: (id: number) => list<PlaylistSong>(`/playlist/search/playlistId/${id}/songs`),
    searchByName: (name: string) => list<Playlist>(`/playlist/search/name/${seg(name)}`),
    create: (input: { name: string; userId: number }) =>
      request<Playlist>('/playlist', { method: 'POST', body: json(input) }) as Promise<Playlist>,
    addSong: (input: { playlistId: number; songId: number; userId: number }) =>
      request<PlaylistSong>('/playlist/addsong', {
        method: 'POST',
        body: json(input),
      }) as Promise<PlaylistSong>,
    rename: (input: { playlistId: number; userId: number; name: string }) =>
      request<string>('/playlist/update', { method: 'PUT', body: json(input) }),
    remove: (input: { playlistId: number; userId: number }) =>
      request<null>(`/playlist/delete/user=${input.userId}/playlist=${input.playlistId}`, {
        method: 'DELETE',
      }),
  },
}
