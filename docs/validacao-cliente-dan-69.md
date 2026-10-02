# DAN-69 — Validação da experiência do cliente

Validação da montagem em demonstração sobre o cardápio e as regras aprovadas em docs/proximos-passos.md e src/data/pizzaMenu.ts. O único tamanho é Grande; o pedido é para retirada, sem taxa ou campos de entrega. Pix, cartão e dinheiro são os meios disponíveis. A finalização permanece desativada.

## Matriz de cenários

| Cenário | Resultado esperado | Resultado obtido |
| --- | --- | --- |
| Três calabresas, uma com catupiry, uma com cheddar e uma sem borda | R$ 100,00 (R$ 90,00 + R$ 5,00 + R$ 5,00) | R$ 100,00 na prévia do modal e no total do pedido |
| Acrescentar duas calabresas / mussarela ao pedido anterior | R$ 54,00 da combinação; total R$ 154,00; cinco unidades acumuladas de calabresa | R$ 154,00 no total |
| Tentar acrescentar mais uma calabresa / mussarela | Bloquear a sexta calabresa e manter o pedido intacto | Modal mostrou o limite de cinco por sabor; total permaneceu R$ 154,00 |
| Uma calabresa com catupiry; depois alterar para duas com cheddar | R$ 35,00; depois R$ 70,00 | R$ 35,00 e R$ 70,00 em 360, 768 e 1440 px |
| Seis esfihas de calabresa e oito Fanta 2L | Sem limite de cinco para acompanhamentos; R$ 24,00 + R$ 96,00 = R$ 120,00 | R$ 120,00 no resumo |
| Remover a bebida e editar a quantidade de esfihas para sete | R$ 24,00 após remoção; R$ 28,00 após edição | R$ 24,00 e R$ 28,00 no resumo |
| Nome vazio, telefone incompleto e pagamento não escolhido | Indicar campos obrigatórios e telefone inválido | Mensagens de nome, telefone com DDD e forma de pagamento exibidas |
| Nome e telefone completos, Pix escolhido | Dados e pagamento refletidos no resumo, com retirada no local | Nome, Pix e retirada exibidos; mensagens dos campos corrigidos desapareceram |
| Modal de bordas por teclado | Foco dentro do modal; Escape fecha e devolve foco ao acionador | Entrada, fechamento e retorno do foco conferidos |
| Demonstração e isolamento | Nenhum envio de pedido ou requisição Firebase | Botão de finalizar desativado; nenhuma requisição aos endpoints Firebase observada; teste de chamada direta coberto por src/hooks/demoIsolation.test.ts |

## Revisão de largura e foco

| Largura | Rolagem horizontal | Montagem e foco |
| --- | --- | --- |
| 360 px | Não; scrollWidth = innerWidth = 360 | Modal, campos e barra móvel conferidos; Tab de observação para Pix manteve o botão visível acima da barra |
| 768 px | Não; scrollWidth = innerWidth = 768 | Modal, campos e barra móvel conferidos; Pix permaneceu visível ao receber foco por Tab |
| 1440 px | Não; scrollWidth = innerWidth = 1440 | Modal, campos e resumo lateral conferidos |

O teste foi executado em Chromium headless com viewport de 900 px de altura. Nenhum erro de página ocorreu nos três tamanhos. A captura de rede não mostrou chamadas a firestore.googleapis.com, firebaseio.com, firebaseapp.com ou identitytoolkit.googleapis.com. A página carregou Google Fonts; esse recurso não é Firebase.

## Validações automatizadas

- npm test: 54 testes aprovados em 10 arquivos, incluindo cálculo, validação e isolamento da demonstração.
- npm run build: TypeScript e Vite concluídos.
- git diff --check: sem erros.
- Lint: não executado porque o projeto não oferece script de lint.

O build ainda avisa que um chunk supera 500 kB. O servidor de desenvolvimento também registrou avisos de GSAP sobre alvos de animação ausentes durante a navegação. Essas pendências preexistentes não foram alteradas nesta issue.

## Correção encontrada

A barra fixa com o total ficava oculta no celular: o IntersectionObserver exigia 8% de uma seção com cerca de 12.818 px visíveis ao mesmo tempo. O limite foi ajustado para detectar qualquer interseção, e a barra passou a aparecer enquanto o cliente percorre a montagem.

## Revisão antes da integração

O responsável aprovou a DAN-69 em 02/10/2026. Para a conferência posterior em dispositivo real, ficam sugeridos os cenários de distribuição de bordas, limite acumulado com meio a meio, edição de itens e preenchimento por teclado.
