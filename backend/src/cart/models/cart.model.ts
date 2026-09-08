import { CartItem } from './cart-item.model';

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}