# Pizzaria BL — demonstração local

Esta cópia independente usa a identidade visual e o cardápio da Pizzaria BL. A montagem de pizzas, esfihas e bebidas funciona em demonstração e, com integração habilitada, envia pedidos no mesmo contrato de pizza usado pelo administrativo e acompanhamento.

A integração usa exclusivamente o projeto `pizzaria-bl`, no plano Spark, mantendo a abordagem de validação do açaí. As regras podem ser testadas no emulador com `npm run test:rules` e publicadas com `npm run deploy:rules`.

As cores da pizzaria ficam nos tokens semânticos em `:root` de `src/index.css`. O administrativo usa os mesmos tokens de marca, superfícies e estados. Os tokens antigos restantes atendem às telas legadas ainda não integradas.

## Executar a demonstração

```bash
npm ci
npm run dev
```

O modo de demonstração fica ativo sem arquivo `.env` e também com `VITE_DEMO_MODE=true`. Todos os ingredientes aparecem disponíveis localmente; as restrições de combinação e os cálculos de preço continuam ativos. É possível montar o pedido, preencher os dados e consultar o total, mas pedidos não são enviados nem salvos. O administrativo e o acompanhamento de pedidos exibem um aviso de indisponibilidade.

Mantenha `VITE_DEMO_MODE=true` para explorar sem gravar. Para validar a integração com pedidos fictícios no ambiente configurado da pizzaria, use `VITE_DEMO_MODE=false` e a configuração Firebase completa. Configuração ausente, incompleta ou apontando para outro projeto mantém a demonstração mesmo com a flag `false`. As regras da pizzaria não aceitam o formato antigo de pedidos de açaí. A publicação e liberação a clientes reais pertencem à etapa 8.

## Verificação local

O procedimento de publicação, validação em produção e retorno à versão anterior está em [docs/producao.md](docs/producao.md). A hospedagem confirmada é Firebase Hosting, site `pizzaria-bl`, com domínio padrão. Publicar e abrir para clientes dependem das liberações registradas nesse procedimento.

```bash
npm test
npm run build
```

O build também executa o TypeScript. O projeto não possui script de lint.

## Limitações desta fase

- A montagem fica somente na memória: recarregar a página reinicia o pedido.
- O envio, o acompanhamento e o administrativo não funcionam no modo de demonstração.
- A integração foi preparada para validação com pedidos fictícios; configuração remota, contas reais e publicação exigem conferência no ambiente de destino.

## Envio e acompanhamento de pizzas

Fora da demonstração, a finalização converte a montagem em `PizzaOrderDocument` (`schemaVersion: 1`), calcula valores em centavos e grava em `orders/{trackingCode}`. A transação consulta `storeSettings/pizzaAvailability` antes de gravar; se houver esgotamento, inclusive de um sabor da pizza meio a meio, o envio é recusado com os nomes das opções afetadas. As regras existentes também verificam a disponibilidade na gravação.

O formulário fica bloqueado durante o envio. Cliques repetidos não iniciam outro envio, e a confirmação aparece somente após sucesso da transação. Falhas conservam itens, dados e pagamento para ajuste ou nova tentativa. Após sucesso, o botão reabre a confirmação sem gravar novamente; “Fazer novo pedido” limpa a montagem. Essa proteção vale para a sessão atual, sem persistência de rascunho entre recargas.

O código visível começa com `BL-`; o link usa também um UUID aleatório. `/pedido/:trackingCode` lê os nomes, bordas, quantidades e valores persistidos, acompanha os estados de retirada e cancelamento, distingue pedido inexistente de erro e permite tentar novamente. O acesso público por link mantém o modelo aprovado na etapa 5. Preços e correspondência entre linhas e IDs continuam validados no cliente, conforme a limitação já existente das regras.

Os testes de integração (`npm run test:rules`) usam somente o emulador `demo-pizzaria-bl` e incluem envio anônimo, leitura administrativa, outra sessão acompanhando status e esgotamento antes do envio. Para a interação no navegador, `node tests/checkout.browser.mjs` usa o Playwright disponível na máquina (ou indicado por `PLAYWRIGHT_MODULE_PATH`), com transporte simulado e sem conexão Firebase. Não há nova dependência no projeto.

## Administrativo de pizzas

Fora do modo demonstração, `/admin/login` mantém a autenticação existente. As regras do Firestore exigem `admins/{uid}.active == true` para listar pedidos ou gravar status e disponibilidade; estar autenticado sozinho não concede essas permissões.

O painel lê `PizzaOrderDocument` (`schemaVersion: 1`), mostra todas as linhas com quantidades, sabores, bordas, preços salvos e retirada na loja. O tamanho único vigente é Grande; não há adicionais avulsos além das bordas no contrato atual. Esfihas e bebidas são linhas próprias. A sequência continua Recebido → Em preparo → Pronto para retirada → Concluído, com cancelamento nos três estados ativos. Cancelados aparecem no histórico separado.

Os indicadores por categoria somam unidades, sem duplicar pizzas meio a meio nem incluir cancelados. A restrição de exibição da métrica interna continua usando `VITE_SIZE_METRICS_ALLOWED_EMAIL`, preservada por compatibilidade.

A disponibilidade usa `storeSettings/pizzaAvailability`: listas de IDs esgotados em `pizzaFlavorIds`, `borderIds`, `esfihaIds` e `beverageIds`, com `updatedAt` e `updatedBy`. Documento ausente significa tudo disponível. A gravação usa transação para preservar alterações concorrentes. Esgotar um sabor bloqueia a seleção declarada desse sabor, inclusive meio a meio. A montagem pública acompanha a disponibilidade em tempo real: opções esgotadas permanecem visíveis e desabilitadas, incluindo meio a meio, bordas, esfihas e bebidas. Itens já adicionados são preservados; se esgotarem, o cliente deve removê-los ou ajustar a borda antes de finalizar. A transação confere novamente a disponibilidade ao enviar.

Valide com pedidos fictícios e `npm run test:rules` no emulador `demo-pizzaria-bl`. A liberação de pedidos reais fica para a etapa 8.

## Documentação original

O conteúdo abaixo é referência histórica do projeto de açaí, inclusive serviços e telas ainda não adaptados. Para a pizzaria, use `.env.example`, mantenha a demonstração ativa e publique as regras somente no projeto `pizzaria-bl`.

Landing page e sistema de pedidos para uma loja local de acai, com montagem personalizada do pedido, acompanhamento em tempo real e painel administrativo com Kanban operacional.

## Visao Geral

O projeto foi construido com React, Vite, TypeScript, Tailwind CSS e Firebase. A experiencia principal permite que o cliente monte um pedido de acai ou creme, informe seus dados, escolha a forma de pagamento e acompanhe o status do pedido por um link publico.

No painel administrativo, a loja consegue visualizar os pedidos em tempo real, atualizar o status de preparo, consultar detalhes e separar pedidos cancelados em uma area propria.

## Funcionalidades

- Landing page responsiva com hero, chamada principal e contato.
- Montagem de pedido em etapas.
- Escolha de tamanho: P, M, G, Barca P ou Barca M.
- Escolha do tipo de pedido: so acai, acai com creme ou so creme.
- Seleção de um sabor para açaí com creme ou até dois sabores para pedidos só de creme.
- Seleção livre de frutas e guloseimas, com controle de quantidade por item.
- Primeira porção de cada fruta, guloseima ou calda incluída e porções extras por R$ 0,50.
- Paçoca e Canudo indisponíveis para pedidos no pote P.
- Opcao de sem calda.
- Dados do cliente com mascara de telefone.
- Forma de pagamento com suporte a Pix, cartao e dinheiro.
- Campo de troco com mascara em Real brasileiro.
- Criacao de pedidos no Firebase Firestore.
- Modal de confirmacao com codigo do pedido e link de acompanhamento.
- Pagina publica de acompanhamento do pedido.
- Painel admin com login via Firebase Authentication.
- Kanban de pedidos com atualizacao em tempo real.
- Controle em tempo real da disponibilidade de cremes, frutas, guloseimas e caldas.
- Separacao de pedidos cancelados em uma tela propria.
- Pagina 404 personalizada.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Firebase Authentication
- Firebase Firestore
- React Router
- GSAP
- Lucide React

## Estrutura Principal

```text
src/
  assets/
    images/              # Imagens do hero, frutas e produtos
  components/
    admin/               # Componentes do painel administrativo
    landing/             # Secoes da landing page
    layout/              # Header, footer, container e logo
    order/               # Componentes do fluxo de pedido
    ui/                  # Componentes reutilizaveis
  contexts/
    AuthContext.tsx      # Contexto de autenticacao do admin
  data/
    *.ts                 # Configuracoes de tamanhos, frutas, caldas etc.
  hooks/
    useOrderBuilder.ts   # Estado e regras do fluxo de pedido
  lib/
    firebase.ts          # Inicializacao do Firebase
  pages/
    admin/               # Rotas do admin
    LandingPage.tsx
    TrackingPage.tsx
    NotFoundPage.tsx
  services/
    authService.ts       # Login e logout
    orderService.ts      # Criacao, leitura e atualizacao de pedidos
  types/
    order.ts             # Tipos do pedido
  utils/
    *.ts                 # Formatadores, validacoes e regras auxiliares
```

## Rotas

| Rota                    | Descricao                         |
| ----------------------- | --------------------------------- |
| `/`                     | Landing page e montagem do pedido |
| `/pedido/:trackingCode` | Acompanhamento publico do pedido  |
| `/admin/login`          | Login administrativo              |
| `/admin/pedidos`        | Kanban de pedidos                 |
| `/admin/disponibilidade` | Controle de ingredientes          |
| `/admin/cancelados`     | Lista de pedidos cancelados       |
| `*`                     | Pagina 404                        |

## Requisitos

- Node.js instalado
- Projeto Firebase configurado
- Firebase Authentication com login por e-mail e senha
- Firestore habilitado

## Configuracao do Ambiente

Crie um arquivo `.env` ou `.env.local` na raiz do projeto usando o modelo abaixo:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

O arquivo `.env.example` ja traz a lista das variaveis necessarias.

> Nao envie arquivos `.env` com credenciais reais para o GitHub.

## Instalacao

```bash
npm install
```

## Rodando em Desenvolvimento

```bash
npm run dev
```

Depois acesse:

```text
http://localhost:5173
```

## Build de Producao

```bash
npm run build
```

## Testes

```bash
npm test
```

## Preview do Build

```bash
npm run preview
```

## Firebase

O projeto usa Firestore para persistir pedidos e disponibilidade:

```text
orders
storeSettings/ingredientAvailability
admins/{uid}
```

Cada pedido e salvo usando o codigo de acompanhamento como identificador do documento. O painel admin escuta a colecao em tempo real e atualiza o Kanban automaticamente quando pedidos sao criados ou alterados.

O documento `storeSettings/ingredientAvailability` guarda somente os IDs esgotados. Quando ele ainda não existe, todos os ingredientes são considerados disponíveis. A primeira alteração feita pelo admin cria o documento automaticamente.

### Liberando um administrador

Antes de publicar as regras do Firestore:

1. Crie o usuário do dono no Firebase Authentication.
2. Copie o UID desse usuário.
3. No Firestore, crie a coleção `admins`.
4. Crie um documento cujo ID seja exatamente o UID copiado.
5. Adicione o campo booleano `active` com valor `true`.

As regras ficam em `firestore.rules` e podem ser publicadas com:

```bash
firebase deploy --only firestore:rules
```

Sem o documento `admins/{uid}`, o usuário consegue autenticar, mas o Firestore bloqueia a leitura geral dos pedidos e qualquer alteração administrativa.

### Status dos Pedidos

Os pedidos podem passar pelos seguintes status:

```text
received
preparing
ready_for_pickup
completed
cancelled
```

## Fluxo do Pedido

1. Cliente escolhe o tamanho.
2. Cliente escolhe o tipo do pedido.
3. Se necessário, escolhe um ou até dois sabores de creme, conforme o tipo do pedido.
4. Cliente escolhe frutas, guloseimas, calda e suas quantidades.
5. Cliente informa nome e telefone.
6. Cliente escolhe a forma de pagamento.
7. Pedido e validado e salvo no Firestore.
8. Cliente recebe codigo e link de acompanhamento.

## Painel Administrativo

O admin permite:

- visualizar pedidos em tempo real;
- mover pedidos entre etapas;
- consultar detalhes completos;
- cancelar pedidos;
- acompanhar pedidos cancelados em tela separada;
- marcar ingredientes como disponíveis ou esgotados;
- verificar indicadores operacionais.

O acesso ao painel e protegido por Firebase Authentication.

## Personalizacao

Os principais dados do cardapio ficam em `src/data/`:

- `sizes.ts`
- `orderTypes.ts`
- `iceCreamFlavors.ts`
- `fruits.ts`
- `toppings.ts`
- `syrups.ts`
- `paymentMethods.ts`
- `storeConfig.ts`

Para alterar precos, sabores, frutas ou formas de pagamento, atualize esses arquivos.

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
