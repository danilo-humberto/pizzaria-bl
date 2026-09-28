import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'plum' | 'leaf' | 'soft' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  className?: string
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  ariaLabel?: string
  disabled?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  plum: 'button-plum',
  leaf: 'button-leaf',
  soft: 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[0_16px_36px_var(--shadow-color-soft)]',
  ghost: 'border border-[var(--overlay-light-16)] text-[var(--surface)]',
}

const interactiveVariantClasses: Record<ButtonVariant, string> = {
  plum: '',
  leaf: '',
  soft: 'hover:bg-[var(--surface-muted)]',
  ghost: 'hover:bg-[var(--hover-on-dark)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-5 text-sm',
  lg: 'min-h-14 px-6 text-base',
}

export function Button({
  children,
  variant = 'plum',
  size = 'md',
  icon,
  className,
  href,
  target,
  rel,
  type = 'button',
  onClick,
  ariaLabel,
  disabled = false,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl py-3 font-extrabold transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]',
    variantClasses[variant],
    sizeClasses[size],
    disabled
      ? 'cursor-not-allowed'
      : cn(
          'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
          interactiveVariantClasses[variant],
        ),
    className,
  )

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noreferrer' : undefined)}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {icon}
        <span>{children}</span>
      </a>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
      {icon}
      <span>{children}</span>
    </button>
  )
}
