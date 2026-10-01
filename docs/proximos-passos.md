# Próximos passos — Pizzaria BL

A clonagem inicial criou a base independente, a identidade visual do cliente e o modo de demonstração. O próximo objetivo é adaptar essa base para pedidos de pizza, priorizando a página do cliente antes do administrativo.

## Fluxo ordenado

| Ordem | Etapa | Atividades | Resultado esperado |
|---|---|---|---|
| 1 | Definir cardápio e regras | Informar tamanhos, sabores, preços, quantidade de sabores por pizza, bordas e adicionais. Definir cálculo de pizza dividida, retirada ou entrega e taxa de entrega. | Regras aprovadas para orientar a implementação. |
| 2 | Completar a apresentação da loja | Substituir textos e imagens de açaí; atualizar nome, endereço, horários e contatos. Manter todas as cores consumindo os tokens de `:root`. | Página pública com conteúdo real da Pizzaria BL. |
| 3 | Adaptar a montagem do pedido | Trocar potes, frutas, cremes e caldas por opções de pizza. Adaptar tipos, validações, cálculos e resumo; definir suporte a uma ou várias pizzas por pedido antes de implementar essa parte. | Cliente monta corretamente um pedido de pizza, ainda em demonstração. |
| 4 | Validar o fluxo do cliente | Testar preços, combinações, limites de sabores, bordas, quantidades e campos obrigatórios. Conferir celular e desktop. | Experiência do cliente pronta antes de conectar dados reais. |
| 5 | Configurar Firebase próprio | Criar ambiente exclusivo da pizzaria, configurar autenticação, banco e regras de acesso para o novo formato dos pedidos. | Integração independente da loja de açaí. |
| 6 | Adaptar o administrativo | Ajustar detalhes dos pedidos, disponibilidade e operação para pizzas. Aplicar a identidade visual ao admin quando essa fase começar. | Loja consegue receber e gerenciar os pedidos corretamente. |
| 7 | Integrar envio e acompanhamento | Conectar finalização, confirmação e acompanhamento ao Firebase; validar o pedido chegando ao admin e suas mudanças de status. | Fluxo completo funcionando em ambiente de teste. |
| 8 | Publicar e validar produção | Configurar hospedagem e domínio, revisar dados comerciais e executar um pedido controlado de ponta a ponta. | Sistema disponível para clientes reais. |

## Prioridade atual

Executar as etapas 1 a 4 para concluir a experiência do cliente. O administrativo entra depois, mas precisa estar adaptado antes de liberar pedidos reais.

As regras aprovadas para a etapa 3 usam os preços e as combinações meio a meio de `src/data/pizzaMenu.ts`. Cada pedido pode conter várias pizzas, com até cinco unidades por sabor; uma pizza meio a meio conta para ambos os sabores. Esfihas e bebidas não têm limite de quantidade e podem acompanhar as pizzas. O atendimento é somente por retirada, com os métodos de pagamento já disponíveis no site.

Este documento organiza o trabalho futuro; não registra essas etapas como executadas nem substitui a definição das regras com o usuário.
