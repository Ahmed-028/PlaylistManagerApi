import { XIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconButton, cx } from './ui'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
  /** Changes whenever new content is requested; the body remounts so forms start fresh. */
  contentKey?: string | number
}

/**
 * Native <dialog> in modal mode: focus trapping, Escape and the top layer come from the browser.
 * The enter/exit transition lives in index.css (dialog.sheet). Content stays mounted while
 * closing so the exit transition does not collapse it.
 */
export function Dialog({ open, onClose, title, description, children, className, contentKey }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!open) {
      if (dialog.open) dialog.close()
      return
    }
    if (!dialog.open) dialog.showModal()
    // showModal() focuses the first focusable element (the close button); prefer the
    // field the content marks. Also runs when the content changes while open.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [open, contentKey])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={cx('sheet w-[calc(100%-2rem)] max-w-md rounded-2xl', className)}
    >
      <div className="flex max-h-[min(85dvh,720px)] flex-col">
        <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight [overflow-wrap:anywhere]">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-0.5">
            <XIcon className="size-[18px]" />
          </IconButton>
        </header>
        <div key={contentKey} className="scrollbar-thin min-h-0 overflow-y-auto overscroll-contain px-6 pt-4 pb-6">
          {children}
        </div>
      </div>
    </dialog>
  )
}
