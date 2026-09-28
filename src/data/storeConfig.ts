import type { StoreConfig } from "../types/store";

export const storeConfig: StoreConfig = {
  name: "Shalom Açaí",
  shortName: "Shalom Açaí",
  address: {
    street: "Av. Aníbal benévolo nº423",
    city: "Recife",
    state: "PE",
    zipCode: "51020-000",
  },
  hours: {
    weekdays: "Terça a Sexta, 15:30h às 22:30h",
    sunday: "Sábado e Domingo, 15h às 23h",
  },
  paymentMethods: ["Pix", "Cartão", "Dinheiro"],
};
