// Executar com Node e Playwright disponível na máquina (ou PLAYWRIGHT_MODULE_PATH).
// O servidor de teste substitui somente o transporte; nenhum Firebase remoto é carregado.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createServer } from 'vite'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const screenshots = join(tmpdir(), 'dan72-browser')
await mkdir(screenshots, { recursive: true })

const transport = `
import { buildPizzaOrderDocument } from '/src/utils/buildPizzaOrderDocument.ts'
import { UnavailablePizzaItemsError } from '/src/utils/pizzaAvailability.ts'
import { createTestPizzaOrder } from '/tests/fixtures/pizzaOrder.ts'
const state = window.__checkoutTest = { calls: 0, outcome: 'success', saved: createTestPizzaOrder() }
export async function createPizzaOrder(draft) {
  state.calls++
  state.draft = structuredClone(draft)
  await new Promise((resolve) => { state.release = resolve })
  if (state.outcome === 'network') throw new Error('unavailable')
  if (state.outcome === 'stock') throw new UnavailablePizzaItemsError(['Mussarela'])
  state.saved = buildPizzaOrderDocument(draft, 'BL-BROWSER', 'browser-order', new Date())
  return { publicCode: 'BL-BROWSER', trackingCode: 'browser-order', trackingUrl: '/pedido/browser-order' }
}
export function listenOrderByTrackingCode(code, callback, onError) {
  let active = true
  state.emit = () => {
    if (!active) return
    if (state.accessError ?? location.search.includes('access-error')) onError(new Error('permission-denied'))
    else callback(code === 'missing' ? null : structuredClone(state.saved))
  }
  queueMicrotask(state.emit)
  return () => { active = false }
}
`

const server = await createServer({
  server: { host: '127.0.0.1', port: 5177, strictPort: true, open: false },
  plugins: [{
    name: 'checkout-browser-test', enforce: 'pre',
    load(id) {
      const path = id.replaceAll('\\', '/')
      if (path.endsWith('/src/config/demoMode.ts')) return `export const isDemoMode = new URLSearchParams(location.search).has('demo'); export const demoOrderNotice = 'Demonstração: pedidos não são enviados'`
      if (path.endsWith('/src/services/orderService.ts')) return transport
      if (path.endsWith('/src/services/pizzaAvailabilityService.ts')) return `
        export function listenPizzaAvailability(callback) {
          queueMicrotask(() => callback({ pizzaFlavorIds: [], borderIds: [], esfihaIds: [], beverageIds: [] }));
          return () => {};
        }
      `
      if (path.endsWith('/src/lib/firebase.ts')) throw new Error('O teste de interface não pode carregar Firebase remoto.')
    },
  }],
})
let browser
try {
  await server.listen()
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  const externalRequests = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => { if (/firestore|identitytoolkit|firebaseio/.test(request.url())) externalRequests.push(request.url()) })
  page.setDefaultTimeout(10000)
  const base = 'http://127.0.0.1:5177'
  const visibleFinalize = () => page.getByRole('button', { name: 'Finalizar pedido', exact: true }).filter({ visible: true })
  const assertNoOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)

  for (const width of [1440, 390, 768]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(base)
    await page.getByRole('button', { name: 'Meio a meio', exact: true }).click()
    await page.locator('button[aria-labelledby="pizza-option-calabresa-mussarela-name"]').click()
    await page.getByRole('button', { name: 'Adicionar pizza', exact: true }).click()
    await page.getByRole('radio', { name: 'Escolher bordas', exact: true }).check()
    await page.locator('button[aria-labelledby="modal-pizza-border-catupiry-name"]').click()
    await page.getByRole('button', { name: 'Confirmar adição', exact: true }).click()
    await page.locator('#customer-name').fill('Cliente navegador')
    await page.locator('#customer-phone').fill('81999991234')
    await page.locator('#order-notes').fill('Bem assada.')
    await page.getByRole('button', { name: /Pix/ }).click()
    await assertNoOverflow()
    if (width < 1024) await page.getByRole('link', { name: 'Revisar e finalizar' }).click()
    await visibleFinalize().evaluate((button) => { button.click(); button.click() })
    await page.waitForFunction(() => window.__checkoutTest?.calls === 1)
    assert.equal(await page.getByRole('dialog').count(), 0)
    assert.equal(await page.locator('#customer-name').isDisabled(), true)
    assert.equal(await page.getByRole('button', { name: 'Enviando pedido...' }).filter({ visible: true }).isDisabled(), true)

    if (width === 1440) {
      await page.evaluate(() => { window.__checkoutTest.outcome = 'network'; window.__checkoutTest.release() })
      await page.getByRole('alert').filter({ hasText: 'Seus dados foram mantidos' }).filter({ visible: true }).waitFor()
      assert.equal(await page.locator('#customer-name').inputValue(), 'Cliente navegador')
      assert.equal(await page.locator('#order-notes').inputValue(), 'Bem assada.')
      assert.equal(await page.locator('#customer-name').isDisabled(), false)
      assert.match(await page.locator('#builder-items').innerText(), /Calabresa \/ Mussarela/)
      assert.equal(await page.getByRole('dialog').count(), 0)
      await visibleFinalize().click()
      await page.waitForFunction(() => window.__checkoutTest.calls === 2)
      await page.evaluate(() => { window.__checkoutTest.outcome = 'stock'; window.__checkoutTest.release() })
      await page.getByRole('alert').filter({ hasText: 'Mussarela' }).filter({ visible: true }).waitFor()
      assert.equal(await page.locator('#customer-name').inputValue(), 'Cliente navegador')
      await visibleFinalize().click()
      await page.waitForFunction(() => window.__checkoutTest.calls === 3)
    }

    await page.evaluate(() => { window.__checkoutTest.outcome = 'success'; window.__checkoutTest.release() })
    await page.getByRole('dialog').waitFor()
    assert.match(await page.getByRole('dialog').innerText(), /Pedido realizado com sucesso/)
    assert.equal(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)), true)
    await page.screenshot({ path: join(screenshots, `confirmation-${width}.png`) })
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    const sentCalls = await page.evaluate(() => window.__checkoutTest.calls)
    await page.getByRole('button', { name: 'Ver confirmação do pedido' }).filter({ visible: true }).first().click()
    await page.getByRole('dialog').waitFor()
    assert.equal(await page.evaluate(() => window.__checkoutTest.calls), sentCalls)
    if (width === 768) {
      await page.getByRole('button', { name: 'Fazer novo pedido', exact: true }).click()
      await page.getByRole('dialog').waitFor({ state: 'detached' })
      assert.equal(await page.locator('#customer-name').inputValue(), '')
      assert.equal(await page.locator('#order-notes').inputValue(), '')
      assert.match(await page.locator('#builder-items').innerText(), /Seu pedido ainda está vazio/)
      assert.equal(await page.locator('#customer-name').isDisabled(), false)
      assert.equal(await visibleFinalize().isDisabled(), true)
      await page.getByRole('button', { name: 'Adicionar pizza', exact: true }).click()
      await page.getByRole('radio', { name: 'Escolher bordas', exact: true }).check()
      await page.locator('button[aria-labelledby="modal-pizza-border-catupiry-name"]').click()
      await page.getByRole('button', { name: 'Confirmar adição', exact: true }).click()
      await page.locator('#customer-name').fill('Novo cliente')
      await page.locator('#customer-phone').fill('81988881234')
      await page.getByRole('button', { name: /Pix/ }).click()
      await visibleFinalize().click()
      await page.waitForFunction((calls) => window.__checkoutTest.calls === calls + 1, sentCalls)
      assert.equal(await page.evaluate(() => window.__checkoutTest.draft.items.length), 1)
      await page.evaluate(() => window.__checkoutTest.release())
      await page.getByRole('dialog').waitFor()
    }
    await page.getByRole('button', { name: 'Acompanhar pedido', exact: true }).click()
    await page.getByRole('heading', { name: 'BL-BROWSER' }).waitFor()
    await page.waitForFunction(() => window.scrollY === 0)
    assert.match(await page.locator('main').innerText(), /Calabresa \/ Mussarela/)
    assert.match(await page.locator('main').innerText(), /Borda de catupiry/)
    for (const [status, label] of [['preparing', 'Em preparo'], ['ready_for_pickup', 'Pronto para retirada'], ['completed', 'Concluído'], ['cancelled', 'Cancelado']]) {
      await page.evaluate((status) => { window.__checkoutTest.saved.status = status; window.__checkoutTest.emit() }, status)
      await page.getByText(`Status atual: ${label}. Retirada no local.`, { exact: true }).waitFor()
    }
    await assertNoOverflow()
    await page.screenshot({ path: join(screenshots, `tracking-${width}.png`), fullPage: true })
    console.log(`PASS checkout, confirmação, falhas/duplicação e status: ${width}px`)
  }

  await page.goto(`${base}/pedido/missing`)
  await page.getByRole('heading', { name: 'Pedido não encontrado' }).waitFor()
  await page.goto(`${base}/pedido/test?access-error`)
  await page.getByRole('button', { name: 'Tentar novamente' }).waitFor()
  await page.evaluate(() => { window.__checkoutTest.accessError = false })
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await page.getByRole('heading', { name: 'BL-TESTE' }).waitFor()
  await page.goto(`${base}/?demo`)
  assert.equal(await page.getByRole('button', { name: 'Finalizar pedido', exact: true }).filter({ visible: true }).isDisabled(), true)
  await page.goto(`${base}/pedido/test?demo`)
  await page.getByRole('heading', { name: 'Página indisponível na demonstração' }).waitFor()
  assert.deepEqual(externalRequests, [])
  assert.deepEqual(errors, [])
  console.log(`PASS código inexistente, erro de acesso/recuperação e isolamento. Screenshots: ${screenshots}`)
} finally {
  await browser?.close()
  await server.close()
}
