import {
	Body,
	Controller,
	Get,
	Inject,
	NotFoundException,
	Param,
	Post,
	forwardRef,
} from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CouponsService } from './coupons.service';

@Controller('api/coupons')
export class CouponsController {
	constructor(
		private readonly couponsService: CouponsService,
		@Inject(forwardRef(() => CartService))
		private readonly cartService: CartService,
	) {}

	@Get()
	findAll() {
		return this.couponsService.findAll();
	}

	@Get(':code')
	findByCode(@Param('code') code: string) {
		const coupon = this.couponsService.findByCode(code);

		if (!coupon) {
			throw new NotFoundException(`Coupon ${code} is not available`);
		}

		return coupon;
	}

	@Post()
	apply(@Body() applyCouponDto: ApplyCouponDto) {
		return this.cartService.applyCoupon(applyCouponDto.code);
	}
}
