import { AppliedDiscount } from './applied-discount.model';

export interface DiscountResult {
  originalAmount: number;
  techDiscountAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedDiscounts: AppliedDiscount[];
}