import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  availableStock: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  total: number;
}