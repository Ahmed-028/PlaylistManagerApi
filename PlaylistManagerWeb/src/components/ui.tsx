import { ArrowClockwiseIcon, CircleNotchIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { coverStyle } from '../lib/cover'
import { initials } from '../lib/format'

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

/* Buttons */

const buttonVariants = {
  primary: 'bg-accent text-accent-ink hover:brightness-[1.06] font-semibold',
  secondary: 'bg-surface-2 text-fg border border-line hover:bg-surface-3',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger text-danger-ink hover:brightness-[1.06] font-semibold',
} as const

const buttonSizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  pending?: boolean
  icon?: ReactNode
}

/** Button styling for elements that are not <button>, such as links. */
export function buttonClasses(variant: keyof typeof buttonVariants = 'secondary', size: keyof typeof buttonSizes = 'md') {
  return cx(
    'pressable inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-medium select-none',
    buttonVariants[variant],
    buttonSizes[size],
  )
}

export function Button({
  variant = 'secondary',
  size = 'md',
  pending = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cx(
        'pressable inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-medium select-none',
        'disabled:opacity-55',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {pending ? <CircleNotchIcon className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'pressable inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted',
        'hover:bg-surface-2 hover:text-fg disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* Form fields: label above, helper or error below. */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string | null
}

export function Field({ label, hint, error, className, id, ...props }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="text-[13px] font-medium text-fg">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'h-11 rounded-[10px] border bg-bg px-3.5 text-[15px] text-fg placeholder:text-faint',
          'transition-[border-color,box-shadow] duration-150 outline-none',
          'focus:border-accent focus:ring-4 focus:ring-accent-soft',
          error ? 'border-danger' : 'border-line',
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/* Generated artwork */

export function Cover({
  seed,
  title,
  className,
  showTitle = false,
}: {
  seed: string
  title?: string
  className?: string
  showTitle?: boolean
}) {
  return (
    <div
      className={cx('cover-sheen relative isolate overflow-hidden rounded-xl', className)}
      style={coverStyle(seed)}
      aria-hidden
    >
      {showTitle && title ? (
        <span className="absolute inset-x-3 bottom-2.5 z-10 line-clamp-2 text-[15px] leading-tight font-semibold tracking-tight text-white/95 [overflow-wrap:anywhere]">
          {title}
        </span>
      ) : null}
    </div>
  )
}

export function Avatar({ id, name, className }: { id: number; name: string; className?: string }) {
  return (
    <span
      className={cx(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        className ?? 'size-8 text-xs',
      )}
      style={coverStyle(`user-${id}`)}
      aria-hidden
    >
      <span className="relative z-10 drop-shadow-sm">{initials(name)}</span>
    </span>
  )
}

/* States */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton rounded-md', className)} aria-hidden />
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-start gap-4 rounded-xl border border-dashed border-line px-6 py-8 sm:px-8',
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-text">
        {icon}
      </span>
      <div className="flex max-w-[52ch] flex-col gap-1">
        <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
        {body ? <p className="text-sm leading-relaxed text-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function SectionHeading({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {action}
    </div>
  )
}

export function QueryError({ error, onRetry, title = 'Could not load this' }: { error: unknown; onRetry: () => void; title?: string }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-xl border border-line bg-surface px-6 py-6">
      <span className="flex size-10 items-center justify-center rounded-full bg-danger-soft text-danger">
        <WarningCircleIcon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
      </div>
      <Button size="sm" icon={<ArrowClockwiseIcon className="size-4" />} onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
