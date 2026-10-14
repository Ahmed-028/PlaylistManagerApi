import { ArrowClockwiseIcon, PlugsConnectedIcon, UserPlusIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '../components/DialogContents'
import { Brand } from '../components/Navigation'
import { Avatar, Button, Cover, Field, Skeleton } from '../components/ui'
import { useCreateUser } from '../lib/queries'
import { useDialogs } from '../state/dialogs'
import { useSession } from '../state/session'

function EntryLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10 sm:px-8 lg:px-12">
      <Brand className="self-start" />
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex max-w-lg flex-col gap-8">{children}</div>
        {aside ? <div className="hidden lg:block">{aside}</div> : null}
      </div>
    </div>
  )
}

/** A stack of generated sleeves, the same artwork the app gives playlists. */
function SleeveStack() {
  // Painted back to front, placed so no sleeve covers another's title in its bottom-left corner.
  const sleeves = [
    { seed: 'playlist-hero-7', title: 'Focus, no lyrics', className: 'top-[46%] left-[28%] rotate-[-2deg]' },
    { seed: 'playlist-hero-1', title: 'Long drive home', className: 'top-0 left-[4%] rotate-[-7deg]' },
    { seed: 'playlist-hero-4', title: 'Sunday kitchen', className: 'top-[14%] left-[44%] rotate-[5deg]' },
  ]
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {sleeves.map((sleeve, i) => (
        <motion.div
          key={sleeve.seed}
          initial={{ opacity: 0, transform: 'translateY(16px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
          className={`absolute w-[52%] ${sleeve.className}`}
        >
          <Cover seed={sleeve.seed} title={sleeve.title} showTitle className="aspect-square w-full shadow-panel" />
        </motion.div>
      ))}
    </div>
  )
}

export function SplashScreen() {
  return (
    <EntryLayout>
      <div className="flex flex-col gap-4" aria-busy aria-label="Loading">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-4 h-11 w-full rounded-[10px]" />
      </div>
    </EntryLayout>
  )
}

export function OfflineScreen({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying: boolean }) {
  return (
    <EntryLayout>
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <PlugsConnectedIcon className="size-6" />
      </span>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Can't reach the Playlist API</h1>
        <p className="text-[15px] leading-relaxed text-muted">{message} Start the API, then try again.</p>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-line bg-surface px-4 py-3 font-mono text-[13px] leading-relaxed text-fg">
        dotnet run --project PlaylistManagerApi --launch-profile http
      </pre>
      <p className="-mt-4 text-[13px] text-muted">
        This app expects it on <span className="font-mono text-fg">http://localhost:5239</span>. Set{' '}
        <span className="font-mono text-fg">API_URL</span> when starting the dev server to point elsewhere.
      </p>
      <Button
        variant="primary"
        icon={<ArrowClockwiseIcon className="size-4" />}
        pending={retrying}
        onClick={onRetry}
        className="self-start"
      >
        Try again
      </Button>
    </EntryLayout>
  )
}

export function OnboardingScreen() {
  const { setUserId } = useSession()
  const createUser = useCreateUser()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Add a name to continue.')
      return
    }
    setError(null)
    createUser.mutate(trimmed, {
      onSuccess: (user) => {
        setUserId(user.id)
        toast.success(`Welcome, ${user.name}`)
      },
      onError: (err) => setError(errorMessage(err)),
    })
  }

  return (
    <EntryLayout aside={<SleeveStack />}>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">Start your crate</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Create a listener, then build playlists from a catalog everyone shares.
        </p>
      </div>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Your name"
          autoFocus
          value={name}
          maxLength={200}
          name="listener-name"
          placeholder="Noor"
          autoComplete="given-name"
          error={error}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="primary" size="lg" pending={createUser.isPending} className="self-start">
          Continue
        </Button>
      </form>
    </EntryLayout>
  )
}

export function ProfilePickerScreen() {
  const { users, setUserId } = useSession()
  const { openDialog } = useDialogs()

  return (
    <EntryLayout aside={<SleeveStack />}>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">Who's listening?</h1>
        <p className="text-[17px] leading-relaxed text-muted">Pick a listener to see their playlists.</p>
      </div>
      <ul className="scrollbar-thin -mx-2 flex max-h-[50dvh] flex-col gap-1 overflow-y-auto px-2">
        {users.map((user, i) => (
          <motion.li
            key={user.id}
            initial={{ opacity: 0, transform: 'translateY(6px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: [0.23, 1, 0.32, 1] }}
          >
            <button
              type="button"
              onClick={() => setUserId(user.id)}
              className="pressable -mx-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-xl px-2 py-2 text-left hover:bg-surface-2"
            >
              <Avatar id={user.id} name={user.name} className="size-12 text-base" />
              <span className="truncate text-[17px] font-medium">{user.name}</span>
            </button>
          </motion.li>
        ))}
      </ul>
      <Button
        icon={<UserPlusIcon className="size-4" />}
        onClick={() => openDialog({ type: 'new-listener' })}
        className="self-start"
      >
        New listener
      </Button>
    </EntryLayout>
  )
}
