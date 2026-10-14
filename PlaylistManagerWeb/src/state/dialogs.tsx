import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { Dialog } from '../components/Dialog'
import {
  AddToPlaylistPanel,
  DeletePlaylistConfirm,
  ListenersPanel,
  NewListenerForm,
  NewPlaylistForm,
  NewSongForm,
} from '../components/DialogContents'
import type { Playlist, Song } from '../lib/types'

export type DialogRequest =
  | { type: 'new-playlist'; songToAdd?: Song }
  | { type: 'add-to-playlist'; song: Song }
  | { type: 'new-song'; initialName?: string; addTo?: Playlist }
  | { type: 'listeners' }
  | { type: 'new-listener' }
  | { type: 'delete-playlist'; playlist: Playlist }

interface DialogsContextValue {
  openDialog: (request: DialogRequest) => void
  closeDialog: () => void
}

const DialogsContext = createContext<DialogsContextValue | null>(null)

/** One dialog host for the whole app; any screen can ask for a dialog by name. */
export function DialogsProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null)
  const [open, setOpen] = useState(false)
  const [requestId, setRequestId] = useState(0)

  const openDialog = useCallback((next: DialogRequest) => {
    setRequest(next)
    setRequestId((n) => n + 1)
    setOpen(true)
  }, [])
  // Keep `request` around after closing so the content stays put during the exit transition.
  const closeDialog = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ openDialog, closeDialog }), [openDialog, closeDialog])

  return (
    <DialogsContext value={value}>
      {children}
      <Dialog open={open} onClose={closeDialog} contentKey={requestId} {...describe(request)}>
        {request ? <DialogBody request={request} /> : null}
      </Dialog>
    </DialogsContext>
  )
}

function describe(request: DialogRequest | null): { title: string; description?: ReactNode } {
  switch (request?.type) {
    case 'new-playlist':
      return request.songToAdd
        ? { title: 'New playlist', description: `“${request.songToAdd.name}” will be its first song.` }
        : { title: 'New playlist', description: 'Give it a name. You can add songs right after.' }
    case 'add-to-playlist':
      return { title: 'Add to playlist', description: `${request.song.name} by ${request.song.artist}` }
    case 'new-song':
      return {
        title: 'Add a song to the catalog',
        description: request.addTo
          ? `It will also be added to “${request.addTo.name}”.`
          : 'Every listener can add catalog songs to their playlists.',
      }
    case 'listeners':
      return { title: 'Switch listener', description: 'Playlists belong to one listener each.' }
    case 'new-listener':
      return { title: 'New listener', description: 'Each listener keeps their own playlists.' }
    case 'delete-playlist':
      return { title: 'Delete this playlist?' }
    default:
      return { title: '' }
  }
}

function DialogBody({ request }: { request: DialogRequest }) {
  switch (request.type) {
    case 'new-playlist':
      return <NewPlaylistForm songToAdd={request.songToAdd} />
    case 'add-to-playlist':
      return <AddToPlaylistPanel song={request.song} />
    case 'new-song':
      return <NewSongForm initialName={request.initialName} addTo={request.addTo} />
    case 'listeners':
      return <ListenersPanel />
    case 'new-listener':
      return <NewListenerForm />
    case 'delete-playlist':
      return <DeletePlaylistConfirm playlist={request.playlist} />
  }
}

export function useDialogs() {
  const context = use(DialogsContext)
  if (!context) throw new Error('useDialogs must be used inside DialogsProvider')
  return context
}
