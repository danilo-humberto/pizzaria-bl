import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore'
import { buildPizzaOrderDocument } from '../src/utils/buildPizzaOrderDocument'
import { emptyPizzaAvailability } from '../src/types/pizzaAvailability'
import { createPizzaOrder, listenOrderByTrackingCode, listenOrders, updateOrderStatus } from '../src/services/orderService'
import { setPizzaAvailability, listenPizzaAvailability } from '../src/services/pizzaAvailabilityService'
import type { PizzaOrderDraft } from '../src/types/pizzaOrder'
import { calculatePizzaOrderTotal } from '../src/utils/pizzaOrder'

const session = vi.hoisted(() => ({ db: null as any, auth: { currentUser: null as { uid: string } | null } }))
vi.mock('../src/lib/firebase', () => ({ get db() { return session.db }, auth: session.auth }))
vi.mock('../src/config/demoMode', () => ({ isDemoMode: false, demoOrderNotice: 'Demonstração: pedidos não são enviados' }))

// Só roda com emulador local, sempre em projeto demo sem recursos reais.
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST
if (emulatorHost && emulatorHost !== '127.0.0.1:8080') throw new Error('Emulador deve ser local: 127.0.0.1:8080')
const suite = emulatorHost ? describe : describe.skip
suite('Firestore — permissões e contrato da pizzaria', () => {
  let env: RulesTestEnvironment
  const adminIds = ['owner-admin', 'helio-admin']
  const anonymous = () => env.unauthenticatedContext().firestore()
  const signed = (uid: string) => env.authenticatedContext(uid).firestore()
  const order = () => buildPizzaOrderDocument({
    items: [
      { id: '1', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 2, borderId: 'catupiry' },
      { id: '2', kind: 'esfiha', optionId: 'frango', quantity: 8 },
      { id: '3', kind: 'beverage', optionId: 'agua-mineral', quantity: 9 },
    ],
    customer: { name: 'Cliente teste', phone: '(81) 99999-1234' },
    payment: { method: 'pix', needsChange: false, changeFor: '' },
    observation: '',
  }, 'BL-123', 'test-order', serverTimestamp())
  const availability = (uid: string) => ({ ...emptyPizzaAvailability, updatedAt: serverTimestamp(), updatedBy: uid })

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-pizzaria-bl',
      firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
    })
  }, 30000)
  afterAll(async () => { await env?.cleanup() })
  beforeEach(async () => {
    await env.clearFirestore()
    await env.withSecurityRulesDisabled(async (context) => {
      for (const uid of adminIds) await setDoc(doc(context.firestore(), 'admins', uid), { active: true })
      await setDoc(doc(context.firestore(), 'admins', 'inactive-admin'), { active: false })
      await setDoc(doc(context.firestore(), 'orders', 'test-order'), order())
    })
  })

  it.each(adminIds)('administrador %s lista pedidos e altera status/disponibilidade', async (uid) => {
    const db = signed(uid)
    await assertSucceeds(getDocs(collection(db, 'orders')))
    await assertSucceeds(updateDoc(doc(db, 'orders', 'test-order'), { status: 'preparing', updatedAt: serverTimestamp() }))
    await assertSucceeds(setDoc(doc(db, 'storeSettings', 'pizzaAvailability'), availability(uid)))
    await assertSucceeds(updateDoc(doc(db, 'storeSettings', 'pizzaAvailability'), { pizzaFlavorIds: ['calabresa'], updatedAt: serverTimestamp() }))
  })
  it('serviços administrativos leem pizza, avançam até retirada e persistem cancelamento', async () => {
    session.db = signed(adminIds[0])
    session.auth.currentUser = { uid: adminIds[0] }
    const orders = await new Promise<Parameters<Parameters<typeof listenOrders>[0]>[0]>((resolve, reject) => {
      const stop = listenOrders((value) => { stop(); resolve(value) }, reject)
    })
    expect(orders[0].items.lines[0]).toMatchObject({ name: 'Calabresa / Mussarela', quantity: 2, borderName: 'Borda de catupiry' })
    for (const status of ['preparing', 'ready_for_pickup', 'completed'] as const) {
      await updateOrderStatus('test-order', status)
      expect((await getDoc(doc(session.db, 'orders', 'test-order'))).data()?.status).toBe(status)
    }
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'orders', 'cancel-order'), { ...order(), trackingCode: 'cancel-order' }))
    await updateOrderStatus('cancel-order', 'cancelled')
    expect((await getDoc(doc(session.db, 'orders', 'cancel-order'))).data()?.status).toBe('cancelled')
  })
  const checkoutDraft: PizzaOrderDraft = {
    items: [
      { id: '1', kind: 'pizza', optionId: 'calabresa-mussarela', quantity: 2, borderId: 'catupiry' },
      { id: '2', kind: 'esfiha', optionId: 'frango', quantity: 8 },
      { id: '3', kind: 'beverage', optionId: 'agua-mineral', quantity: 3 },
    ],
    customer: { name: 'Cliente integração', phone: '(81) 99999-1234' },
    payment: { method: 'pix', needsChange: false, changeFor: '' }, observation: 'Bem assada.',
  }

  it('envio público chega ao admin com mesmos itens e total; outra sessão acompanha todos os status', async () => {
    session.db = anonymous()
    const confirmation = await createPizzaOrder(checkoutDraft)
    const expected = buildPizzaOrderDocument(checkoutDraft, confirmation.publicCode, confirmation.trackingCode, null)
    const persisted = (await getDoc(doc(session.db, 'orders', confirmation.trackingCode))).data()!
    expect(persisted.items).toEqual(expected.items)
    expect(persisted.total).toBe(calculatePizzaOrderTotal(checkoutDraft))

    session.db = signed(adminIds[0])
    const adminOrders = await new Promise<Parameters<Parameters<typeof listenOrders>[0]>[0]>((resolve, reject) => {
      const stop = listenOrders((orders) => { stop(); resolve(orders) }, reject)
    })
    expect(adminOrders.find((order) => order.trackingCode === confirmation.trackingCode)?.items).toEqual(persisted.items)
    expect(adminOrders.find((order) => order.trackingCode === confirmation.trackingCode)?.total).toBe(persisted.total)

    session.db = anonymous()
    let nextStatus: ((status: string) => void) | undefined
    const stop = listenOrderByTrackingCode(confirmation.trackingCode, (order) => {
      expect(order?.items).toEqual(persisted.items)
      nextStatus?.(order!.status)
    })
    try {
      for (const status of ['preparing', 'ready_for_pickup', 'completed', 'cancelled'] as const) {
        const received = new Promise<string>((resolve) => { nextStatus = (value) => { if (value === status) resolve(value) } })
        session.db = signed(adminIds[0])
        await updateOrderStatus(confirmation.trackingCode, status)
        expect(await received).toBe(status)
      }
    } finally { stop() }
  }, 15000)

  it.each([
    ['pizzaFlavorIds', 'mussarela'], ['borderIds', 'catupiry'],
    ['esfihaIds', 'frango'], ['beverageIds', 'agua-mineral'],
  ] as const)('revalida %s esgotado por outra sessão antes de enviar', async (category, id) => {
    session.db = signed(adminIds[0])
    session.auth.currentUser = { uid: adminIds[0] }
    await setPizzaAvailability(category, id, false)
    session.db = anonymous()
    session.auth.currentUser = null
    await expect(createPizzaOrder(checkoutDraft)).rejects.toThrow('Indisponível no momento')
    expect((await getDocs(collection(signed(adminIds[0]), 'orders'))).size).toBe(1)
  })

  it('acompanhamento público sinaliza código inexistente', async () => {
    session.db = anonymous()
    const result = await new Promise((resolve, reject) => {
      const stop = listenOrderByTrackingCode('does-not-exist', (order) => { stop(); resolve(order) }, reject)
    })
    expect(result).toBeNull()
  })
  it('serviço de disponibilidade cria, preserva outras categorias e restaura opções', async () => {
    session.db = signed(adminIds[0])
    session.auth.currentUser = { uid: adminIds[0] }
    await Promise.all([
      setPizzaAvailability('pizzaFlavorIds', 'calabresa', false),
      setPizzaAvailability('borderIds', 'catupiry', false),
    ])
    await setPizzaAvailability('esfihaIds', 'frango', false)
    await setPizzaAvailability('beverageIds', 'agua-mineral', false)
    await setPizzaAvailability('borderIds', 'catupiry', true)
    const persisted = (await getDoc(doc(session.db, 'storeSettings', 'pizzaAvailability'))).data()
    expect(persisted).toMatchObject({ pizzaFlavorIds: ['calabresa'], borderIds: [], esfihaIds: ['frango'], beverageIds: ['agua-mineral'], updatedBy: adminIds[0] })
    const availability = await new Promise((resolve, reject) => {
      const stop = listenPizzaAvailability((value) => { stop(); resolve(value) }, reject)
    })
    expect(availability).toEqual({ pizzaFlavorIds: ['calabresa'], borderIds: [], esfihaIds: ['frango'], beverageIds: ['agua-mineral'] })
  })
  it.each(['visitor', 'unapproved-user', 'inactive-admin'])('serviços não concedem escrita a %s', async (uid) => {
    session.db = uid === 'visitor' ? anonymous() : signed(uid)
    session.auth.currentUser = uid === 'visitor' ? null : { uid }
    await expect(setPizzaAvailability('pizzaFlavorIds', 'calabresa', false)).rejects.toThrow()
    await assertFails(updateOrderStatus('test-order', 'cancelled'))
  })
  it.each(['visitor', 'unapproved-user', 'inactive-admin'])('%s não lista pedidos nem altera status/disponibilidade', async (uid) => {
    const db = uid === 'visitor' ? anonymous() : signed(uid)
    await assertFails(getDocs(collection(db, 'orders')))
    await assertFails(updateDoc(doc(db, 'orders', 'test-order'), { status: 'completed' }))
    await assertFails(setDoc(doc(db, 'storeSettings', 'pizzaAvailability'), availability(uid)))
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'storeSettings', 'pizzaAvailability'), availability(adminIds[0])))
    await assertFails(updateDoc(doc(db, 'storeSettings', 'pizzaAvailability'), { pizzaFlavorIds: ['calabresa'], updatedBy: uid }))
  })
  it('revogação do documento admin bloqueia a próxima operação', async () => {
    const db = signed(adminIds[0])
    await assertSucceeds(getDocs(collection(db, 'orders')))
    await env.withSecurityRulesDisabled((ctx) => updateDoc(doc(ctx.firestore(), 'admins', adminIds[0]), { active: false }))
    await assertFails(getDocs(collection(db, 'orders')))
  })
  it('mantém get público pelo código, sem permitir listagem pública', async () => {
    await assertSucceeds(getDoc(doc(anonymous(), 'orders', 'test-order')))
    await assertSucceeds(getDoc(doc(anonymous(), 'storeSettings', 'pizzaAvailability')))
    await assertFails(getDocs(collection(anonymous(), 'orders')))
  })
  it('ninguém pelo SDK pode se promover a admin ou remover documentos', async () => {
    for (const db of [anonymous(), signed('unapproved-user'), signed(adminIds[0])]) {
      await assertFails(setDoc(doc(db, 'admins', 'unapproved-user'), { active: true }))
      await assertFails(updateDoc(doc(db, 'admins', adminIds[0]), { active: false }))
      await assertFails(deleteDoc(doc(db, 'admins', adminIds[0])))
      await assertFails(deleteDoc(doc(db, 'orders', 'test-order')))
      await assertFails(deleteDoc(doc(db, 'storeSettings', 'pizzaAvailability')))
    }
  })
  it('permite ler apenas o próprio documento admin', async () => {
    const db = signed(adminIds[0])
    await assertSucceeds(getDoc(doc(db, 'admins', adminIds[0])))
    await assertFails(getDoc(doc(db, 'admins', adminIds[1])))
    await assertFails(getDocs(collection(db, 'admins')))
    await assertFails(getDoc(doc(anonymous(), 'admins', adminIds[0])))
  })
  it('aceita pedido válido sem configuração prévia de disponibilidade', async () => {
    const data = { ...order(), trackingCode: 'new-order' }
    await assertSucceeds(setDoc(doc(anonymous(), 'orders', 'new-order'), data))
  })
  it.each([
    ['pizzaFlavorIds', 'mussarela'], ['borderIds', 'catupiry'],
    ['esfihaIds', 'frango'], ['beverageIds', 'agua-mineral'],
  ])('nega seleção esgotada: %s', async (field, id) => {
    await setDoc(doc(signed(adminIds[0]), 'storeSettings', 'pizzaAvailability'), {
      ...availability(adminIds[0]), [field]: [id],
    })
    await assertFails(setDoc(doc(anonymous(), 'orders', 'new-order'), { ...order(), trackingCode: 'new-order' }))
  })
  it('aceita seleção quando outros produtos estão esgotados', async () => {
    await setDoc(doc(signed(adminIds[0]), 'storeSettings', 'pizzaAvailability'), {
      ...availability(adminIds[0]), pizzaFlavorIds: ['bacon'],
    })
    await assertSucceeds(setDoc(doc(anonymous(), 'orders', 'new-order'), { ...order(), trackingCode: 'new-order' }))
  })
  it.each([
    { schemaVersion: 2 }, { trackingCode: 'different' }, { status: 'completed' },
    { fulfillment: 'delivery' }, { total: -1 }, { total: '50' }, { total: NaN },
    { customer: { name: '', phone: '81999991234' } }, { payment: { method: 'invalid', needsChange: false } },
    { createdAt: Timestamp.fromMillis(0) }, { updatedAt: Timestamp.fromMillis(0) },
    { unexpectedField: true }, { items: { size: 'P', fruitIds: [] } },
  ])('recusa envelope inválido: %j', async (patch) => {
    await assertFails(setDoc(doc(anonymous(), 'orders', 'new-order'), { ...order(), trackingCode: 'new-order', ...patch }))
  })
  it('recusa linhas vazias e IDs declarados fora do formato', async () => {
    for (const patch of [{ lines: [] }, { pizzaFlavorIds: 'calabresa' }]) {
      const data = order()
      await assertFails(setDoc(doc(anonymous(), 'orders', 'new-order'), { ...data, trackingCode: 'new-order', items: { ...data.items, ...patch } }))
    }
  })
  it('recusa disponibilidade malformada ou atribuída a outro admin', async () => {
    const db = signed(adminIds[0])
    for (const patch of [{ updatedBy: adminIds[1] }, { pizzaFlavorIds: 'calabresa' }, { updatedAt: 'today' }, { creamFlavorIds: [] }]) {
      await assertFails(setDoc(doc(db, 'storeSettings', 'pizzaAvailability'), { ...availability(adminIds[0]), ...patch }))
    }
  })
  it('bloqueia caminhos antigos de açaí e coleções não previstas', async () => {
    const db = signed(adminIds[0])
    await assertFails(setDoc(doc(db, 'storeSettings', 'ingredientAvailability'), availability(adminIds[0])))
    await assertFails(getDoc(doc(db, 'unknown', 'document')))
  })
  it('documenta paridade com o açaí: total não negativo não é recalculado pelas regras', async () => {
    await assertSucceeds(setDoc(doc(anonymous(), 'orders', 'new-order'), { ...order(), trackingCode: 'new-order', total: 0 }))
    expect((await getDoc(doc(anonymous(), 'orders', 'new-order'))).data()?.total).toBe(0)
  })
})
