import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BadgeProps = {
  children: ReactNode
  icon?: ReactNode
  tone?: 'light' | 'leaf' | 'plum'
  className?: string
}

const toneClasses = {
  light: 'bg-[var(--surface-glass-soft)] text-[var(--text-primary)]',
  leaf: 'bg-[var(--brand-accent)] text-[var(--text-primary)]',
  plum: 'bg-[var(--brand-primary-soft)] text-[var(--surface-dark-raised)]',
}

export function Badge({ children, icon, tone = 'light', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold', toneClasses[tone], className)}>
      {icon}
      {children}
    </span>
  )
}
