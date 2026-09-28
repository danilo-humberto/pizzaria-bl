# Clonagem inicial: Açaí → Pizzaria BL

## Objetivo e modelo recomendado

Criar uma cópia independente em `C:\Users\Danilo Humberto\Documents\code\Pessoal\pizzaria`, funcionando como **demonstração local**, com cores e logo da Pizzaria BL na página do cliente.

Fotos, textos de produtos, preços e montagem de açaí permanecem nesta fase. O administrativo será preservado no código, sem adaptação.

**Modelo recomendado: GPT-6 Sol, effort `medium`, para todas as etapas.** O trabalho é pequeno a médio e será dividido em três etapas sequenciais, executáveis na mesma conversa, sem agentes paralelos.

## Etapa 1 — Cópia independente e demonstração local

- Copiar o projeto de `acai-project` para `pizzaria`, preservando a logo existente e sem modificar a origem.
- Excluir da cópia `.git`, `node_modules`, `dist`, `.firebase`, arquivos de ambiente locais e `.firebaserc`. Manter `.env.example`, licença, código, testes e configurações genéricas.
- Inicializar Git próprio, sem remoto, commit, push ou publicação nesta entrega.
- Alterar o nome do pacote para `pizzaria-project`, incluindo os metadados correspondentes no lockfile. Instalar com `npm ci`, sem atualizar dependências.
- Introduzir `VITE_DEMO_MODE`, com demonstração ativa por padrão quando a variável estiver ausente. Documentar no `.env.example` e README.
- Em demonstração, fornecer disponibilidade local com todos os ingredientes disponíveis, preservando restrições e cálculos existentes. Não importar serviços Firebase nesse caminho.
- Permitir montar o pedido, preencher formulários e visualizar valores. Desabilitar a finalização no desktop e celular, mostrando “Demonstração: pedidos não são enviados”.
- Proteger também a função de finalização contra chamadas diretas: retornar sem importar o serviço, gravar dados ou gerar confirmação fictícia.
- Nas rotas administrativas e de acompanhamento, apresentar aviso de indisponibilidade na demonstração antes de carregar seus módulos. Preservar as implementações para integração futura.

**Critério de conclusão:** aplicação abre sem credenciais Firebase e permite explorar a interface sem acessar dados da loja original.

## Etapa 2 — Identidade visual com cores centralizadas em `:root`

### Cores padrão do projeto

- Definir toda a nova paleta em `:root`, no CSS principal, como padrão visual da Pizzaria BL.
- Utilizar nomes semânticos, como `--brand-primary`, `--brand-accent`, `--surface`, `--surface-dark`, `--text-primary` e `--border`, evitando nomes associados ao açaí.
- Centralizar também as variações de hover, foco, seleção, desabilitado, erro e sucesso, além das cores de sombras e gradientes.
- Componentes e demais seletores devem consumir exclusivamente essas variáveis com `var(...)`. Não introduzir valores HEX, RGB, OKLCH ou cores literais de Tailwind fora de `:root`.
- Transparências devem consumir tokens definidos em `:root`; sombras e gradientes devem referenciar os tokens, sem cores embutidas nos componentes.

| Papel | Referência da paleta |
|---|---|
| Fundos escuros e títulos | Marrom `#321510` |
| Ações principais e seleções | Vermelho `#C9252D` |
| Destaques pontuais | Amarelo `#FFD529` |
| Fundos claros | Creme `#FFF8EE` |
| Texto principal | Grafite `#242625` |

Os valores serão declarados em OKLCH dentro de `:root`, com variações ajustadas para contraste adequado.

### Aplicação sem alterar o administrativo

- Migrar os estilos da página principal para os novos tokens, incluindo cores atualmente fixas em bordas, sombras e gradientes.
- Preservar os tokens antigos necessários ao administrativo. Não substituir seus valores globalmente nesta etapa.
- Para componentes compartilhados, manter o comportamento atual por padrão e aplicar a opção visual da pizzaria nos usos públicos. Qualquer associação local de variáveis deve apenas referenciar tokens de `:root`, sem declarar novas cores.
- As imagens de açaí permanecem intactas; suas cores não fazem parte da migração de estilos.

### Logo e apresentação

- Acrescentar uma opção de marca ao componente compartilhado de logo, preservando seu comportamento padrão. Ativar a Pizzaria BL somente no cabeçalho e rodapé do cliente.
- Importar `assets/logo.jpeg`, mantendo proporção, fundo branco e desenho integral.
- Usar texto alternativo “Pizzaria BL”, sem repetir ao lado o nome antigo.
- Preservar tipografia, estrutura, animações, textos comerciais, contatos e catálogo. Não redesenhar componentes, editar a imagem ou adicionar dependências.

**Critério de conclusão:** página principal com identidade da pizzaria e todas as novas cores centralizadas em `:root`, sem alteração visual deliberada do administrativo.

## Etapa 3 — Validação e entrega

- Executar `npm test` e `npm run build`; o build existente também executa TypeScript. Não adicionar ferramenta de lint, pois o projeto não possui script configurado.
- Adicionar testes focados no isolamento da demonstração: ausência de carregamento dos serviços Firebase e bloqueio de envio por chamada direta.
- Verificar no navegador em larguras de 360, 768 e 1440 pixels: logo, menu, formulário, seleções, resumo, botão fixo e ausência de rolagem horizontal.
- Conferir contraste mínimo de 4,5:1 para textos comuns e foco visível nos controles.
- Auditar os estilos alterados para garantir que não existam novas cores literais fora de `:root` e que os componentes públicos consumam os tokens definidos.
- Confirmar funcionamento sem `.env`, ausência de requisições ao Firebase e tratamento dos acessos diretos às rotas indisponíveis.
- Revisar o diff para confirmar preservação dos módulos administrativos, regras de negócio, dependências e arquivos da origem.
- Atualizar o README com execução, modo de demonstração, localização dos tokens e limitações. Entregar os resultados reais das verificações.

## Contratos e limites

- Não alterar APIs, documentos Firestore, tipos de pedidos, regras de segurança ou autenticação.
- As extensões internas serão a configuração de demonstração, os tokens visuais e as opções necessárias nos componentes compartilhados.
- Nenhum pedido será persistido; recarregar a página reinicia a montagem.
- Integração Firebase real, publicação, cardápio de pizzas e adaptação do administrativo ficam para etapas futuras.
- A entrega será uma base visual para revisão local, ainda com conteúdo de açaí, conforme o escopo escolhido.
