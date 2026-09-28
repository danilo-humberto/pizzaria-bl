import { ArrowUp } from "lucide-react";
import { fruits } from "../../data/fruits";
import { iceCreamFlavors } from "../../data/iceCreamFlavors";
import { orderSteps } from "../../data/orderSteps";
import { orderTypes } from "../../data/orderTypes";
import { sizes } from "../../data/sizes";
import { syrups } from "../../data/syrups";
import { toppings } from "../../data/toppings";
import type { OrderBuilder } from "../../hooks/useOrderBuilder";
import { Container } from "../layout/Container";
import { SectionTitle } from "../layout/SectionTitle";
import { CustomerForm } from "../order/CustomerForm";
import { FruitSelector } from "../order/FruitSelector";
import { IceCreamFlavorSelector } from "../order/IceCreamFlavorSelector";
import { OrderMobileDock } from "../order/OrderMobileDock";
import { OrderConfirmationModal } from "../order/OrderConfirmationModal";
import { OrderSummary } from "../order/OrderSummary";
import { OrderTypeSelector } from "../order/OrderTypeSelector";
import { PaymentForm } from "../order/PaymentForm";
import { SizeSelector } from "../order/SizeSelector";
import { SyrupSelector } from "../order/SyrupSelector";
import { ToppingSelector } from "../order/ToppingSelector";
import { Button } from "../ui/Button";

type BuilderSectionProps = {
  builder: OrderBuilder;
};

export function BuilderSection({ builder }: BuilderSectionProps) {
  const visibleOrderSteps = orderSteps.filter(
    (step) =>
      step.id !== "icecream-flavor" || builder.shouldChooseIceCreamFlavor,
  );
  const getStepNumber = (stepId: string) =>
    visibleOrderSteps.findIndex((step) => step.id === stepId) + 1;

  return (
    <section
      id="monte"
      className="builder-section-bg scroll-mt-24 pb-36 pt-14 md:pb-40 md:pt-20 lg:py-20"
    >
      <Container>
        <SectionTitle
          eyebrow="Monte do seu jeito"
          title="Monte seu açaí"
          description="Escolha o tamanho, o tipo do pedido, complementos, calda e pagamento para retirada no local."
        />

        <div
          data-reveal
          className="builder-layout-grid grid min-w-0 gap-5 lg:gap-6"
        >
          <aside className="builder-steps-panel hidden rounded-3xl p-4 text-(--text-primary) panel-shadow lg:sticky lg:top-28 lg:block lg:self-start">
            <ol className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {visibleOrderSteps.map((step, index) => (
                <li key={step.id} className="min-w-36 lg:min-w-0">
                  <a
                    href={`#builder-${step.id}`}
                    className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-(--surface-muted)"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-(--brand-primary) text-sm font-extrabold text-(--surface)">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold">
                        {step.title}
                      </span>
                      <span className="block text-xs leading-4 text-(--text-muted)">
                        {step.description}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <main className="builder-main-panel min-w-0 space-y-12 overflow-x-hidden rounded-3xl p-4 text-(--text-primary) panel-shadow sm:p-6 lg:p-8">
            <SizeSelector
              sizes={sizes}
              selectedSizeId={builder.order.sizeId}
              fieldErrors={builder.validation.fieldErrors}
              stepNumber={getStepNumber("size")}
              onSelect={builder.setSize}
            />
            <OrderTypeSelector
              orderTypes={orderTypes}
              selectedOrderTypeId={builder.order.orderTypeId}
              isBarcaSelected={builder.order.sizeId.startsWith("barca-")}
              fieldErrors={builder.validation.fieldErrors}
              stepNumber={getStepNumber("order-type")}
              onSelect={builder.setOrderType}
            />
            {(builder.availabilityError || builder.availabilityNotice) && (
              <div
                className={
                  builder.availabilityError
                    ? "rounded-2xl bg-[var(--error-soft)] p-4 text-sm font-bold leading-6 text-[var(--error)]"
                    : "rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-bold leading-6 text-[var(--success)]"
                }
                role="status"
              >
                {builder.availabilityError ?? builder.availabilityNotice}
              </div>
            )}
            {builder.shouldChooseIceCreamFlavor && (
              <IceCreamFlavorSelector
                flavors={iceCreamFlavors}
                selectedFlavorIds={builder.order.iceCreamFlavorIds}
                maxSelections={builder.maxIceCreamFlavorSelections}
                fieldErrors={builder.validation.fieldErrors}
                unavailableFlavorIds={builder.availability.creamFlavorIds}
                isAvailabilityReady={builder.isAvailabilityReady}
                stepNumber={getStepNumber("icecream-flavor")}
                onToggle={builder.toggleIceCreamFlavor}
              />
            )}
            <FruitSelector
              fruits={fruits}
              selections={builder.order.fruitSelections}
              unavailableFruitIds={builder.availability.fruitIds}
              isAvailabilityReady={builder.isAvailabilityReady}
              stepNumber={getStepNumber("fruits")}
              onToggle={builder.toggleFruit}
              onIncrement={builder.incrementFruit}
              onDecrement={builder.decrementFruit}
            />
            <ToppingSelector
              toppings={toppings}
              selections={builder.order.toppingSelections}
              selectedSizeId={builder.order.sizeId}
              unavailableToppingIds={builder.availability.toppingIds}
              isAvailabilityReady={builder.isAvailabilityReady}
              stepNumber={getStepNumber("toppings")}
              onToggle={builder.toggleTopping}
              onIncrement={builder.incrementTopping}
              onDecrement={builder.decrementTopping}
            />
            <SyrupSelector
              syrups={syrups}
              selection={builder.order.syrupSelection}
              unavailableSyrupIds={builder.availability.syrupIds}
              isAvailabilityReady={builder.isAvailabilityReady}
              stepNumber={getStepNumber("syrup")}
              onSelect={builder.setSyrup}
              onIncrement={builder.incrementSyrup}
              onDecrement={builder.decrementSyrup}
            />
            <CustomerForm
              customer={builder.order.customer}
              observation={builder.order.observation}
              fieldErrors={builder.validation.fieldErrors}
              stepNumber={getStepNumber("customer")}
              onCustomerChange={builder.updateCustomerData}
              onObservationChange={builder.setObservation}
            />
            <PaymentForm
              payment={builder.order.payment}
              fieldErrors={builder.validation.fieldErrors}
              stepNumber={getStepNumber("payment")}
              onMethodChange={builder.setPaymentMethod}
              onPaymentChange={builder.updatePaymentData}
            />

            <section
              id="builder-review"
              className="scroll-mt-28 rounded-3xl bg-(--surface-muted) p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-(--brand-primary)">
                    {getStepNumber("review")}. Revisão
                  </p>
                  <h3 className="break-words font-display text-3xl font-extrabold leading-tight text-(--text-primary)">
                    Confira seu pedido
                  </h3>
                  <p className="mt-2 leading-7 text-(--text-secondary)">
                    Revise os itens, ajuste o que precisar e finalize pelo site
                    quando estiver tudo certinho.
                  </p>
                </div>

                <Button
                  href="#monte"
                  variant="soft"
                  className="hidden shrink-0 md:inline-flex"
                  icon={<ArrowUp size={18} />}
                  ariaLabel="Voltar ao início da seção Monte seu açaí"
                >
                  Voltar ao início
                </Button>
              </div>
            </section>
          </main>

          <OrderSummary builder={builder} />
        </div>

        <OrderMobileDock builder={builder} />
        <OrderConfirmationModal
          isOpen={builder.isConfirmationModalOpen}
          publicCode={builder.confirmationData?.publicCode}
          trackingUrl={builder.confirmationData?.trackingUrl}
          onClose={builder.closeConfirmationModal}
          onNewOrder={builder.resetOrder}
        />
      </Container>
    </section>
  );
}
