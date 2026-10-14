import { PlusIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { Song } from '../lib/types'
import { useDialogs } from '../state/dialogs'
import { Cover, Skeleton, cx } from './ui'

interface SongRowProps {
  songId: number
  title: string
  artist: string
  index?: number
  meta?: ReactNode
  action?: ReactNode
  className?: string
}

/** One track: optional position, generated art, title over artist, optional meta column and action. */
export function SongRow({ songId, title, artist, index, meta, action, className }: SongRowProps) {
  return (
    <div
      className={cx(
        'group grid min-h-14 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-150 hover:bg-surface-2 sm:gap-4',
        index != null ? 'grid-cols-[1.75rem_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
        meta != null &&
          (index != null
            ? 'md:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,14rem)_auto]'
            : 'md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto]'),
        className,
      )}
    >
      {index != null ? (
        <span className="text-right font-mono text-[13px] text-faint tabular-nums">{index}</span>
      ) : null}
      <div className="flex min-w-0 items-center gap-3">
        <Cover seed={`song-${songId}`} className="size-10 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-medium" title={title}>
            {title}
          </span>
          <span className="truncate text-[13px] text-muted" title={artist}>
            {artist}
          </span>
        </div>
      </div>
      {meta != null ? <div className="hidden min-w-0 truncate text-[13px] text-muted md:block">{meta}</div> : null}
      <div className="flex justify-end">{action}</div>
    </div>
  )
}

export function SongRowSkeleton({ withIndex = false }: { withIndex?: boolean }) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-2 py-1.5 sm:gap-4">
      {withIndex ? <Skeleton className="h-3 w-5" /> : null}
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-2/5 max-w-56" />
        <Skeleton className="h-3 w-1/4 max-w-32" />
      </div>
    </div>
  )
}

export function AddToPlaylistButton({ song }: { song: Song }) {
  const { openDialog } = useDialogs()
  return (
    <button
      type="button"
      onClick={() => openDialog({ type: 'add-to-playlist', song })}
      aria-label={`Add ${song.name} to a playlist`}
      className={cx(
        'pressable inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-muted',
        'hover:bg-surface-3 hover:text-fg sm:px-3',
      )}
    >
      <PlusIcon className="size-4" weight="bold" />
      <span className="hidden sm:inline">Add to playlist</span>
    </button>
  )
}
