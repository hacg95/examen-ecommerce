import { ProductType } from '../enums/product-type.enum';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: ProductType;
  stock: number;
  imageUrl: string;
}