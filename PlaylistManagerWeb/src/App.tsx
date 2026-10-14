import { IconContext, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig, motion } from 'motion/react'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { MobileHeader, MobileTabBar, Sidebar } from './components/Navigation'
import { EmptyState, buttonClasses } from './components/ui'
import { ApiError } from './lib/api'
import { useDocumentTitle } from './lib/hooks'
import { useUsers } from './lib/queries'
import { href, navigate, paths, useRoute, type Route } from './lib/router'
import { DialogsProvider } from './state/dialogs'
import { SessionProvider, useSession } from './state/session'
import { ThemeProvider, useTheme } from './state/theme'
import { OfflineScreen, OnboardingScreen, ProfilePickerScreen, SplashScreen } from './views/EntryScreens'
import { HomeView } from './views/HomeView'
import { PlaylistView } from './views/PlaylistView'
import { SearchView } from './views/SearchView'
import { SongsView } from './views/SongsView'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Do not hammer an API that is down, and never retry a 4xx.
      retry: (failureCount, error) =>
        failureCount < 1 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          {/* Icons are decorative by default; the few that carry meaning opt back in. */}
          <IconContext value={{ 'aria-hidden': true }}>
            <SessionProvider>
              <DialogsProvider>
                <Gate />
              </DialogsProvider>
            </SessionProvider>
            <ThemedToaster />
          </IconContext>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function ThemedToaster() {
  const { resolved } = useTheme()
  return (
    <Toaster
      theme={resolved}
      position="bottom-right"
      mobileOffset={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      toastOptions={{
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          borderRadius: '14px',
          fontFamily: 'var(--font-sans)',
        },
      }}
    />
  )
}

/** Decides which top-level screen to show from the state of the listeners query. */
function Gate() {
  const users = useUsers()
  const { user } = useSession()

  if (users.isPending) return <SplashScreen />
  if (users.isError) {
    const offline = users.error instanceof ApiError && users.error.isOffline
    return (
      <OfflineScreen
        message={offline ? 'The app could not connect to it.' : users.error.message}
        onRetry={() => void users.refetch()}
        retrying={users.isFetching}
      />
    )
  }
  if (users.data.length === 0) return <OnboardingScreen />
  if (!user) return <ProfilePickerScreen />
  return <Shell />
}

function Shell() {
  const route = useRoute()
  useSearchShortcut()

  // New screen, new scroll position.
  const routeKey = routeId(route)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [routeKey])

  return (
    <div className="min-h-[100dvh] md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar route={route} />
      <div className="min-w-0">
        <MobileHeader />
        <main id="main" tabIndex={-1} className="mx-auto outline-none w-full max-w-[1200px] px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pt-10 md:pb-16">
          <motion.div
            key={routeKey}
            initial={{ opacity: 0, transform: 'translateY(6px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <RouteView route={route} />
          </motion.div>
        </main>
      </div>
      <MobileTabBar route={route} />
    </div>
  )
}

function routeId(route: Route): string {
  switch (route.name) {
    case 'playlist':
      return `playlist-${route.id}`
    default:
      return route.name
  }
}

function RouteView({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomeRoute />
    case 'songs':
      return <SongsView />
    case 'search':
      return <SearchView initialQuery={route.q} />
    case 'playlist':
      return <PlaylistView id={route.id} />
    case 'not-found':
      return <NotFound />
  }
}

function HomeRoute() {
  useDocumentTitle(null)
  return <HomeView />
}

function NotFound() {
  useDocumentTitle('Not found')
  return (
    <EmptyState
      icon={<MagnifyingGlassIcon className="size-5" />}
      title="This page does not exist"
      body="The link may be mistyped."
      action={
        <a href={href(paths.home)} className={buttonClasses()}>
          Go home
        </a>
      }
    />
  )
}

/** "/" or Ctrl/Cmd+K jumps to search from anywhere, unless the user is typing. */
function useSearchShortcut() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT'
      const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey
      const isCmdK = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      if (document.querySelector('dialog[open]')) return
      if ((isSlash && !typing) || isCmdK) {
        event.preventDefault()
        navigate(paths.search())
        window.dispatchEvent(new Event('crate:focus-search'))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
