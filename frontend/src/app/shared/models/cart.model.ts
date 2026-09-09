import { CartItem } from './cart-item.model';
import { AppliedDiscount } from './applied-discount.model';
import { Coupon } from './coupons.model';

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountPercentage: number;
  discountLimitReached: boolean;
  total: number;
  appliedDiscounts: AppliedDiscount[];
  coupon?: Coupon;
}