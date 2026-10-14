import { MagnifyingGlassIcon, MusicNotesPlusIcon, PlusIcon } from '@phosphor-icons/react'
import { useDeferredValue, useMemo, useState } from 'react'
import { AddToPlaylistButton, SongRow, SongRowSkeleton } from '../components/SongRow'
import { Button, EmptyState, QueryError } from '../components/ui'
import { formatDate, plural } from '../lib/format'
import { useDocumentTitle } from '../lib/hooks'
import { useSongs } from '../lib/queries'
import { useDialogs } from '../state/dialogs'

export function SongsView() {
  const { openDialog } = useDialogs()
  const songs = useSongs()
  const [filter, setFilter] = useState('')
  const deferredFilter = useDeferredValue(filter)
  useDocumentTitle('Catalog')

  const q = deferredFilter.trim().toLowerCase()
  const visible = useMemo(
    () =>
      [...(songs.data ?? [])]
        .filter((s) => !q || s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
        .sort((a, b) => b.id - a.id),
    [songs.data, q],
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Catalog</h1>
          <p className="text-[15px] text-muted">
            {songs.data
              ? `${plural(songs.data.length, 'song')} shared by every listener.`
              : 'Songs shared by every listener.'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="size-4" weight="bold" />}
          onClick={() => openDialog({ type: 'new-song' })}
          className="self-start sm:self-auto"
        >
          New song
        </Button>
      </header>

      {songs.data && songs.data.length > 0 ? (
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by title or artist…"
            name="catalog-filter"
            aria-label="Filter the catalog"
            autoComplete="off"
            className="h-11 w-full rounded-[10px] border border-line bg-surface pr-3.5 pl-10 text-[15px] placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent-soft"
          />
        </div>
      ) : null}

      {songs.isPending ? (
        <div className="flex flex-col">
          {[0, 1, 2, 3, 4].map((i) => (
            <SongRowSkeleton key={i} />
          ))}
        </div>
      ) : songs.isError ? (
        <QueryError error={songs.error} onRetry={() => void songs.refetch()} />
      ) : songs.data.length === 0 ? (
        <EmptyState
          icon={<MusicNotesPlusIcon className="size-5" />}
          title="The catalog is empty"
          body="Add a song with its title and artist. Every listener can then put it in their playlists."
          action={
            <Button variant="primary" onClick={() => openDialog({ type: 'new-song' })}>
              Add the first song
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="size-5" />}
          title={`Nothing matches “${filter.trim()}”`}
          body="Check the spelling, or add it to the catalog."
          action={
            <Button onClick={() => openDialog({ type: 'new-song', initialName: filter.trim() })}>
              Add “{filter.trim()}”
            </Button>
          }
          className="[overflow-wrap:anywhere]"
        />
      ) : (
        <div>
          <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto] gap-4 border-b border-line px-2 pb-2 text-xs font-medium text-faint md:grid">
            <span>Title</span>
            <span>Published</span>
            <span className="sr-only">Actions</span>
          </div>
          <ul className="-mx-2 flex flex-col">
            {visible.map((song) => (
              <li key={song.id} className="[contain-intrinsic-size:auto_56px] [content-visibility:auto]">
                <SongRow
                  songId={song.id}
                  title={song.name}
                  artist={song.artist}
                  meta={formatDate(song.publishDate)}
                  action={<AddToPlaylistButton song={song} />}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
