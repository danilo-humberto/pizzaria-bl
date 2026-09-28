import type { ChangeEventHandler } from 'react'
import { cn } from '../../utils/cn'

type TextareaProps = {
  id: string
  label: string
  value: string
  placeholder?: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  error?: string
  required?: boolean
}

export function Textarea({ id, label, value, placeholder, onChange, error, required = false }: TextareaProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-extrabold text-[var(--text-primary)]">
        {label}
        {required && <span className="text-[var(--error)]"> *</span>}
      </span>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full resize-none rounded-2xl border bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary-hover)] focus:ring-4 focus:ring-[var(--focus-soft)]',
          error ? 'border-[var(--error)]' : 'border-[var(--border)]',
        )}
      />
      {error && (
        <span id={`${id}-error`} className="mt-2 block text-xs font-bold text-[var(--error)]">
          {error}
        </span>
      )}
    </label>
  )
}
