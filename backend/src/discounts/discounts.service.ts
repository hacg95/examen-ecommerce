import { Injectable } from '@nestjs/common';
import { DiscountType } from './enums/discount-type.enum';
import { AppliedDiscount } from './models/applied-discount.model';
import { DiscountResult } from './models/discount-result.model';
import { CartItem } from '../cart/models/cart-item.model';
import { Coupon } from '../coupons/models/coupons.model';

@Injectable()
export class DiscountsService {
	calculate(items: CartItem[], coupon?: Coupon): DiscountResult {
		const originalAmount = this.round(
			items.reduce((total, item) => total + item.subtotal, 0),
		);
		const appliedDiscounts: AppliedDiscount[] = [];

		const techDiscountAmount = this.round(
			items
				.filter((item) => item.product.type === 'TECH')
				.reduce((total, item) => total + item.subtotal * 0.1, 0),
		);

		const amountAfterTech = originalAmount - techDiscountAmount;

		if (amountAfterTech > 100) {
			appliedDiscounts.push({
				type: DiscountType.ORDER_THRESHOLD,
				percentage: 5,
				amount: this.round(amountAfterTech * 0.05),
			});
		}

		const thresholdDiscountAmount = appliedDiscounts.reduce(
			(total, discount) => total + discount.amount,
			0,
		);
		const amountAfterThreshold = amountAfterTech - thresholdDiscountAmount;

		if (coupon?.valid) {
			appliedDiscounts.push({
				type: DiscountType.COUPON,
				percentage: 15,
				amount: this.round(amountAfterThreshold * 0.15),
			});
		}

		const maximumDiscount = this.round(originalAmount * 0.35);
		const globalDiscountAmount = appliedDiscounts.reduce(
			(total, discount) => total + discount.amount,
			0,
		);
		const allowedGlobalDiscount = this.round(
			Math.max(0, maximumDiscount - techDiscountAmount),
		);
		const cappedGlobalDiscount = this.round(
			Math.min(allowedGlobalDiscount, globalDiscountAmount),
		);

		this.capLastDiscount(appliedDiscounts, cappedGlobalDiscount);
		const discountAmount = this.round(techDiscountAmount + cappedGlobalDiscount);

		return {
			originalAmount,
			techDiscountAmount,
			discountAmount,
			finalAmount: this.round(originalAmount - discountAmount),
			appliedDiscounts,
		};
	}

	private capLastDiscount(
		appliedDiscounts: AppliedDiscount[],
		discountAmount: number,
	): void {
		let remaining = discountAmount;

		for (const discount of appliedDiscounts) {
			discount.amount = this.round(Math.min(discount.amount, remaining));
			remaining = this.round(remaining - discount.amount);
		}
	}

	private round(amount: number): number {
		return Math.round((amount + Number.EPSILON) * 100) / 100;
	}
}
