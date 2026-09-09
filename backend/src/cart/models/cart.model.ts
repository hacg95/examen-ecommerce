import { CartItem } from './cart-item.model';
import { AppliedDiscount } from '../../discounts/models/applied-discount.model';
import { Coupon } from '../../coupons/models/coupons.model';

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