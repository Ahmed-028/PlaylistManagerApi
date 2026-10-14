import { useMemo, useSyncExternalStore } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'songs' }
  | { name: 'search'; q: string }
  | { name: 'playlist'; id: number }
  | { name: 'not-found' }

function parse(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'songs' && parts.length === 1) return { name: 'songs' }
  if (parts[0] === 'search' && parts.length === 1) {
    return { name: 'search', q: new URLSearchParams(query).get('q') ?? '' }
  }
  if (parts[0] === 'playlist' && parts.length === 2 && /^\d+$/.test(parts[1])) {
    return { name: 'playlist', id: Number(parts[1]) }
  }
  return { name: 'not-found' }
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  return useMemo(() => parse(hash), [hash])
}

export const paths = {
  home: '/',
  songs: '/songs',
  search: (q = '') => (q ? `/search?q=${encodeURIComponent(q)}` : '/search'),
  playlist: (id: number) => `/playlist/${id}`,
}

export const href = (path: string) => `#${path}`

export function navigate(path: string) {
  if (window.location.hash !== `#${path}`) window.location.hash = path
}

/** Updates the URL without adding a history entry or re-rendering the route. */
export function replacePath(path: string) {
  window.history.replaceState(window.history.state, '', `#${path}`)
}
