// As listas contêm os IDs esgotados, como no modelo original do açaí.
export type PizzaAvailability = {
  pizzaFlavorIds: string[]
  borderIds: string[]
  esfihaIds: string[]
  beverageIds: string[]
}

export const emptyPizzaAvailability: PizzaAvailability = {
  pizzaFlavorIds: [],
  borderIds: [],
  esfihaIds: [],
  beverageIds: [],
}
