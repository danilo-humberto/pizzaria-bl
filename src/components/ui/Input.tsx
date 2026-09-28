import type { ChangeEventHandler, InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = {
  id: string
  label: string
  value: string
  placeholder?: string
  type?: string
  onChange: ChangeEventHandler<HTMLInputElement>
  className?: string
  error?: string
  required?: boolean
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  autoComplete?: string
}

export function Input({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
  className,
  error,
  required = false,
  inputMode,
  maxLength,
  autoComplete,
}: InputProps) {
  return (
    <label className={cn('block', className)} htmlFor={id}>
      <span className="mb-2 block text-sm font-extrabold text-[var(--text-primary)]">
        {label}
        {required && <span className="text-[var(--error)]"> *</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'min-h-12 w-full rounded-2xl border bg-[var(--surface)] px-4 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary-hover)] focus:ring-4 focus:ring-[var(--focus-soft)]',
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
