import { useCallback, useRef, useState } from 'react'
import { isDemoMode } from '../../config/demoMode'
import { beverages, esfihas, halfAndHalfPizzas, pizzaBorders, pizzaOrderRules, pizzas } from '../../data/pizzaMenu'
import type { MenuOption } from '../../data/pizzaMenu'
import type { PizzaOrderBuilder } from '../../hooks/usePizzaOrderBuilder'
import { getPizzaOption } from '../../utils/pizzaOrder'
import { formatCurrency } from '../../utils/formatCurrency'
import { Container } from '../layout/Container'
import { SectionTitle } from '../layout/SectionTitle'
import { CustomerForm } from '../order/CustomerForm'
import { MenuOptionCards } from '../order/MenuOptionCards'
import { OrderMobileDock } from '../order/OrderMobileDock'
import { OrderSummary } from '../order/OrderSummary'
import { PaymentForm } from '../order/PaymentForm'
import { PizzaBorderModal } from '../order/PizzaBorderModal'
import { PizzaAddedToast } from '../order/PizzaAddedToast'
import type { PizzaAdditionNotice } from '../order/PizzaAddedToast'
import { Button } from '../ui/Button'
import { FinalizeOrderButton } from '../order/FinalizeOrderButton'

type BuilderSectionProps = { builder: PizzaOrderBuilder }
const controlClass = 'min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]'

export function BuilderSection({ builder }: BuilderSectionProps) {
  const [pizzaId, setPizzaId] = useState('')
  const [pizzaGroup, setPizzaGroup] = useState<'whole' | 'half'>('whole')
  const [quantity, setQuantity] = useState(1)
  const [pendingPizza, setPendingPizza] = useState<{ pizza: MenuOption; quantity: number } | null>(null)
  const [notice, setNotice] = useState<PizzaAdditionNotice | null>(null)
  const noticeId = useRef(0)
  const dismissToast = useCallback(() => setNotice(null), [])
  const pizzaOptions: MenuOption[] = pizzaGroup === 'whole' ? pizzas : halfAndHalfPizzas.map((option) => ({
    ...option,
    description: option.flavorIds.map((flavorId) => {
      const flavor = pizzas.find((pizza) => pizza.id === flavorId)
      return flavor ? `${flavor.name}: ${flavor.description}` : ''
    }).filter(Boolean).join(' '),
  }))
  const selectedPizza = pizzaOptions.find((pizza) => pizza.id === pizzaId)

  const changePizzaGroup = (group: 'whole' | 'half') => {
    setPizzaGroup(group)
    setPizzaId('')
    setQuantity(1)
  }

  const selectPizza = (id: string) => {
    setPizzaId((current) => current === id ? '' : id)
    setQuantity(1)
  }

  const addExtraItem: PizzaOrderBuilder['addItem'] = (kind, optionId, quantity) => {
    const result = builder.addItem(kind, optionId, quantity)
    if (result.ok) {
      const option = getPizzaOption(result.addedItems[0])
      if (option) setNotice({ id: ++noticeId.current, name: option.name, quantity, items: result.addedItems })
    }
    return result
  }

  return <section id="monte" className="builder-section-bg scroll-mt-24 pb-36 pt-14 md:pb-40 md:pt-20 lg:py-20">
    <Container>
      <SectionTitle eyebrow="Monte do seu jeito" title="Monte seu pedido" description="Escolha pizzas grandes, bordas, esfihas e bebidas. Retirada no local." />
      <div data-reveal className="builder-layout-grid grid min-w-0 gap-5 lg:gap-6">
        <aside className="builder-steps-panel hidden rounded-3xl p-4 text-[var(--text-primary)] panel-shadow lg:sticky lg:top-28 lg:block lg:self-start">
          <nav aria-label="Etapas do pedido"><ol className="space-y-2">
            {[
              ['pizzas', 'Pizzas'], ['extras', 'Esfihas e bebidas'], ['items', 'Itens escolhidos'],
              ['customer', 'Dados'], ['payment', 'Pagamento'], ['review', 'Revisão'],
            ].map(([id, title], index) => <li key={id}><a href={`#builder-${id}`} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-[var(--surface-muted)]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-sm font-extrabold text-[var(--surface)]">{index + 1}</span><span className="text-sm font-extrabold">{title}</span></a></li>)}
          </ol></nav>
        </aside>
        <div className="builder-main-panel min-w-0 space-y-10 overflow-x-hidden rounded-3xl p-4 text-[var(--text-primary)] panel-shadow sm:p-6 lg:p-8">
          <fieldset disabled={builder.isFinalizing || Boolean(builder.confirmationData)} className="min-w-0 space-y-10" aria-label="Montagem e dados do pedido">
          <section id="builder-pizzas" className="scroll-mt-28">
            <p className="text-sm font-extrabold text-[var(--brand-primary)]">1. Pizzas</p>
            <h3 className="font-display text-3xl font-extrabold">Escolha sua pizza</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Tamanho {pizzaOrderRules.size}. Até {pizzaOrderRules.maxQuantityPerFlavorPerOrder} unidades por sabor. Meio a meio conta para os dois sabores.</p>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Tipo de pizza">
              <button type="button" aria-pressed={pizzaGroup === 'whole'} onClick={() => changePizzaGroup('whole')} className={`min-h-11 rounded-full px-4 text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)] ${pizzaGroup === 'whole' ? 'bg-[var(--brand-primary)] text-[var(--surface)]' : 'bg-[var(--surface-muted)] text-[var(--text-primary)]'}`}>Pizzas inteiras</button>
              <button type="button" aria-pressed={pizzaGroup === 'half'} onClick={() => changePizzaGroup('half')} className={`min-h-11 rounded-full px-4 text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)] ${pizzaGroup === 'half' ? 'bg-[var(--brand-primary)] text-[var(--surface)]' : 'bg-[var(--surface-muted)] text-[var(--text-primary)]'}`}>Meio a meio</button>
            </div>
            <div className="mt-5">
              <MenuOptionCards legend="Sabor" name="pizza-option" options={pizzaOptions} selectedId={pizzaId} onSelect={selectPizza} quantityControl={{ value: quantity, max: pizzaOrderRules.maxQuantityPerFlavorPerOrder, onChange: setQuantity }} selectedAction={<Button className="w-full" onClick={() => { if (selectedPizza) { dismissToast(); setPendingPizza({ pizza: selectedPizza, quantity }) } }}>Adicionar {quantity > 1 ? `${quantity} pizzas` : 'pizza'}</Button>} />
            </div>
          </section>
          <section id="builder-extras" className="scroll-mt-28">
            <p className="text-sm font-extrabold text-[var(--brand-primary)]">2. Acompanhamentos</p><h3 className="font-display text-3xl font-extrabold">Esfihas e bebidas</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Sem limite de quantidade; podem acompanhar as pizzas.</p>
            <div className="mt-5 space-y-8"><ExtraPicker title="Esfihas" kind="esfiha" options={esfihas} onAdd={addExtraItem} /><ExtraPicker title="Bebidas" kind="beverage" options={beverages} onAdd={addExtraItem} /></div>
          </section>
          <section id="builder-items" className="scroll-mt-28">
            <p className="text-sm font-extrabold text-[var(--brand-primary)]">3. Seu pedido</p><h3 className="font-display text-3xl font-extrabold">Itens escolhidos</h3>
            {builder.itemError && <p role="alert" className="mt-3 rounded-2xl bg-[var(--error-soft)] p-3 text-sm font-bold text-[var(--error)]">{builder.itemError}</p>}
            {builder.validation.fieldErrors.items && <p className="mt-3 text-sm font-bold text-[var(--error)]">{builder.validation.fieldErrors.items}</p>}
            <div className="mt-4 space-y-3">{builder.order.items.length === 0 && <p className="rounded-2xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">Seu pedido ainda está vazio.</p>}
              {builder.order.items.map((item) => { const option = getPizzaOption(item); return <div key={item.id} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-extrabold">{item.kind === 'pizza' ? 'Pizza grande' : item.kind === 'esfiha' ? 'Esfiha' : 'Bebida'} — {option?.name}</p><p className="text-sm text-[var(--text-muted)]">{formatCurrency(option?.price ?? 0)} por unidade</p></div><button type="button" className="min-h-11 rounded-xl px-3 text-sm font-bold text-[var(--error)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]" onClick={() => builder.removeItem(item.id)}>Remover</button></div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label htmlFor={`item-quantity-${item.id}`} className="mb-1 block text-sm font-bold">Quantidade</label><input id={`item-quantity-${item.id}`} className={controlClass} type="number" inputMode="numeric" min="1" max={item.kind === 'pizza' ? 5 : undefined} step="1" value={item.quantity} onChange={(event) => builder.setItemQuantity(item.id, Number(event.target.value))} /></div>
                  {item.kind === 'pizza' && <div><label htmlFor={`item-border-${item.id}`} className="mb-1 block text-sm font-bold">Borda</label><select id={`item-border-${item.id}`} className={controlClass} value={item.borderId ?? ''} onChange={(event) => builder.setItemBorder(item.id, event.target.value)}><option value="">Sem borda</option>{pizzaBorders.map((border) => <option key={border.id} value={border.id}>{border.name} — {formatCurrency(border.price)}</option>)}</select></div>}
                </div>
              </div> })}
            </div>
          </section>
          <CustomerForm customer={builder.order.customer} observation={builder.order.observation} fieldErrors={builder.validation.fieldErrors} stepNumber={4} onCustomerChange={builder.updateCustomerData} onObservationChange={builder.setObservation} />
          <PaymentForm payment={builder.order.payment} fieldErrors={builder.validation.fieldErrors} stepNumber={5} onMethodChange={builder.setPaymentMethod} onPaymentChange={builder.updatePaymentData} />
          </fieldset>
          <section id="builder-review" className="scroll-mt-28 rounded-3xl bg-[var(--surface-muted)] p-5">
            <p className="text-sm font-extrabold text-[var(--brand-primary)]">6. Revisão</p>
            <h3 className="font-display text-3xl font-extrabold">Confira seu pedido</h3>
            <p className="mt-2 text-[var(--text-secondary)]">{isDemoMode ? 'Retirada no local. Esta página é uma demonstração; nenhum pedido será enviado.' : builder.confirmationData ? 'Pedido enviado. Consulte a confirmação ou comece um novo pedido por ela.' : 'Retirada no local. Confira os itens, seus dados e o pagamento antes de enviar.'}</p>
            {!isDemoMode && <div className="mt-5 space-y-4 lg:hidden">
              <ul className="space-y-2 text-sm">{builder.order.items.map((item) => <li key={item.id}>{item.quantity}× {item.kind === 'pizza' ? 'Pizza grande: ' : item.kind === 'esfiha' ? 'Esfiha: ' : ''}{getPizzaOption(item)?.name}{item.borderId ? `, ${pizzaBorders.find((border) => border.id === item.borderId)?.name}` : ''}</li>)}</ul>
              <p className="font-extrabold">Total: {formatCurrency(builder.total)}</p>
              <FinalizeOrderButton validation={builder.validation} isFinalizing={builder.isFinalizing} finalizeError={builder.finalizeError} onFinalize={builder.finalizeOrder} isConfirmed={Boolean(builder.confirmationData)} />
            </div>}
            <div className="mt-5 lg:hidden"><Button href="#builder-items" variant="soft" className="w-full">Ver itens escolhidos</Button></div>
            <div className="mt-5 hidden lg:block"><Button href="#monte" variant="soft">Voltar ao início e ver resumo</Button></div>
          </section>
        </div>
        <OrderSummary builder={builder} />
      </div>
      <OrderMobileDock builder={builder} />
      {pendingPizza && <PizzaBorderModal pizza={pendingPizza.pizza} quantity={pendingPizza.quantity} onClose={() => setPendingPizza(null)} onConfirm={(borderQuantities) => {
        const result = builder.addPizzas(pendingPizza.pizza.id, pendingPizza.quantity, borderQuantities)
        if (result.ok) setNotice({ id: ++noticeId.current, name: pendingPizza.pizza.name, quantity: pendingPizza.quantity, items: result.addedItems })
        return result
      }} />}
      <PizzaAddedToast notice={notice} onDismiss={dismissToast} />
    </Container>
  </section>
}

type ExtraPickerProps = { title: string; kind: 'esfiha' | 'beverage'; options: MenuOption[]; onAdd: PizzaOrderBuilder['addItem'] }
function ExtraPicker({ title, kind, options, onAdd }: ExtraPickerProps) {
  const [optionId, setOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const selectOption = (id: string) => {
    setOptionId((current) => current === id ? '' : id)
    setQuantity(1)
  }
  const addButton = <Button className={kind === 'beverage' ? 'w-full' : 'mt-3 w-full sm:w-auto'} disabled={!optionId} onClick={() => onAdd(kind, optionId, quantity)}>Adicionar {quantity > 1 ? `${quantity} ${kind === 'esfiha' ? 'esfihas' : 'bebidas'}` : kind === 'esfiha' ? 'esfiha' : 'bebida'}</Button>
  return <div className="rounded-2xl bg-[var(--surface-muted)] p-4"><h4 className="mb-4 text-lg font-extrabold">{title}</h4>
    <MenuOptionCards legend="Opção" name={`${kind}-option`} options={options} selectedId={optionId} onSelect={selectOption} quantityControl={{ value: quantity, onChange: setQuantity }} compact uniformHeight={kind === 'beverage'} selectedAction={kind === 'beverage' ? addButton : undefined} />
    {kind === 'esfiha' && addButton}
  </div>
}
