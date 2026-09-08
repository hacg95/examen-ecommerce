import { Injectable } from '@nestjs/common';
import couponsData from './data/coupons.json';
import { Coupon } from './models/coupons.model';

@Injectable()
export class CouponsService {
	private readonly coupons: Coupon[] = couponsData;

	findAll(): Coupon[] {
		return this.coupons;
	}

	findByCode(code: string): Coupon | undefined {
		return this.coupons.find((coupon) => coupon.code === code && coupon.valid);
	}

	isValid(code: string): boolean {
		return this.findByCode(code) !== undefined;
	}
}
