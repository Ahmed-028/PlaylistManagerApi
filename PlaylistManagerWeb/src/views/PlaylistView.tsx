import {
  ArrowLeftIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  MusicNotesPlusIcon,
  PencilSimpleIcon,
  PlaylistIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '../components/DialogContents'
import { SongRow, SongRowSkeleton } from '../components/SongRow'
import { Avatar, Button, Cover, EmptyState, QueryError, Skeleton, buttonClasses } from '../components/ui'
import { ApiError } from '../lib/api'
import { formatDate, plural } from '../lib/format'
import { useDocumentTitle } from '../lib/hooks'
import { useAddSong, usePlaylist, usePlaylistSongs, useRenamePlaylist, useSongs } from '../lib/queries'
import { href, paths } from '../lib/router'
import type { Playlist, PlaylistSong, Song } from '../lib/types'
import { useDialogs } from '../state/dialogs'
import { useCurrentUser, useSession } from '../state/session'

const SUGGESTION_LIMIT = 8
const ease = [0.23, 1, 0.32, 1] as const

export function PlaylistView({ id }: { id: number }) {
  const user = useCurrentUser()
  const { users, setUserId } = useSession()
  const { openDialog } = useDialogs()
  const playlistQuery = usePlaylist(id)
  const playlist = playlistQuery.data
  const songsQuery = usePlaylistSongs(id, playlist != null)
  const [renaming, setRenaming] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)
  useDocumentTitle(playlist?.name)

  if (playlistQuery.isPending) return <PlaylistSkeleton />
  if (playlistQuery.isError) {
    return <QueryError error={playlistQuery.error} onRetry={() => void playlistQuery.refetch()} />
  }
  if (!playlist) {
    return (
      <EmptyState
        icon={<PlaylistIcon className="size-5" />}
        title="Playlist not found"
        body="It may have been deleted, or the link points to a playlist that never existed."
        action={
          <a href={href(paths.home)} className={buttonClasses()}>
            <ArrowLeftIcon className="size-4" />
            Back to your playlists
          </a>
        }
      />
    )
  }

  const isOwner = playlist.userId === user.id
  const owner = users.find((u) => u.id === playlist.userId)
  const entries = songsQuery.data ?? []

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        <Cover
          seed={`playlist-${playlist.id}`}
          className="size-44 shrink-0 shadow-panel sm:size-52 lg:size-60"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <PlaylistTitle playlist={playlist} userId={user.id} editing={renaming} onEditingChange={setRenaming} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
            {owner ? (
              <span className="flex min-w-0 items-center gap-2">
                <Avatar id={owner.id} name={owner.name} className="size-6 text-[10px]" />
                <span className="truncate font-medium text-fg">{owner.name}</span>
              </span>
            ) : null}
            <span>{songsQuery.data ? plural(entries.length, 'song') : ' '}</span>
            <span>Created {formatDate(playlist.creationDate)}</span>
          </div>

          {isOwner ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="primary"
                icon={<PlusIcon className="size-4" weight="bold" />}
                onClick={() => {
                  addInputRef.current?.focus()
                  addInputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                }}
              >
                Add songs
              </Button>
              <Button variant="ghost" icon={<PencilSimpleIcon className="size-4" />} onClick={() => setRenaming(true)}>
                Rename
              </Button>
              <Button
                variant="ghost"
                icon={<TrashIcon className="size-4" />}
                onClick={() => openDialog({ type: 'delete-playlist', playlist })}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {!isOwner && owner ? (
        <div className="flex flex-col gap-3 rounded-xl bg-surface-2 px-4 py-3.5 sm:flex-row sm:items-center">
          <LockSimpleIcon className="hidden size-5 shrink-0 text-muted sm:block" />
          <p className="flex-1 text-sm text-muted">
            This playlist belongs to <span className="font-medium text-fg">{owner.name}</span>. Only they can add
            songs, rename or delete it.
          </p>
          <Button size="sm" onClick={() => setUserId(owner.id)}>
            Switch to {owner.name}
          </Button>
        </div>
      ) : null}

      <section aria-labelledby="playlist-songs">
        <h2 id="playlist-songs" className="sr-only">
          Songs
        </h2>
        {songsQuery.isPending ? (
          <div className="flex flex-col">
            {[0, 1, 2].map((i) => (
              <SongRowSkeleton key={i} withIndex />
            ))}
          </div>
        ) : songsQuery.isError ? (
          <QueryError error={songsQuery.error} onRetry={() => void songsQuery.refetch()} />
        ) : entries.length > 0 ? (
          <ol className="-mx-2 flex flex-col">
            <AnimatePresence initial={false}>
              {entries.map((entry, i) => (
                <motion.li
                  key={entry.songId}
                  initial={{ opacity: 0, transform: 'translateY(6px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={{ duration: 0.28, ease }}
                >
                  <SongRow songId={entry.songId} title={entry.songName} artist={entry.artist} index={i + 1} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        ) : (
          <EmptyState
            icon={<MusicNotesPlusIcon className="size-5" />}
            title="No songs yet"
            body={
              isOwner
                ? 'Search the catalog below and add the first one.'
                : `${owner?.name ?? 'The owner'} has not added any songs.`
            }
          />
        )}
      </section>

      {isOwner ? <AddSongsPanel playlist={playlist} entries={entries} inputRef={addInputRef} /> : null}
    </div>
  )
}

function PlaylistTitle({
  playlist,
  userId,
  editing,
  onEditingChange,
}: {
  playlist: Playlist
  userId: number
  editing: boolean
  onEditingChange: (editing: boolean) => void
}) {
  const rename = useRenamePlaylist()
  const [draft, setDraft] = useState(playlist.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    if (!editing) return
    cancelled.current = false
    setDraft(playlist.name)
    // Focus after the input mounts, with the whole name selected for quick replacement.
    requestAnimationFrame(() => inputRef.current?.select())
  }, [editing, playlist.name])

  function commit() {
    if (cancelled.current) return
    cancelled.current = true
    onEditingChange(false)
    const name = draft.trim()
    if (!name || name === playlist.name) return
    rename.mutate(
      { playlistId: playlist.id, userId, name },
      {
        onSuccess: () => toast.success(`Renamed to “${name}”`),
        onError: (error) => toast.error('Could not rename the playlist', { description: errorMessage(error) }),
      },
    )
  }

  const titleClass =
    'w-full text-3xl leading-[1.08] font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl'

  if (!editing) return <h1 className={titleClass}>{playlist.name}</h1>

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        commit()
      }}
    >
      <label htmlFor="playlist-name" className="sr-only">
        Playlist name
      </label>
      <input
        id="playlist-name"
        ref={inputRef}
        value={draft}
        maxLength={200}
        autoComplete="off"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            cancelled.current = true
            onEditingChange(false)
          }
        }}
        className={`${titleClass} border-b-2 border-accent bg-transparent pb-1 outline-none`}
      />
      <p className="mt-2 text-[13px] text-muted">Enter to save, Esc to cancel</p>
    </form>
  )
}

function AddSongsPanel({
  playlist,
  entries,
  inputRef,
}: {
  playlist: Playlist
  entries: PlaylistSong[]
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const { openDialog } = useDialogs()
  const catalog = useSongs()
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const q = query.trim().toLowerCase()
  const { candidates, exactMatch } = useMemo(() => {
    const included = new Set(entries.map((e) => e.songId))
    const songs = catalog.data ?? []
    return {
      candidates: songs
        .filter((s) => !included.has(s.id))
        .filter((s) => !q || s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
        .sort((a, b) => b.id - a.id),
      exactMatch: songs.some((s) => s.name.toLowerCase() === q),
    }
  }, [catalog.data, entries, q])

  const visible = showAll ? candidates : candidates.slice(0, SUGGESTION_LIMIT)
  const hidden = candidates.length - visible.length
  const catalogEmpty = catalog.data?.length === 0

  return (
    <section aria-labelledby="add-songs-title" className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-1">
        <h2 id="add-songs-title" className="text-lg font-semibold tracking-tight">
          Add songs
        </h2>
        <p className="text-sm text-muted">From the shared catalog. Songs keep the order you add them in.</p>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-faint" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowAll(false)
          }}
          placeholder="Search by title or artist…"
          aria-label="Search the catalog"
          name="catalog-search"
          autoComplete="off"
          className="h-11 w-full rounded-[10px] border border-line bg-bg pr-3.5 pl-10 text-[15px] placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent-soft"
        />
      </div>

      <div className="mt-3">
        {catalog.isPending ? (
          [0, 1, 2].map((i) => <SongRowSkeleton key={i} />)
        ) : catalog.isError ? (
          <QueryError error={catalog.error} onRetry={() => void catalog.refetch()} />
        ) : (
          <>
            {visible.length > 0 ? (
              <ul className="-mx-2 flex flex-col">
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((song) => (
                    <motion.li
                      key={song.id}
                      layout="position"
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.22, ease }}
                    >
                      <SuggestionRow song={song} playlist={playlist} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="px-1 py-3 text-sm text-muted">
                {catalogEmpty
                  ? 'The catalog is empty. Add the first song to get started.'
                  : q
                    ? `No catalog songs match “${query.trim()}”.`
                    : 'Every song in the catalog is already in this playlist.'}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {hidden > 0 ? (
                <Button size="sm" variant="ghost" onClick={() => setShowAll(true)}>
                  Show {plural(hidden, 'more song')}
                </Button>
              ) : null}
              {q && !exactMatch ? (
                <Button
                  size="sm"
                  icon={<PlusIcon className="size-4" weight="bold" />}
                  onClick={() => openDialog({ type: 'new-song', initialName: query.trim(), addTo: playlist })}
                  className="max-w-full"
                >
                  <span className="truncate">Add “{query.trim()}” to the catalog</span>
                </Button>
              ) : !q ? (
                <Button
                  size="sm"
                  icon={<PlusIcon className="size-4" weight="bold" />}
                  onClick={() => openDialog({ type: 'new-song', addTo: playlist })}
                >
                  New song
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function SuggestionRow({ song, playlist }: { song: Song; playlist: Playlist }) {
  const user = useCurrentUser()
  const addSong = useAddSong()

  // mutateAsync rather than mutate callbacks: this row unmounts as soon as the song joins the
  // playlist, and per-call callbacks do not fire for unmounted components.
  async function add() {
    try {
      await addSong.mutateAsync({ playlistId: playlist.id, songId: song.id, userId: user.id })
      toast.success(`Added ${song.name}`, { description: playlist.name })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(`${song.name} is already in this playlist`)
      } else {
        toast.error(`Could not add ${song.name}`, { description: errorMessage(error) })
      }
    }
  }

  return (
    <SongRow
      songId={song.id}
      title={song.name}
      artist={song.artist}
      action={
        <Button size="sm" onClick={() => void add()} pending={addSong.isPending} aria-label={`Add ${song.name}`}>
          Add
        </Button>
      }
    />
  )
}

function PlaylistSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy aria-label="Loading playlist">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        <Skeleton className="size-44 rounded-xl sm:size-52 lg:size-60" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-10 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-10 w-72 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col">
        {[0, 1, 2, 3].map((i) => (
          <SongRowSkeleton key={i} withIndex />
        ))}
      </div>
    </div>
  )
}
