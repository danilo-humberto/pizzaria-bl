# Produção — Pizzaria BL (DAN-73)

## Destino confirmado

Em 02/10/2026, o responsável confirmou `main` como destino da implementação, Firebase Hosting no projeto/site `pizzaria-bl` e o domínio padrão `https://pizzaria-bl.web.app`. Branch de preparação: `codex/DAN-73-publicacao-producao`, baseada em `c49a322`.

Danilo autorizou explicitamente a publicação em 02/10/2026. Hosting e regras foram publicados com sucesso às 12:01 (America/Sao_Paulo). A DAN-72 está Finished. O pedido controlado com a loja e a autorização final de abertura continuam pendentes.

## Aprovação comercial antes de publicar

Registrar responsável, data e resultado na DAN-73:

Em 02/10/2026, Danilo autorizou manter o endereço e os dados comerciais exatamente como estão. Os itens comerciais abaixo estão aprovados por essa decisão, sem alteração de conteúdo.

- [x] Manter endereço: **Rua da Pizza, 123, Recife/PE**, sem CEP.
- [x] Manter horários: terça a sexta, 15:30–22:30; sábado e domingo, 15–23h, sem inclusão de horário na segunda-feira.
- [x] Manter telefone/WhatsApp `(81) 99950-3395` e Instagram `@pizzaria.bl`.
- [x] Manter cardápio, preços, combinações e bordas de `src/data/pizzaMenu.ts`.
- [x] Manter somente retirada, sem taxa de entrega, tamanho Grande, até cinco pizzas por sabor (meio a meio conta para ambos) e pagamento em Pix, cartão ou dinheiro.
- [ ] Combinar horário e responsável da loja para um pedido controlado identificado como teste, sem preparo/cobrança acidental.
- [x] Danilo autorizou explicitamente a publicação em 02/10/2026 nesta conversa.

## Preparação técnica

1. Revisar `git status` e diff; preservar alterações preexistentes. Identificar o commit aprovado e qualquer diferença incluída no artefato. Não tratar somente o SHA de HEAD como versão exata se houver alterações locais.
2. Usar configuração Web exclusiva de `pizzaria-bl`, conforme `.env.example`. Conferir os arquivos de ambiente aplicáveis ao modo `production` e variáveis da sessão sem registrar seus valores. Para pedidos reais, `VITE_DEMO_MODE=false` e todos os campos obrigatórios devem estar presentes; configuração inválida ativa demonstração. Variáveis `VITE_*` entram no bundle público: não incluir credenciais administrativas ou chaves privadas.
3. Confirmar administradores em Authentication e `admins/{uid}.active == true`. As regras atuais preservam o modelo aprovado: cálculo de preços no cliente e leitura pública de nome/telefone pelo link do pedido. Não ampliar acesso às regras para resolver falhas de login.
4. Executar:

   ```powershell
   npm test
   npm run build
   firebase hosting:sites:list --project pizzaria-bl
   ```

   Nesta entrega, Danilo dispensou explicitamente `npm run test:rules` em 02/10/2026 após ser informado da necessidade de Java 21+. A tentativa anterior não iniciou; o teste está dispensado, não aprovado. O script permanece disponível para execuções futuras e usa somente `demo-pizzaria-bl`. O build inclui TypeScript; não existe script de lint. A dispensa não substitui o teste controlado em produção nem autoriza publicação.
5. Conferir o build no Hosting local com `firebase emulators:start --only hosting --project pizzaria-bl`. Abrir as rotas abaixo diretamente, incluindo recarga. O emulador de Hosting serve os arquivos locais, mas **não isola Firebase**: se o build estiver com integração ativa, pedidos/login acessam o ambiente remoto. Não enviar pedido fora do teste combinado.

O `firebase.json` fixa o site `pizzaria-bl`, serve `dist`, mantém a reescrita de rotas para `/index.html` e executa `npm run build` antes do deploy de Hosting, evitando publicar um build antigo. A aplicação e as regras não foram alteradas nesta preparação.

## Publicação autorizada

Antes de executar, guardar o identificador da versão anterior no histórico do Hosting e a versão das regras atualmente publicadas. Se for a primeira publicação, registrar que não existe versão anterior.

```powershell
firebase deploy --only hosting,firestore:rules --project pizzaria-bl
```

O comando publica somente Hosting e regras da pizzaria. Não usar deploy sem projeto explícito nem alterar o projeto de açaí. Hosting e regras são recursos separados: falha em uma etapa exige conferir o resultado de ambas, sem presumir rollback automático. Registrar o ID da versão/release no console e a saída resumida do deploy, sem tokens.

## Validação publicada

Executar em 360 e 1440 px e registrar evidências sem dados pessoais:

- [ ] HTTPS válido em `https://pizzaria-bl.web.app` e acesso direto/recarga de `/`, `/admin/login`, `/admin/pedidos`, `/admin/disponibilidade`, `/admin/cancelados` e `/pedido/<codigo-do-teste>`.
- [ ] Visitante nas rotas administrativas vai para login; cada administrador aprovado recebe acesso; usuário sem cadastro ativo não consegue listar pedidos nem alterar status/disponibilidade.
- [ ] Conferir nas requisições do navegador que Authentication e Firestore usam somente `pizzaria-bl`.
- [ ] Cliente envia o pedido controlado combinado; confirmação surge após gravação. Admin recebe os mesmos itens, quantidades, valores e total.
- [ ] Admin move Recebido → Em preparo → Pronto para retirada → Concluído; cliente acompanha em outra sessão. Registrar código de teste de forma restrita, pois seu link dá acesso ao pedido.
- [ ] Código inexistente e falha de acesso apresentam o estado adequado; nenhuma leitura/listagem administrativa fica pública.
- [ ] Responsável aprova os dados comerciais e autoriza abertura a clientes **após** o teste controlado.

Não apagar pedidos em massa como limpeza. Um pedido de teste deve ser tratado individualmente conforme combinado com a loja.

## Retorno à versão anterior

1. Se houver incidente, combinar a interrupção operacional com a loja e registrar o motivo. Uma versão em demonstração não revoga acesso ao banco por páginas já abertas.
2. No console Firebase → Hosting → site `pizzaria-bl` → histórico do canal live, selecionar a versão anterior registrada e usar a ação de rollback. Isso restaura arquivos/configuração do Hosting, sem desfazer pedidos, usuários ou regras.
3. Se as regras também precisarem voltar, recuperar o arquivo da versão aprovada em uma pasta separada, revisar compatibilidade com os pedidos já criados, testar no emulador e publicar somente `firestore:rules` com `--project pizzaria-bl`. Não substituir alterações locais nem abrir permissões.
4. Sem versão anterior, a contingência é publicar um build previamente verificado em demonstração; exige nova publicação autorizada. Não considerar isso um bloqueio de segurança de clientes já conectados.
5. Revalidar HTTPS, rotas, login e acompanhamento após o retorno. Não fazer rollback de dados, excluir pedidos ou alterar o banco original.

Referências oficiais: [configuração do Hosting](https://firebase.google.com/docs/hosting/full-config) e [histórico de versões e rollback](https://firebase.google.com/docs/hosting/manage-hosting-resources).

## Registro da entrega

| Campo | Situação |
|---|---|
| Data da preparação | 02/10/2026 |
| Base Git | `c49a322` (não é uma versão publicada desta issue) |
| Commit final / diferenças incluídas | Build da base `c49a322` no checkout atual; `git diff` da aplicação sem diferença textual, alterações desta issue em configuração/documentação; sem novo commit |
| Projeto / site | `pizzaria-bl` / `pizzaria-bl` |
| URL prevista | `https://pizzaria-bl.web.app` |
| Testes unitários | 95 aprovados; 43 testes de emulador ignorados sem emulador |
| TypeScript / build | Aprovados; aviso existente de chunk maior que 500 kB |
| Regras no emulador | Dispensado explicitamente por Danilo em 02/10/2026; tentativa anterior não iniciou por falta de Java no PATH |
| Lint | Sem script configurado |
| Rotas no Hosting local | Seis rotas acima retornaram HTTP 200 e o `dist/index.html` correto no emulador; interação visual e produção ainda pendentes |
| Aprovação comercial / endereço | Danilo autorizou manter todos os dados atuais em 02/10/2026 |
| Liberação de publicação | Autorizada por Danilo em 02/10/2026; deploy concluído às 12:01, America/Sao_Paulo |
| Versão Hosting anterior / nova | Consulta anterior ao canal live não retornou release; nova versão `b129d18f4859fdbd`, release `1790953280374000` |
| Regras publicadas / hash | Compiladas e publicadas pela CLI; SHA-256 local `3a559e6211697403f64d560697bcc2d639e61b9158427aad65f0509b8be7ee7c` |
| Pedido controlado e permissões em produção | Pendente |
| Responsável / autorização de abertura | Pendente |

Somente marcar a DAN-73 Ready for Review após cumprir os critérios e registrar as evidências. A preparação não substitui validação em produção.

### Conferência após publicação — 02/10/2026

- Configuração efetiva do build conferida sem exibir credenciais: integração ativa, campos obrigatórios preenchidos, projeto `pizzaria-bl` e domínio de autenticação exclusivos da pizzaria.
- Seis rotas (`/`, `/admin/login`, `/admin/pedidos`, `/admin/disponibilidade`, `/admin/cancelados`, `/pedido/dan73-inexistente`) retornaram HTTP 200 via HTTPS e HTML idêntico ao build local.
- Página pública abriu no Chrome; visual inicial conferido em 360 e 1440 px, sem transbordamento horizontal detectado. Isso não substitui o fluxo completo de pedido nessas larguras.
- Acesso visitante a `/admin/pedidos` redirecionou para `/admin/login`.
- `/pedido/dan73-inexistente` exibiu “Pedido não encontrado” após consulta.
- Não foi enviado pedido, autenticado administrador ou alterado status de pedido nesta execução. Dependem do teste controlado combinado com a loja. A abertura definitiva após esse teste ainda precisa ser registrada.
- Testes no emulador de Firestore permanecem dispensados; a compilação remota das regras no deploy não equivale à execução desses testes.

### Correção de disponibilidade em tempo real — 02/10/2026

Feedback de Danilo: desativar um item no administrativo não desabilitava sua seleção na tela pública. A montagem agora assina a disponibilidade, mantém esgotados visíveis e desabilitados e bloqueia combinações meio a meio e bordas afetadas, inclusive com modal aberto. Itens já adicionados são preservados com finalização bloqueada até ajuste ou reativação. Demonstração continua sem importar o serviço Firebase.

- Publicado somente Hosting às 12:28 (America/Sao_Paulo), versão `7d135ccee0034a3f`, release `1790954932315000`. Versão anterior para rollback: `b129d18f4859fdbd`.
- Build/TypeScript e 104 testes aprovados; 43 testes de emulador dispensados. Sem script de lint e sem nova dependência.
- Testes cobrem snapshots sucessivos, encerramento da assinatura, desmontagem durante import, demonstração, todas as categorias, bloqueio/reativação e preservação do pedido.
- Chrome em produção: Mussarela e combinações com Mussarela apareceram esgotadas e desabilitadas; as demais continuaram selecionáveis. Não foi alterada a disponibilidade remota durante esta conferência.
- O navegador carregou inicialmente o HTML anterior em cache; a versão nova foi conferida com URL sem cache. Recarregar a página uma vez para receber o código novo; depois a assinatura atualiza a disponibilidade sem recarga.
- A suíte de navegador `tests/checkout.browser.mjs` teve o transporte de disponibilidade simulado atualizado, mas não foi executada nesta revisão. O teste controlado completo com a loja e a aprovação final de abertura continuam pendentes.

### Aprovação de encerramento — 02/10/2026

Após a correção publicada, Danilo aprovou a entrega e solicitou explicitamente commit, push e mudança da DAN-73 para Finished. Essa decisão autoriza o encerramento com as evidências e limitações registradas acima; não representa execução adicional do teste controlado pela automação. A integração de destino é `main`.
