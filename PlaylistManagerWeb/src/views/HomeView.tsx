import { ArrowRightIcon, MusicNotesPlusIcon, PlaylistIcon, PlusIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useMemo, type ReactNode } from 'react'
import { AddToPlaylistButton, SongRow, SongRowSkeleton } from '../components/SongRow'
import { Button, Cover, EmptyState, QueryError, SectionHeading, Skeleton } from '../components/ui'
import { formatRelative, greeting, plural } from '../lib/format'
import { useSongs, useUserPlaylists } from '../lib/queries'
import { href, paths } from '../lib/router'
import type { Playlist } from '../lib/types'
import { useDialogs } from '../state/dialogs'
import { useCurrentUser } from '../state/session'

const RECENT_SONGS = 6

export function HomeView() {
  const user = useCurrentUser()
  const { openDialog } = useDialogs()
  const playlists = useUserPlaylists(user.id)
  const songs = useSongs()

  const recentSongs = useMemo(
    () => [...(songs.data ?? [])].sort((a, b) => b.id - a.id).slice(0, RECENT_SONGS),
    [songs.data],
  )

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight [overflow-wrap:anywhere] md:text-4xl">
          {greeting()}, {user.name}
        </h1>
        <p className="text-[15px] text-muted">
          {playlists.data && songs.data ? (
            <>
              {plural(playlists.data.length, 'playlist')} of yours, {plural(songs.data.length, 'song')} in the
              catalog.
            </>
          ) : (
            <span className="invisible">Loading your library</span>
          )}
        </p>
      </header>

      <section aria-labelledby="home-playlists">
        <SectionHeading
          id="home-playlists"
          title="Your playlists"
          action={
            playlists.data && playlists.data.length > 0 ? (
              <Button
                size="sm"
                icon={<PlusIcon className="size-4" weight="bold" />}
                onClick={() => openDialog({ type: 'new-playlist' })}
              >
                New playlist
              </Button>
            ) : null
          }
        />

        {playlists.isPending ? (
          <PlaylistGrid>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </PlaylistGrid>
        ) : playlists.isError ? (
          <QueryError error={playlists.error} onRetry={() => void playlists.refetch()} />
        ) : playlists.data.length > 0 ? (
          <PlaylistGrid>
            {playlists.data.map((playlist, i) => (
              <PlaylistCard key={playlist.id} playlist={playlist} index={i} />
            ))}
          </PlaylistGrid>
        ) : (
          <EmptyState
            icon={<PlaylistIcon className="size-5" />}
            title="No playlists yet"
            body="A playlist is a named, ordered set of songs from the catalog. Start one and add songs to it."
            action={
              <Button variant="primary" onClick={() => openDialog({ type: 'new-playlist' })}>
                Create a playlist
              </Button>
            }
          />
        )}
      </section>

      <section aria-labelledby="home-recent">
        <SectionHeading
          id="home-recent"
          title="Newest in the catalog"
          action={
            recentSongs.length > 0 ? (
              <a
                href={href(paths.songs)}
                className="group inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg"
              >
                Browse all
                <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </a>
            ) : null
          }
        />
        {songs.isPending ? (
          <div className="flex flex-col">
            {[0, 1, 2].map((i) => (
              <SongRowSkeleton key={i} />
            ))}
          </div>
        ) : songs.isError ? (
          <QueryError error={songs.error} onRetry={() => void songs.refetch()} />
        ) : recentSongs.length > 0 ? (
          <ul className="-mx-2 flex flex-col">
            {recentSongs.map((song) => (
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
        ) : (
          <EmptyState
            icon={<MusicNotesPlusIcon className="size-5" />}
            title="The catalog is empty"
            body="Songs live in a shared catalog. Add one and any listener can put it in their playlists."
            action={<Button onClick={() => openDialog({ type: 'new-song' })}>Add a song</Button>}
          />
        )}
      </section>
    </div>
  )
}

function PlaylistGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 2xl:grid-cols-5">
      {children}
    </div>
  )
}

function PlaylistCard({ playlist, index }: { playlist: Playlist; index: number }) {
  return (
    <motion.a
      href={href(paths.playlist(playlist.id))}
      initial={{ opacity: 0, transform: 'translateY(8px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.32, delay: Math.min(index, 8) * 0.04, ease: [0.23, 1, 0.32, 1] }}
      className="group flex min-w-0 flex-col gap-3 rounded-xl"
    >
      <div className="transition-transform duration-200 ease-out-strong group-hover:-translate-y-1 group-active:scale-[0.98]">
        <Cover
          seed={`playlist-${playlist.id}`}
          title={playlist.name}
          showTitle
          className="aspect-square w-full shadow-panel"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <span className="truncate text-[15px] font-medium" title={playlist.name}>
          {playlist.name}
        </span>
        <span className="text-[13px] text-muted">Created {formatRelative(playlist.creationDate)}</span>
      </div>
    </motion.a>
  )
}
