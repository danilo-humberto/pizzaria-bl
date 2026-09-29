import type { StoreConfig } from "../types/store";

export const storeConfig: StoreConfig = {
  name: "Pizzaria BL",
  shortName: "Pizzaria BL",
  address: {
    street: "Rua da Pizza, 123",
    city: "Recife",
    state: "PE",
    zipCode: "",
  },
  hours: {
    weekdays: "Terça a Sexta, 15:30h às 22:30h",
    sunday: "Sábado e Domingo, 15h às 23h",
  },
  paymentMethods: ["Pix", "Cartão", "Dinheiro"],
  contact: {
    phone: "(81) 99950-3395",
    whatsappUrl: "https://wa.me/5581999503395",
    instagramHandle: "@pizzaria.bl",
    instagramUrl: "https://www.instagram.com/pizzaria.bl/",
  },
};
