import { DiscountType } from '../enums/discount-type.enum';

export interface AppliedDiscount {
  type: DiscountType;
  percentage: number;
  amount: number;
}