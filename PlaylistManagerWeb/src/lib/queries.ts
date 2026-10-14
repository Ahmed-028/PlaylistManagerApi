import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Playlist, PlaylistSong, Song, User } from './types'

export const keys = {
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
  songs: ['songs'] as const,
  userPlaylists: (userId: number) => ['playlists', 'user', userId] as const,
  playlist: (id: number) => ['playlists', 'id', id] as const,
  playlistSongs: (id: number) => ['playlists', 'id', id, 'songs'] as const,
  search: (q: string) => ['search', q] as const,
}

/* Reads */

export const useUsers = () => useQuery({ queryKey: keys.users, queryFn: api.users.list })

export const useSongs = () => useQuery({ queryKey: keys.songs, queryFn: api.songs.list })

export const useUserPlaylists = (userId: number | null) =>
  useQuery({
    queryKey: keys.userPlaylists(userId ?? 0),
    queryFn: () => api.playlists.forUser(userId!),
    enabled: userId != null,
  })

export const usePlaylist = (id: number) =>
  useQuery({ queryKey: keys.playlist(id), queryFn: () => api.playlists.get(id) })

export const usePlaylistSongs = (id: number, enabled = true) =>
  useQuery({ queryKey: keys.playlistSongs(id), queryFn: () => api.playlists.songs(id), enabled })

export interface SearchResults {
  songs: Song[]
  playlists: Playlist[]
  users: User[]
}

/** Fans out to every search endpoint the API offers and merges title + artist matches. */
export const useSearch = (q: string) =>
  useQuery({
    queryKey: keys.search(q),
    enabled: q.trim().length > 0,
    placeholderData: (previous) => previous,
    queryFn: async (): Promise<SearchResults> => {
      const [byName, byArtist, playlists, users] = await Promise.all([
        api.songs.searchByName(q),
        api.songs.searchByArtist(q),
        api.playlists.searchByName(q),
        api.users.searchByName(q),
      ])
      const songs = new Map<number, Song>()
      for (const song of [...byName, ...byArtist]) songs.set(song.id, song)
      return { songs: [...songs.values()], playlists, users }
    },
  })

/* Writes */

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.users.create,
    onSuccess: (user) => {
      qc.setQueryData<User[]>(keys.users, (old) => [...(old ?? []), user])
      void qc.invalidateQueries({ queryKey: keys.users })
    },
  })
}

export function useCreateSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.songs.create,
    onSuccess: (song) => {
      qc.setQueryData<Song[]>(keys.songs, (old) => [...(old ?? []), song])
      void qc.invalidateQueries({ queryKey: keys.songs })
      void qc.invalidateQueries({ queryKey: ['search'] })
    },
  })
}

export function useCreatePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.playlists.create,
    onSuccess: (playlist) => {
      qc.setQueryData<Playlist[]>(keys.userPlaylists(playlist.userId), (old) => [...(old ?? []), playlist])
      qc.setQueryData(keys.playlist(playlist.id), playlist)
      qc.setQueryData<PlaylistSong[]>(keys.playlistSongs(playlist.id), [])
      void qc.invalidateQueries({ queryKey: keys.userPlaylists(playlist.userId) })
    },
  })
}

export function useAddSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.playlists.addSong,
    onSuccess: (entry) => {
      qc.setQueryData<PlaylistSong[]>(keys.playlistSongs(entry.playlistId), (old) => [...(old ?? []), entry])
      void qc.invalidateQueries({ queryKey: keys.playlistSongs(entry.playlistId) })
    },
    // A 409 means the song is already there; refresh so the UI shows it as added.
    onError: (_error, input) => {
      void qc.invalidateQueries({ queryKey: keys.playlistSongs(input.playlistId) })
    },
  })
}

export function useRenamePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.playlists.rename,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: keys.playlist(input.playlistId) })
      const previous = qc.getQueryData<Playlist | null>(keys.playlist(input.playlistId))
      const rename = (p: Playlist) => (p.id === input.playlistId ? { ...p, name: input.name } : p)
      if (previous) qc.setQueryData(keys.playlist(input.playlistId), rename(previous))
      qc.setQueryData<Playlist[]>(keys.userPlaylists(input.userId), (old) => old?.map(rename))
      return { previous }
    },
    onError: (_error, input, context) => {
      if (context?.previous) qc.setQueryData(keys.playlist(input.playlistId), context.previous)
    },
    onSettled: (_data, _error, input) => {
      void qc.invalidateQueries({ queryKey: keys.playlist(input.playlistId) })
      void qc.invalidateQueries({ queryKey: keys.userPlaylists(input.userId) })
    },
  })
}

export function useDeletePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.playlists.remove,
    onSuccess: (_data, input) => {
      qc.setQueryData<Playlist[]>(keys.userPlaylists(input.userId), (old) =>
        old?.filter((p) => p.id !== input.playlistId),
      )
      qc.removeQueries({ queryKey: keys.playlist(input.playlistId) })
      void qc.invalidateQueries({ queryKey: keys.userPlaylists(input.userId) })
      void qc.invalidateQueries({ queryKey: ['search'] })
    },
  })
}
