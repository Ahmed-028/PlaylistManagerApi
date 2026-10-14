import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useUsers } from '../lib/queries'
import type { User } from '../lib/types'

/*
  The API has no authentication: ownership is checked against a userId sent with each request.
  The "current listener" is therefore a client-side choice, remembered per browser.
*/

const STORAGE_KEY = 'crate.userId'

function readStoredId(): number | null {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isInteger(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

interface SessionContextValue {
  /** The selected listener, or null when none is chosen (or the stored one no longer exists). */
  user: User | null
  users: User[]
  setUserId: (id: number | null) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: users = [] } = useUsers()
  const [userId, setUserIdState] = useState(readStoredId)

  const setUserId = useCallback((id: number | null) => {
    setUserIdState(id)
    try {
      if (id == null) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, String(id))
    } catch {
      // storage unavailable; selection still applies for this visit
    }
  }, [])

  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId])
  const value = useMemo(() => ({ user, users, setUserId }), [user, users, setUserId])

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSession() {
  const context = use(SessionContext)
  if (!context) throw new Error('useSession must be used inside SessionProvider')
  return context
}

/** For screens that only render once a listener is selected. */
export function useCurrentUser(): User {
  const { user } = useSession()
  if (!user) throw new Error('useCurrentUser requires a selected listener')
  return user
}
