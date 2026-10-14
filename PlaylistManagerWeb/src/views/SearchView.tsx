import { CircleNotchIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AddToPlaylistButton, SongRow, SongRowSkeleton } from '../components/SongRow'
import { Avatar, Cover, EmptyState, IconButton, QueryError, SectionHeading, Skeleton } from '../components/ui'
import { formatRelative } from '../lib/format'
import { useDebouncedValue, useDocumentTitle } from '../lib/hooks'
import { useSearch, useSongs } from '../lib/queries'
import { href, paths, replacePath } from '../lib/router'
import type { Playlist, User } from '../lib/types'
import { useSession } from '../state/session'

const ARTIST_SUGGESTIONS = 10

export function SearchView({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const debounced = useDebouncedValue(query.trim(), 250)
  const search = useSearch(debounced)
  const inputRef = useRef<HTMLInputElement>(null)
  useDocumentTitle(debounced ? `Search: ${debounced}` : 'Search')

  useEffect(() => {
    replacePath(paths.search(debounced))
  }, [debounced])

  // Let the global "/" shortcut land in this field even when already on the page.
  useEffect(() => {
    const focus = () => inputRef.current?.focus()
    window.addEventListener('crate:focus-search', focus)
    return () => window.removeEventListener('crate:focus-search', focus)
  }, [])

  const stale = query.trim() !== debounced || (search.isFetching && search.isPlaceholderData)
  const results = search.data
  const total = results ? results.songs.length + results.playlists.length + results.users.length : 0

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Search</h1>
        <div className="relative max-w-2xl">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Songs, artists, playlists or listeners…"
            name="q"
            aria-label="Search"
            autoComplete="off"
            enterKeyHint="search"
            className="h-14 w-full rounded-[10px] border border-line bg-surface pr-24 pl-12 text-[17px] placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent-soft [&::-webkit-search-cancel-button]:hidden"
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {stale && query.trim() ? (
              <CircleNotchIcon className="size-5 animate-spin text-faint" aria-hidden={false} role="img" aria-label="Searching" />
            ) : null}
            {query ? (
              <IconButton
                label="Clear search"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                <XIcon className="size-[18px]" />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>

      {!debounced ? (
        <BrowseArtists onPick={setQuery} />
      ) : search.isError ? (
        <QueryError error={search.error} onRetry={() => void search.refetch()} />
      ) : !results ? (
        <div className="flex flex-col">
          {[0, 1, 2].map((i) => (
            <SongRowSkeleton key={i} />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="size-5" />}
          title={`Nothing matches “${debounced}”`}
          body="Search looks at song titles, artists, playlist names and listener names."
          className="[overflow-wrap:anywhere]"
        />
      ) : (
        <div className={`flex flex-col gap-12 transition-opacity duration-150 ${stale ? 'opacity-60' : ''}`}>
          {results.songs.length > 0 ? (
            <section aria-labelledby="results-songs">
              <SectionHeading id="results-songs" title="Songs" />
              <ul className="-mx-2 flex flex-col">
                {results.songs.map((song) => (
                  <li key={song.id}>
                    <SongRow
                      songId={song.id}
                      title={song.name}
                      artist={song.artist}
                      meta={`Published ${formatRelative(song.publishDate)}`}
                      action={<AddToPlaylistButton song={song} />}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.playlists.length > 0 ? <PlaylistResults playlists={results.playlists} /> : null}

          {results.users.length > 0 ? <ListenerResults users={results.users} /> : null}
        </div>
      )}
    </div>
  )
}

function PlaylistResults({ playlists }: { playlists: Playlist[] }) {
  const { user, users } = useSession()
  const names = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])
  return (
    <section aria-labelledby="results-playlists">
      <SectionHeading id="results-playlists" title="Playlists" />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            <a
              href={href(paths.playlist(playlist.id))}
              className="pressable flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2"
            >
              <Cover seed={`playlist-${playlist.id}`} className="size-14 shrink-0 rounded-lg" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-medium">{playlist.name}</span>
                <span className="truncate text-[13px] text-muted">
                  {playlist.userId === user?.id ? 'Yours' : `By ${names.get(playlist.userId) ?? 'another listener'}`}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ListenerResults({ users }: { users: User[] }) {
  const { user: current, setUserId } = useSession()
  return (
    <section aria-labelledby="results-listeners">
      <SectionHeading id="results-listeners" title="Listeners" />
      <ul className="flex flex-wrap gap-2">
        {users.map((listener) => {
          const isCurrent = listener.id === current?.id
          return (
            <li key={listener.id}>
              <button
                type="button"
                disabled={isCurrent}
                onClick={() => {
                  setUserId(listener.id)
                  toast.success(`Now listening as ${listener.name}`)
                }}
                className="pressable flex max-w-72 items-center gap-2.5 rounded-full border border-line py-1 pr-4 pl-1 enabled:hover:bg-surface-2 disabled:cursor-default"
              >
                <Avatar id={listener.id} name={listener.name} className="size-8 text-xs" />
                <span className="truncate text-sm font-medium">{listener.name}</span>
                <span className="text-xs whitespace-nowrap text-muted">{isCurrent ? 'You' : 'Switch'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** With no query, offer the catalog's artists as starting points. */
function BrowseArtists({ onPick }: { onPick: (artist: string) => void }) {
  const songs = useSongs()
  const artists = useMemo(() => {
    const counts = new Map<string, number>()
    for (const song of songs.data ?? []) counts.set(song.artist, (counts.get(song.artist) ?? 0) + 1)
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, ARTIST_SUGGESTIONS)
      .map(([artist]) => artist)
  }, [songs.data])

  if (songs.isPending) {
    return (
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
    )
  }
  if (artists.length === 0) {
    return <p className="text-[15px] text-muted">Search covers song titles, artists, playlists and listeners.</p>
  }
  return (
    <section aria-labelledby="browse-artists">
      <SectionHeading id="browse-artists" title="Artists in the catalog" />
      <ul className="flex flex-wrap gap-2">
        {artists.map((artist) => (
          <li key={artist}>
            <button
              type="button"
              onClick={() => onPick(artist)}
              className="pressable h-9 max-w-64 truncate rounded-full border border-line px-4 text-sm font-medium hover:bg-surface-2"
            >
              {artist}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
