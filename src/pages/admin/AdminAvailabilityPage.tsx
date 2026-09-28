import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleOff,
  LoaderCircle,
  PackageOpen,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useIngredientAvailability } from '../../hooks/useIngredientAvailability'
import { setIngredientAvailability } from '../../services/ingredientAvailabilityService'
import type {
  AvailabilityCategoryDefinition,
  AvailabilityItem,
  IngredientCategory,
} from '../../types/availability'
import { cn } from '../../utils/cn'
import {
  availabilityCategories,
  isIngredientAvailable,
} from '../../utils/ingredientAvailability'

export function AdminAvailabilityPage() {
  const { availability, isLoading, error: loadError } = useIngredientAvailability()
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState('')
  const [openCategory, setOpenCategory] = useState<IngredientCategory | null>('creamFlavors')

  const unavailableCount = useMemo(
    () =>
      availabilityCategories.reduce(
        (total, category) =>
          total +
          category.items.filter(
            (item) => !isIngredientAvailable(availability, category.id, item.id),
          ).length,
        0,
      ),
    [availability],
  )

  const handleToggle = async (
    category: IngredientCategory,
    item: AvailabilityItem,
    nextAvailable: boolean,
  ) => {
    const key = `${category}:${item.id}`
    setUpdatingKey(key)
    setUpdateError('')

    try {
      await setIngredientAvailability(category, item.id, nextAvailable)
    } catch (error) {
      console.error('[admin] Falha ao atualizar disponibilidade:', error)
      setUpdateError(`Não foi possível atualizar ${item.name}. Tente novamente.`)
    } finally {
      setUpdatingKey(null)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--admin-leaf)]">
            <PackageOpen size={17} />
            Controle operacional
          </p>
          <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Disponibilidade
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--admin-muted)] sm:text-base">
            Marque o que está disponível ou esgotado. A montagem do pedido é atualizada em tempo real.
          </p>
        </div>

        <div className="min-w-48 rounded-3xl border border-[oklch(89%_0.015_326_/_72%)] bg-[oklch(99%_0.006_326_/_76%)] px-5 py-4 shadow-[0_16px_40px_oklch(14%_0.05_326_/_7%)] backdrop-blur-xl">
          <p className="font-display text-4xl font-extrabold leading-none text-[var(--admin-danger)]">
            {unavailableCount}
          </p>
          <p className="mt-1 text-sm font-extrabold text-[var(--admin-muted)]">
            {unavailableCount === 1 ? 'item esgotado' : 'itens esgotados'}
          </p>
        </div>
      </div>

      {(loadError || updateError) && (
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm font-bold text-[var(--admin-danger)]">
          <AlertTriangle className="mt-0.5 shrink-0" size={17} />
          {loadError ?? updateError}
        </div>
      )}

      {isLoading ? (
        <AvailabilitySkeleton />
      ) : loadError ? (
        <div className="rounded-3xl border border-dashed border-[var(--admin-danger-border)] bg-[oklch(99%_0.006_326_/_62%)] px-5 py-14 text-center">
          <AlertTriangle className="mx-auto text-[var(--admin-danger)]" size={30} />
          <h3 className="mt-4 font-display text-2xl font-extrabold">
            Disponibilidade não carregada
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[var(--admin-muted)]">
            Recarregue a página. Os controles ficam bloqueados para evitar alterações com dados desatualizados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {availabilityCategories.map((category) => (
            <AvailabilityCategory
              key={category.id}
              category={category}
              availability={availability}
              updatingKey={updatingKey}
              isOpen={openCategory === category.id}
              onOpenChange={() =>
                setOpenCategory((current) => (current === category.id ? null : category.id))
              }
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

type AvailabilityCategoryProps = {
  category: AvailabilityCategoryDefinition
  availability: ReturnType<typeof useIngredientAvailability>['availability']
  updatingKey: string | null
  isOpen: boolean
  onOpenChange: () => void
  onToggle: (
    category: IngredientCategory,
    item: AvailabilityItem,
    nextAvailable: boolean,
  ) => Promise<void>
}

function AvailabilityCategory({
  category,
  availability,
  updatingKey,
  isOpen,
  onOpenChange,
  onToggle,
}: AvailabilityCategoryProps) {
  const availableCount = category.items.filter((item) =>
    isIngredientAvailable(availability, category.id, item.id),
  ).length

  return (
    <section className="overflow-hidden rounded-3xl border border-[oklch(89%_0.015_326_/_72%)] bg-[oklch(99%_0.006_326_/_72%)] shadow-[0_18px_48px_oklch(14%_0.05_326_/_7%)] backdrop-blur-xl">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`availability-${category.id}`}
        onClick={onOpenChange}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[oklch(97%_0.012_326_/_72%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--admin-plum)] sm:p-6"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl font-extrabold text-[var(--admin-ink)]">
            {category.title}
          </span>
          <span className="mt-1 block text-sm font-semibold text-[var(--admin-muted)]">
            {category.description}
          </span>
        </span>
        <span className="hidden shrink-0 text-sm font-extrabold text-[var(--admin-muted)] sm:block">
          {availableCount} de {category.items.length} disponíveis
        </span>
        <ChevronDown
          size={22}
          className={cn(
            'shrink-0 text-[var(--admin-plum)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div
          id={`availability-${category.id}`}
          className="border-t border-[oklch(89%_0.015_326_/_72%)] p-5 sm:p-6"
        >
          <p className="mb-4 text-sm font-extrabold text-[var(--admin-muted)] sm:hidden">
            {availableCount} de {category.items.length} disponíveis
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {category.items.map((item) => {
              const isAvailable = isIngredientAvailable(availability, category.id, item.id)
              const itemKey = `${category.id}:${item.id}`

              return (
                <AvailabilityToggle
                  key={item.id}
                  item={item}
                  isAvailable={isAvailable}
                  isUpdating={updatingKey === itemKey}
                  disabled={Boolean(updatingKey && updatingKey !== itemKey)}
                  onToggle={() => void onToggle(category.id, item, !isAvailable)}
                />
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

type AvailabilityToggleProps = {
  item: AvailabilityItem
  isAvailable: boolean
  isUpdating: boolean
  disabled: boolean
  onToggle: () => void
}

function AvailabilityToggle({
  item,
  isAvailable,
  isUpdating,
  disabled,
  onToggle,
}: AvailabilityToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAvailable}
      disabled={disabled || isUpdating}
      onClick={onToggle}
      className={cn(
        'flex min-h-24 items-center gap-4 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-plum)] disabled:cursor-wait disabled:opacity-65',
        isAvailable
          ? 'border-[oklch(72%_0.14_126_/_30%)] bg-[oklch(72%_0.14_126_/_10%)]'
          : 'border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)]',
      )}
    >
      <span
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-full transition',
          isAvailable ? 'bg-[var(--admin-leaf)]' : 'bg-[oklch(70%_0.03_326)]',
        )}
      >
        <span
          className={cn(
            'absolute top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow-sm transition',
            isAvailable ? 'left-7' : 'left-1',
          )}
        >
          {isUpdating ? (
            <LoaderCircle className="animate-spin text-[var(--admin-plum)]" size={14} />
          ) : isAvailable ? (
            <CheckCircle2 className="text-[var(--admin-leaf)]" size={14} />
          ) : (
            <CircleOff className="text-[var(--admin-danger)]" size={14} />
          )}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-[var(--admin-ink)]">{item.name}</span>
        <span className="mt-0.5 block text-sm font-semibold leading-5 text-[var(--admin-muted)]">
          {isUpdating ? 'Salvando...' : isAvailable ? 'Disponível' : 'Esgotado'}
        </span>
      </span>
    </button>
  )
}

function AvailabilitySkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando disponibilidade">
      {Array.from({ length: 4 }).map((_, categoryIndex) => (
        <div
          key={categoryIndex}
          className="rounded-3xl border border-[oklch(89%_0.015_326_/_72%)] bg-[oklch(99%_0.006_326_/_72%)] p-6"
        >
          <div className="h-7 w-48 animate-pulse rounded-full bg-[var(--admin-muted-bg)]" />
          <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-full bg-[var(--admin-muted-bg)]" />
        </div>
      ))}
    </div>
  )
}
