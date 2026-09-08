import { CartItem } from './cart-item.model';
import { AppliedDiscount } from '../../discounts/models/applied-discount.model';

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  appliedDiscounts: AppliedDiscount[];
}