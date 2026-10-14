import {
  CaretUpDownIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MonitorIcon,
  MoonIcon,
  MusicNotesIcon,
  PlusIcon,
  SunIcon,
  VinylRecordIcon,
  type Icon,
} from '@phosphor-icons/react'
import { useUserPlaylists } from '../lib/queries'
import { href, paths, type Route } from '../lib/router'
import { useDialogs } from '../state/dialogs'
import { useCurrentUser } from '../state/session'
import { useTheme, type ThemePreference } from '../state/theme'
import { Avatar, Cover, IconButton, Skeleton, cx } from './ui'

const NAV: Array<{ label: string; path: string; icon: Icon; match: Route['name'] }> = [
  { label: 'Home', path: paths.home, icon: HouseIcon, match: 'home' },
  { label: 'Search', path: paths.search(), icon: MagnifyingGlassIcon, match: 'search' },
  { label: 'Catalog', path: paths.songs, icon: MusicNotesIcon, match: 'songs' },
]

export function Brand({ className }: { className?: string }) {
  return (
    <a href={href(paths.home)} className={cx('flex items-center gap-2.5 rounded-full', className)}>
      <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-ink">
        <VinylRecordIcon className="size-5" weight="fill" />
      </span>
      <span translate="no" className="text-[17px] font-semibold tracking-tight">
        Crate
      </span>
    </a>
  )
}

export function Sidebar({ route }: { route: Route }) {
  const user = useCurrentUser()
  const { openDialog } = useDialogs()
  const { data: playlists, isPending, isError, refetch } = useUserPlaylists(user.id)

  return (
    <aside className="sticky top-0 hidden h-[100dvh] flex-col gap-6 border-r border-line bg-surface px-3 py-5 md:flex">
      <Brand className="mx-2.5" />

      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = route.name === item.match
          return (
            <a
              key={item.label}
              href={href(item.path)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex h-10 items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium transition-colors duration-150',
                active ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <item.icon className={cx('size-5', active && 'text-accent-text')} weight={active ? 'fill' : 'regular'} />
              {item.label}
              {item.match === 'search' ? (
                <kbd className="ml-auto rounded-md border border-line px-1.5 font-mono text-[11px] text-faint">/</kbd>
              ) : null}
            </a>
          )
        })}
      </nav>

      <section aria-labelledby="sidebar-playlists" className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center justify-between pr-1 pl-3">
          <h2 id="sidebar-playlists" className="text-[13px] font-semibold text-muted">
            Your playlists
          </h2>
          <IconButton label="New playlist" className="size-8" onClick={() => openDialog({ type: 'new-playlist' })}>
            <PlusIcon className="size-4" weight="bold" />
          </IconButton>
        </div>

        <div className="scrollbar-thin -mx-1 min-h-0 flex-1 overflow-y-auto px-1">
          {isPending ? (
            <div className="flex flex-col gap-2 px-2 pt-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <Skeleton className="size-9 rounded-md" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="px-3 pt-1 text-[13px] leading-relaxed text-muted">
              Could not load your playlists.{' '}
              <button type="button" onClick={() => void refetch()} className="font-medium text-accent-text hover:underline">
                Retry
              </button>
            </p>
          ) : playlists && playlists.length > 0 ? (
            <ul className="flex flex-col gap-0.5">
              {playlists.map((playlist) => {
                const active = route.name === 'playlist' && route.id === playlist.id
                return (
                  <li key={playlist.id}>
                    <a
                      href={href(paths.playlist(playlist.id))}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'flex items-center gap-3 rounded-[10px] px-2 py-1.5 transition-colors duration-150',
                        active ? 'bg-surface-2' : 'hover:bg-surface-2',
                      )}
                    >
                      <Cover seed={`playlist-${playlist.id}`} className="size-9 shrink-0 rounded-md" />
                      <span className={cx('truncate text-sm', active ? 'font-medium text-fg' : 'text-muted')}>
                        {playlist.name}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-3 pt-1 text-[13px] leading-relaxed text-muted">
              Nothing here yet.{' '}
              <button
                type="button"
                onClick={() => openDialog({ type: 'new-playlist' })}
                className="font-medium text-accent-text hover:underline"
              >
                Create a playlist
              </button>
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <ListenerButton />
        <ThemeSwitch />
      </div>
    </aside>
  )
}

function ListenerButton() {
  const user = useCurrentUser()
  const { openDialog } = useDialogs()
  return (
    <button
      type="button"
      onClick={() => openDialog({ type: 'listeners' })}
      className="pressable flex items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-surface-2"
    >
      <Avatar id={user.id} name={user.name} className="size-9 text-xs" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{user.name}</span>
        <span className="text-xs text-muted">Switch listener</span>
      </span>
      <CaretUpDownIcon className="size-4 text-faint" />
    </button>
  )
}

const THEMES: Array<{ value: ThemePreference; label: string; icon: Icon }> = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
]

function ThemeSwitch() {
  const { preference, setPreference } = useTheme()
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
      {THEMES.map((theme) => {
        const checked = preference === theme.value
        return (
          <button
            key={theme.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={theme.label}
            title={theme.label}
            onClick={() => setPreference(theme.value)}
            className={cx(
              'flex h-7 items-center justify-center rounded-full transition-colors duration-150',
              checked ? 'bg-surface text-fg shadow-sm' : 'text-faint hover:text-fg',
            )}
          >
            <theme.icon className="size-4" weight={checked ? 'fill' : 'regular'} />
          </button>
        )
      })}
    </div>
  )
}

/** Cycles light, dark, system. Used where there is no room for the segmented switch. */
function ThemeCycleButton() {
  const { preference, setPreference } = useTheme()
  const index = THEMES.findIndex((t) => t.value === preference)
  const current = THEMES[index]
  const next = THEMES[(index + 1) % THEMES.length]
  return (
    <IconButton label={`Theme: ${current.label}. Switch to ${next.label}`} onClick={() => setPreference(next.value)}>
      <current.icon className="size-5" />
    </IconButton>
  )
}

export function MobileHeader() {
  const user = useCurrentUser()
  const { openDialog } = useDialogs()
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden">
      <Brand />
      <div className="flex items-center gap-1">
        <ThemeCycleButton />
        <IconButton label="New playlist" onClick={() => openDialog({ type: 'new-playlist' })}>
          <PlusIcon className="size-5" />
        </IconButton>
        <button
          type="button"
          aria-label={`Listening as ${user.name}. Switch listener`}
          onClick={() => openDialog({ type: 'listeners' })}
          className="pressable ml-1 rounded-full"
        >
          <Avatar id={user.id} name={user.name} className="size-8 text-xs" />
        </button>
      </div>
    </header>
  )
}

export function MobileTabBar({ route }: { route: Route }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {NAV.map((item) => {
        const active = route.name === item.match
        return (
          <a
            key={item.label}
            href={href(item.path)}
            aria-current={active ? 'page' : undefined}
            className={cx(
              'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium select-none',
              active ? 'text-fg' : 'text-muted',
            )}
          >
            <item.icon className={cx('size-6', active && 'text-accent-text')} weight={active ? 'fill' : 'regular'} />
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
