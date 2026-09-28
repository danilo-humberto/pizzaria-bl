import type { IceCreamFlavorOption } from '../types/order'

export const iceCreamFlavors: IceCreamFlavorOption[] = [
  {
    id: 'ninho-com-nutella',
    name: 'Ninho com Nutella',
    description: 'Leite Ninho com creme de avelã',
  },
  {
    id: 'ninho-trufado',
    name: 'Ninho trufado',
    description: 'Cremoso e trufado',
  },
  {
    id: 'ninho-com-oreo',
    name: 'Ninho com Oreo',
    description: 'Cremoso com biscoito',
  },
  {
    id: 'morango',
    name: 'Morango',
    description: 'Frutado e clássico',
  },
  {
    id: 'ovomaltine',
    name: 'Ovomaltine',
    description: 'Maltado e crocante',
  },
  {
    id: 'sonho-de-valsa',
    name: 'Sonho de Valsa',
    description: 'Inspirado no bombom',
  },
  {
    id: 'cupuacu',
    name: 'Cupuaçu',
    description: 'Azedinho tropical',
  },
  {
    id: 'chocomenta',
    name: 'Chocomenta',
    description: 'Chocolate com menta',
  },
  {
    id: 'creme-com-passas',
    name: 'Creme c/ passas',
    description: 'Creme com passas',
  },
  {
    id: 'delicia-de-abacaxi',
    name: 'Delícia de abacaxi',
    description: 'Abacaxi cremoso',
  },
  {
    id: 'maracuja',
    name: 'Maracujá',
    description: 'Frutado e refrescante',
  },
  {
    id: 'pacoca',
    name: 'Paçoca',
    description: 'Doce brasileiro',
  },
  {
    id: 'tapioca',
    name: 'Tapioca',
    description: 'Cremoso regional',
  },
]

export function getIceCreamFlavorsByIds(flavorIds: string[]) {
  return flavorIds
    .map((flavorId) => iceCreamFlavors.find((flavor) => flavor.id === flavorId))
    .filter((flavor): flavor is IceCreamFlavorOption => Boolean(flavor))
}
