export type MenuOption = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export type PizzaOption = MenuOption & {
  description: string;
};

export const pizzaOrderRules = {
  size: "Grande",
  maxQuantityPerFlavorPerOrder: 5,
  halfAndHalf: "Somente as combinações listadas em halfAndHalfPizzas",
} as const;

export const pizzas: PizzaOption[] = [
  {
    id: "mussarela",
    name: "Mussarela",
    price: 30,
    description: "Molho de tomate, mussarela, tomate, orégano e azeitona.",
  },
  {
    id: "calabresa",
    name: "Calabresa",
    price: 30,
    description:
      "Molho de tomate, mussarela, calabresa, cebola, orégano e azeitona.",
  },
  {
    id: "presunto",
    name: "Presunto",
    price: 25,
    description:
      "Molho de tomate, mussarela, presunto, tomate, orégano e azeitona.",
  },
  {
    id: "mista",
    name: "Mista",
    price: 25,
    description: "Molho, mussarela, calabresa, presunto, orégano e azeitona.",
  },
  {
    id: "calabresa-cremosa",
    name: "Calabresa Cremosa",
    price: 32,
    description:
      "Molho de tomate, mussarela, calabresa, catupiry, orégano e azeitona.",
  },
  {
    id: "mussarela-cremosa",
    name: "Mussarela Cremosa",
    price: 32,
    description: "Molho, mussarela, catupiry, orégano e azeitona.",
  },
  {
    id: "tres-queijos",
    name: "Três Queijos",
    price: 38,
    description:
      "Molho, mussarela, cheddar, catupiry, tomate, orégano e azeitona.",
  },
  {
    id: "presunto-cremoso",
    name: "Presunto Cremoso",
    price: 29,
    description:
      "Molho de tomate, mussarela, presunto, catupiry, orégano e azeitona.",
  },
  {
    id: "frango",
    name: "Frango",
    price: 38,
    description:
      "Molho de tomate, mussarela, frango, tomate, orégano e azeitona.",
  },
  {
    id: "frango-com-catupiry",
    name: "Frango com Catupiry",
    price: 40,
    description:
      "Molho de tomate, mussarela, frango, catupiry, tomate, cebola, orégano e azeitona.",
  },
  {
    id: "frango-aos-tres-queijos",
    name: "Frango aos Três Queijos",
    price: 40,
    description:
      "Molho de tomate, mussarela, frango, cheddar, catupiry, tomate, cebola, orégano e azeitona.",
  },
  {
    id: "portuguesa",
    name: "Portuguesa",
    price: 40,
    description:
      "Molho de tomate, mussarela, calabresa, presunto, ovo, milho, ervilha, pimentão, tomate, cebola, orégano e azeitona.",
  },
  {
    id: "bacon",
    name: "Bacon",
    price: 35,
    description: "Molho, mussarela, bacon, orégano e azeitona.",
  },
  {
    id: "carne-de-sol",
    name: "Carne de Sol",
    price: 47,
    description: "Molho de tomate, mussarela, carne seca, orégano e azeitona.",
  },
  {
    id: "charque",
    name: "Charque",
    price: 47,
    description: "Molho, mussarela, charque, orégano e azeitona.",
  },
  {
    id: "camarao",
    name: "Camarão",
    price: 50,
    description:
      "Molho de tomate, mussarela, camarão, catupiry, orégano e azeitona.",
  },
  {
    id: "milho",
    name: "Milho",
    price: 30,
    description:
      "Molho de tomate, mussarela, milho, tomate, orégano e azeitona.",
  },
  {
    id: "atum",
    name: "Atum",
    price: 40,
    description:
      "Molho de tomate, mussarela, atum, cebola, orégano e azeitona.",
  },
  {
    id: "franbacon",
    name: "Franbacon",
    price: 40,
    description:
      "Molho de tomate, mussarela, frango, bacon, tomate, orégano e azeitona.",
  },
  {
    id: "quatro-queijos",
    name: "Quatro Queijos",
    price: 40,
    description:
      "Molho, mussarela, provolone, catupiry, cheddar, orégano e azeitona.",
  },
  {
    id: "paulista",
    name: "Paulista",
    price: 35,
    description:
      "Molho, mussarela, presunto, bacon, ervilha, orégano e azeitona.",
  },
  {
    id: "brasileira",
    name: "Brasileira",
    price: 35,
    description:
      "Molho, mussarela, presunto, bacon, milho, orégano e azeitona.",
  },
  {
    id: "mineira",
    name: "Mineira",
    price: 30,
    description:
      "Molho de tomate, mussarela, frango, milho e ervilha, catupiry, tomate, orégano e azeitona.",
  },
  {
    id: "tropical",
    name: "Tropical",
    price: 38,
    description:
      "Molho de tomate, mussarela, frango, milho e ervilha, ovos, catupiry, tomate, orégano e azeitona.",
  },
  {
    id: "americana",
    name: "Americana",
    price: 38,
    description:
      "Molho de tomate, mussarela, calabresa, bacon, tomate, cebola, orégano e azeitona.",
  },
  {
    id: "sertaneja",
    name: "Sertaneja",
    price: 47,
    description:
      "Molho de tomate, mussarela, carne de sol, cuentro, tomate, cebola, orégano e azeitona.",
  },
  {
    id: "mandacaru",
    name: "Mandacaru",
    price: 50,
    description:
      "Molho de tomate, mussarela, charque, queijo coalho, tomate, cebola, orégano e azeitona.",
  },
  {
    id: "romeu-e-julieta",
    name: "Romeu e Julieta",
    price: 35,
    description: "Molho, mussarela e goiabada.",
  },
  {
    id: "marguerita",
    name: "Marguerita",
    price: 30,
    description:
      "Molho de tomate, mussarela, tomate, manjericão, orégano e azeitona.",
  },
  {
    id: "nordestina",
    name: "Nordestina",
    price: 50,
    description:
      "Molho, mussarela, carne, charque, cebola, orégano e azeitona.",
  },
  {
    id: "cartola",
    name: "Cartola",
    price: 33,
    description: "Molho, mussarela, banana, açúcar, canela e orégano.",
  },
  {
    id: "quatro-sabores",
    name: "4 Sabores",
    price: 35,
    description:
      "Molho de tomate, mussarela, tomate, calabresa, presunto, frango, orégano e azeitona.",
  },
];

export const halfAndHalfPizzas: MenuOption[] = [
  { id: "calabresa-mussarela", name: "Calabresa / Mussarela", price: 27 },
  { id: "calabresa-presunto", name: "Calabresa / Presunto", price: 27 },
  { id: "mussarela-presunto", name: "Mussarela / Presunto", price: 27 },
  { id: "frango-mussarela", name: "Frango / Mussarela", price: 40 },
  { id: "frango-calabresa", name: "Frango / Calabresa", price: 35 },
  { id: "frango-portuguesa", name: "Frango / Portuguesa", price: 40 },
  { id: "carne-de-sol-frango", name: "Carne de Sol / Frango", price: 40 },
];

export const pizzaBorders: MenuOption[] = [
  { id: "mussarela", name: "Borda de mussarela", price: 10 },
  { id: "catupiry", name: "Borda de catupiry", price: 5 },
  { id: "cheddar", name: "Borda de cheddar", price: 5 },
];

export const esfihas: MenuOption[] = [
  { id: "calabresa", name: "Calabresa", price: 4 },
  { id: "mussarela", name: "Mussarela", price: 4 },
  { id: "presunto", name: "Presunto", price: 4 },
  { id: "charque", name: "Charque", price: 4 },
  { id: "frango", name: "Frango", price: 4 },
  { id: "carne-de-sol", name: "Carne de Sol", price: 4 },
];

export const beverages: MenuOption[] = [
  { id: "fanta-2l", name: "Fanta 2L", price: 12 },
  { id: "guarana-antarctica-1l", name: "Guaraná Antarctica 1L", price: 9 },
  { id: "guarana-antarctica-2l", name: "Guaraná Antarctica 2L", price: 13 },
  { id: "guarana-antarctica-lata", name: "Guaraná Antarctica Lata", price: 5 },
  { id: "coca-cola-1l", name: "Coca-Cola 1L", price: 10 },
  { id: "coca-cola-2l", name: "Coca-Cola 2L", price: 15 },
  { id: "coca-cola-lata", name: "Coca-Cola Lata", price: 5 },
  { id: "santa-joana-guarana-2l", name: "Santa Joana Guaraná 2L", price: 7 },
  { id: "itaipava-latao", name: "Itaipava Latão", price: 6 },
  { id: "skol-latao", name: "Skol Latão", price: 6 },
  { id: "heineken-long", name: "Heineken Long", price: 10 },
  { id: "heineken-lata", name: "Heineken Lata", price: 8 },
  { id: "budweiser-long", name: "Budweiser Long", price: 10 },
  { id: "brahma-latao", name: "Brahma Latão", price: 6 },
  { id: "agua-mineral", name: "Água Mineral", price: 2 },
  { id: "itaipava", name: "Itaipava", price: 6 },
  { id: "stella-artois", name: "Stella Artois", price: 8 },
  { id: "agua-com-gas", name: "Água com gás", price: 5 },
  { id: "limoneto", name: "Limoneto", price: 6 },
  { id: "ice", name: "Ice", price: 6 },
];
