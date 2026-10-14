import { CheckIcon, PlusIcon, UserPlusIcon } from '@phosphor-icons/react'
import { useQueries } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '../lib/api'
import { plural } from '../lib/format'
import {
  keys,
  useAddSong,
  useCreatePlaylist,
  useCreateSong,
  useCreateUser,
  useDeletePlaylist,
  usePlaylistSongs,
  useUserPlaylists,
} from '../lib/queries'
import { navigate, paths } from '../lib/router'
import type { Playlist, Song } from '../lib/types'
import { useDialogs } from '../state/dialogs'
import { useCurrentUser, useSession } from '../state/session'
import { Avatar, Button, Cover, Field, QueryError, Skeleton, cx } from './ui'

const MAX_NAME = 200

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Something went wrong. Try again.'
}

function FormActions({ submitLabel, pending }: { submitLabel: string; pending: boolean }) {
  const { closeDialog } = useDialogs()
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <Button variant="ghost" onClick={closeDialog}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" pending={pending}>
        {submitLabel}
      </Button>
    </div>
  )
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-[10px] bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
      {message}
    </p>
  )
}

/* Playlists */

export function NewPlaylistForm({ songToAdd }: { songToAdd?: Song }) {
  const user = useCurrentUser()
  const { closeDialog } = useDialogs()
  const createPlaylist = useCreatePlaylist()
  const addSong = useAddSong()
  const [name, setName] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setFieldError('Give the playlist a name.')
      return
    }
    setFieldError(null)
    setFormError(null)

    let playlist: Playlist
    try {
      playlist = await createPlaylist.mutateAsync({ name: trimmed, userId: user.id })
    } catch (error) {
      setFormError(errorMessage(error))
      return
    }

    closeDialog()
    navigate(paths.playlist(playlist.id))

    if (!songToAdd) {
      toast.success(`Created “${playlist.name}”`)
      return
    }
    try {
      await addSong.mutateAsync({ playlistId: playlist.id, songId: songToAdd.id, userId: user.id })
      toast.success(`Created “${playlist.name}” with ${songToAdd.name}`)
    } catch (error) {
      toast.error(`Created “${playlist.name}”, but could not add ${songToAdd.name}`, {
        description: errorMessage(error),
      })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field
        label="Name"
        data-autofocus
        value={name}
        maxLength={MAX_NAME}
        name="playlist-name"
        placeholder="Sunday morning"
        autoComplete="off"
        error={fieldError}
        onChange={(e) => setName(e.target.value)}
      />
      <FormError message={formError} />
      <FormActions submitLabel="Create playlist" pending={createPlaylist.isPending || addSong.isPending} />
    </form>
  )
}

export function AddToPlaylistPanel({ song }: { song: Song }) {
  const user = useCurrentUser()
  const { openDialog } = useDialogs()
  const { data: playlists, isPending, isError, error, refetch } = useUserPlaylists(user.id)
  const memberships = useQueries({
    queries: (playlists ?? []).map((playlist) => ({
      queryKey: keys.playlistSongs(playlist.id),
      queryFn: () => api.playlists.songs(playlist.id),
    })),
  })

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        data-autofocus
        onClick={() => openDialog({ type: 'new-playlist', songToAdd: song })}
        className="pressable -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2"
      >
        <span className="flex size-11 items-center justify-center rounded-lg border border-dashed border-line text-muted">
          <PlusIcon className="size-5" />
        </span>
        <span className="text-[15px] font-medium">New playlist</span>
      </button>

      {isPending ? (
        <div className="flex flex-col gap-3 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="pt-2">
          <QueryError error={error} onRetry={() => void refetch()} title="Could not load your playlists" />
        </div>
      ) : playlists.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {playlists.map((playlist, i) => {
            const entries = memberships[i]?.data
            return (
              <PlaylistChoice
                key={playlist.id}
                playlist={playlist}
                song={song}
                songCount={entries?.length}
                alreadyAdded={entries?.some((entry) => entry.songId === song.id) ?? false}
              />
            )
          })}
        </ul>
      ) : (
        <p className="px-1 pt-2 text-sm text-muted">You have no playlists yet. Start one above.</p>
      )}
    </div>
  )
}

function PlaylistChoice({
  playlist,
  song,
  songCount,
  alreadyAdded,
}: {
  playlist: Playlist
  song: Song
  songCount?: number
  alreadyAdded: boolean
}) {
  const user = useCurrentUser()
  const { closeDialog } = useDialogs()
  const addSong = useAddSong()
  const [error, setError] = useState<string | null>(null)

  function add() {
    setError(null)
    addSong.mutate(
      { playlistId: playlist.id, songId: song.id, userId: user.id },
      {
        onSuccess: () => {
          closeDialog()
          toast.success(`Added to ${playlist.name}`, {
            description: song.name,
            action: { label: 'View', onClick: () => navigate(paths.playlist(playlist.id)) },
          })
        },
        onError: (err) => setError(err instanceof ApiError && err.status === 409 ? null : errorMessage(err)),
      },
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={add}
        disabled={alreadyAdded || addSong.isPending}
        className={cx(
          'pressable -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2 text-left',
          'enabled:hover:bg-surface-2 disabled:cursor-default',
        )}
      >
        <Cover seed={`playlist-${playlist.id}`} className="size-11 rounded-lg" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-medium">{playlist.name}</span>
          <span className="text-[13px] text-muted">
            {songCount == null ? ' ' : plural(songCount, 'song')}
          </span>
        </span>
        {alreadyAdded ? (
          <span className="flex items-center gap-1 text-[13px] font-medium text-accent-text">
            <CheckIcon className="size-4" weight="bold" /> Added
          </span>
        ) : (
          <span className="text-[13px] font-medium text-muted">{addSong.isPending ? 'Adding…' : 'Add'}</span>
        )}
      </button>
      {error ? <p className="px-1 pb-1 text-[13px] text-danger">{error}</p> : null}
    </li>
  )
}

export function DeletePlaylistConfirm({ playlist }: { playlist: Playlist }) {
  const user = useCurrentUser()
  const { closeDialog } = useDialogs()
  const deletePlaylist = useDeletePlaylist()
  const { data: songs } = usePlaylistSongs(playlist.id)
  const [error, setError] = useState<string | null>(null)

  function confirm() {
    setError(null)
    deletePlaylist.mutate(
      { playlistId: playlist.id, userId: user.id },
      {
        onSuccess: () => {
          closeDialog()
          navigate(paths.home)
          toast.success(`Deleted “${playlist.name}”`)
        },
        onError: (err) => setError(errorMessage(err)),
      },
    )
  }

  const count = songs?.length ?? 0
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-relaxed text-muted [overflow-wrap:anywhere]">
        <span className="font-medium text-fg">{playlist.name}</span>
        {count > 0 ? ` and its ${plural(count, 'song')} will be removed.` : ' will be removed.'} The songs
        stay in the catalog. This cannot be undone.
      </p>
      <FormError message={error} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={closeDialog} data-autofocus>
          Keep it
        </Button>
        <Button variant="danger" onClick={confirm} pending={deletePlaylist.isPending}>
          Delete playlist
        </Button>
      </div>
    </div>
  )
}

/* Songs */

export function NewSongForm({ initialName = '', addTo }: { initialName?: string; addTo?: Playlist }) {
  const { user } = useSession()
  const { closeDialog } = useDialogs()
  const createSong = useCreateSong()
  const addSong = useAddSong()
  const [name, setName] = useState(initialName)
  const [artist, setArtist] = useState('')
  const [errors, setErrors] = useState<{ name?: string; artist?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = {
      name: name.trim() ? undefined : 'Add the song title.',
      artist: artist.trim() ? undefined : 'Add who performs it.',
    }
    setErrors(next)
    if (next.name || next.artist) return
    setFormError(null)

    let song: Song
    try {
      song = await createSong.mutateAsync({ name: name.trim(), artist: artist.trim() })
    } catch (error) {
      setFormError(errorMessage(error))
      return
    }
    closeDialog()

    if (!addTo || !user) {
      toast.success(`${song.name} is in the catalog`, { description: song.artist })
      return
    }
    try {
      await addSong.mutateAsync({ playlistId: addTo.id, songId: song.id, userId: user.id })
      toast.success(`Added ${song.name} to ${addTo.name}`)
    } catch (error) {
      toast.error(`${song.name} is in the catalog, but was not added to ${addTo.name}`, {
        description: errorMessage(error),
      })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field
        label="Title"
        data-autofocus={initialName ? undefined : true}
        value={name}
        maxLength={MAX_NAME}
        name="song-title"
        placeholder="Harvest Moon"
        autoComplete="off"
        error={errors.name}
        onChange={(e) => setName(e.target.value)}
      />
      <Field
        label="Artist"
        data-autofocus={initialName ? true : undefined}
        value={artist}
        maxLength={MAX_NAME}
        name="song-artist"
        placeholder="Neil Young"
        autoComplete="off"
        error={errors.artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <FormError message={formError} />
      <FormActions
        submitLabel={addTo ? 'Add song' : 'Add to catalog'}
        pending={createSong.isPending || addSong.isPending}
      />
    </form>
  )
}

/* Listeners */

export function ListenersPanel() {
  const { user: current, users, setUserId } = useSession()
  const { openDialog, closeDialog } = useDialogs()

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-0.5">
        {users.map((listener) => {
          const isCurrent = listener.id === current?.id
          return (
            <li key={listener.id}>
              <button
                type="button"
                data-autofocus={isCurrent || undefined}
                aria-current={isCurrent || undefined}
                onClick={() => {
                  setUserId(listener.id)
                  closeDialog()
                  navigate(paths.home)
                }}
                className="pressable -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2"
              >
                <Avatar id={listener.id} name={listener.name} className="size-10 text-sm" />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{listener.name}</span>
                {isCurrent ? <CheckIcon className="size-5 text-accent-text" weight="bold" aria-hidden={false} role="img" aria-label="Current" /> : null}
              </button>
            </li>
          )
        })}
      </ul>
      <Button icon={<UserPlusIcon className="size-4" />} onClick={() => openDialog({ type: 'new-listener' })}>
        New listener
      </Button>
    </div>
  )
}

export function NewListenerForm() {
  const { setUserId } = useSession()
  const { closeDialog } = useDialogs()
  const createUser = useCreateUser()
  const [name, setName] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setFieldError('Add a name for this listener.')
      return
    }
    setFieldError(null)
    setFormError(null)
    createUser.mutate(trimmed, {
      onSuccess: (user) => {
        setUserId(user.id)
        closeDialog()
        navigate(paths.home)
        toast.success(`Welcome, ${user.name}`)
      },
      onError: (error) => setFormError(errorMessage(error)),
    })
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field
        label="Name"
        data-autofocus
        value={name}
        maxLength={MAX_NAME}
        name="listener-name"
        placeholder="Noor"
        autoComplete="off"
        error={fieldError}
        onChange={(e) => setName(e.target.value)}
      />
      <FormError message={formError} />
      <FormActions submitLabel="Create listener" pending={createUser.isPending} />
    </form>
  )
}
