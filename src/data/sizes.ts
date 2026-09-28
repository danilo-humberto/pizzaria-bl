import barcaImage from "../assets/images/barca.png";
import product300Image from "../assets/images/product-300.png";
import product500Image from "../assets/images/product-500.png";
import product700Image from "../assets/images/product-700.png";
import type { SizeOption } from "../types/order";

export const sizes: SizeOption[] = [
  {
    id: "p",
    name: "P",
    volume: "P",
    description: "Pote pequeno",
    price: 8,
    image: product300Image,
  },
  {
    id: "m",
    name: "M",
    volume: "M",
    description: "Pote médio",
    price: 10,
    image: product500Image,
  },
  {
    id: "g",
    name: "G",
    volume: "G",
    description: "Pote grande",
    price: 12,
    image: product700Image,
  },
  {
    id: "barca-p",
    name: "Barca P",
    volume: "Barca P",
    description: "Serve 1-2 pessoas",
    price: 20,
    image: barcaImage,
  },
  {
    id: "barca-m",
    name: "Barca M",
    volume: "Barca M",
    description: "Serve 2-4 pessoas",
    price: 30,
    image: barcaImage,
  },
];
