import { Injectable } from '@nestjs/common';
import { DiscountType } from './enums/discount-type.enum';
import { AppliedDiscount } from './models/applied-discount.model';
import { DiscountResult } from './models/discount-result.model';
import { CartItem } from '../cart/models/cart-item.model';

@Injectable()
export class DiscountsService {
	calculate(items: CartItem[], couponCode?: string): DiscountResult {
		const originalAmount = this.round(
			items.reduce((total, item) => total + item.subtotal, 0),
		);
		const appliedDiscounts: AppliedDiscount[] = [];

		const techDiscountAmount = this.round(
			items
				.filter((item) => item.product.type === 'TECH')
				.reduce((total, item) => total + item.subtotal * 0.1, 0),
		);

		if (techDiscountAmount > 0) {
			appliedDiscounts.push({
				type: DiscountType.TECH,
				percentage: 10,
				amount: techDiscountAmount,
			});
		}

		const amountAfterTech = originalAmount - techDiscountAmount;

		if (amountAfterTech > 100) {
			appliedDiscounts.push({
				type: DiscountType.ORDER_THRESHOLD,
				percentage: 5,
				amount: this.round(amountAfterTech * 0.05),
			});
		}

		const amountAfterThreshold = appliedDiscounts.reduce(
			(amount, discount) => amount - discount.amount,
			originalAmount,
		);

		if (couponCode === 'WELCOME2026') {
			appliedDiscounts.push({
				type: DiscountType.COUPON,
				percentage: 15,
				amount: this.round(amountAfterThreshold * 0.15),
			});
		}

		const maximumDiscount = this.round(originalAmount * 0.35);
		const discountAmount = this.round(
			Math.min(
				maximumDiscount,
				appliedDiscounts.reduce((total, discount) => total + discount.amount, 0),
			),
		);

		this.capLastDiscount(appliedDiscounts, discountAmount);

		return {
			originalAmount,
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
