import { CheckCircle2, Clipboard, ExternalLink, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

type OrderConfirmationModalProps = {
  isOpen: boolean
  publicCode?: string
  trackingUrl?: string
  onClose: () => void
  onNewOrder: () => void
}

export function OrderConfirmationModal({
  isOpen,
  publicCode,
  trackingUrl,
  onClose,
  onNewOrder,
}: OrderConfirmationModalProps) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copyFeedback, setCopyFeedback] = useState('Copiar link')
  const absoluteTrackingUrl = useMemo(() => {
    if (!trackingUrl || typeof window === 'undefined') {
      return ''
    }

    return new URL(trackingUrl, window.location.origin).toString()
  }, [trackingUrl])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!isOpen || !dialog) return
    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    setCopyFeedback('Copiar link')
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [isOpen])

  if (!isOpen || !publicCode || !trackingUrl) {
    return null
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteTrackingUrl)
      setCopyFeedback('Link copiado')
      window.setTimeout(() => setCopyFeedback('Copiar link'), 1800)
    } catch {
      setCopyFeedback('Não foi possível copiar')
      window.setTimeout(() => setCopyFeedback('Copiar link'), 1800)
    }
  }

  const handleTrackOrder = () => {
    onClose()
    navigate(trackingUrl)
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[2rem] border-0 bg-[var(--surface)] p-0 backdrop:bg-[var(--surface-dark-translucent)]"
      aria-labelledby="order-confirmation-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-[var(--surface)] text-[var(--text-primary)] panel-shadow">
        <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,var(--surface-dark-raised),var(--brand-primary))] px-6 py-5 text-[var(--text-on-dark)]">
          <div className="flex items-start gap-3">
            <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--overlay-light-14)]">
              <CheckCircle2 size={24} />
            </span>
            <div>
              <h2 id="order-confirmation-title" className="font-display text-3xl font-extrabold leading-tight">
                Pedido realizado com sucesso!
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--contact-text)]">
                Seu pedido foi recebido e será preparado para retirada.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--surface)] transition hover:bg-[var(--border-on-dark-soft)]"
            onClick={onClose}
            aria-label="Fechar confirmação"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Código do pedido</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-[var(--brand-primary)]">{publicCode}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Link de acompanhamento</p>
              <a href={trackingUrl} className="mt-2 block break-all text-sm font-bold leading-6 text-[var(--text-secondary)] underline">{absoluteTrackingUrl}</a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="soft" className="w-full" icon={<Clipboard size={18} />} onClick={handleCopyLink}>
              {copyFeedback}
            </Button>
            <Button variant="leaf" className="w-full" icon={<ExternalLink size={18} />} onClick={handleTrackOrder}>
              Acompanhar pedido
            </Button>
          </div>

          <Button variant="plum" className="w-full" icon={<RotateCcw size={18} />} onClick={onNewOrder}>
            Fazer novo pedido
          </Button>
        </div>
      </div>
    </dialog>
  )
}
