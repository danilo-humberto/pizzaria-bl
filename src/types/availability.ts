export type IngredientCategory = 'creamFlavors' | 'fruits' | 'toppings' | 'syrups'

export type IngredientAvailability = {
  creamFlavorIds: string[]
  fruitIds: string[]
  toppingIds: string[]
  syrupIds: string[]
}

export type AvailabilityField = keyof IngredientAvailability

export type AvailabilityItem = {
  id: string
  name: string
  description: string
}

export type AvailabilityCategoryDefinition = {
  id: IngredientCategory
  title: string
  description: string
  items: AvailabilityItem[]
}
