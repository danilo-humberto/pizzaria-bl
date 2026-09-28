import type { OrderStep } from "../types/order";

export const orderSteps: OrderStep[] = [
  {
    id: "size",
    title: "Tamanho",
    description: "Pote ou barca",
  },
  {
    id: "order-type",
    title: "Tipo",
    description: "Açaí ou creme",
  },
  {
    id: "icecream-flavor",
    title: "Sabor",
    description: "Se tiver creme",
  },
  {
    id: "fruits",
    title: "Frutas",
    description: "Escolha à vontade",
  },
  {
    id: "toppings",
    title: "Guloseimas",
    description: "Escolha à vontade",
  },
  {
    id: "syrup",
    title: "Calda",
    description: "Escolha uma",
  },
  {
    id: "customer",
    title: "Dados",
    description: "Nome e telefone",
  },
  {
    id: "payment",
    title: "Pagamento",
    description: "Como vai pagar",
  },
  {
    id: "review",
    title: "Revisao",
    description: "Conferir pedido",
  },
];
