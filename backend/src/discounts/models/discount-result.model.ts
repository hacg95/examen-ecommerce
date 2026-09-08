import { AppliedDiscount } from './applied-discount.model';

export interface DiscountResult {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedDiscounts: AppliedDiscount[];
}