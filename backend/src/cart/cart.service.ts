import { Injectable } from '@nestjs/common';
import { BadRequestException, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { DiscountsService } from '../discounts/discounts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { Cart } from './models/cart.model';
import { CartItem } from './models/cart-item.model';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class CartService {
	private readonly cart: Cart = {
		items: [],
		subtotal: 0,
		discount: 0,
		total: 0,
		appliedDiscounts: [],
	};

	constructor(
		private readonly productsService: ProductsService,
		private readonly discountsService: DiscountsService,
		@Inject(forwardRef(() => CouponsService))
		private readonly couponsService: CouponsService,
	) {}

	getItems(): Cart {
		return this.cart;
	}

	addItem(addCartItemDto: AddCartItemDto): Cart {
		const productId = addCartItemDto['productId'] ?? addCartItemDto.productId;
		const { quantity } = addCartItemDto;

		if (!productId) {
			throw new BadRequestException('product-id is required');
		}

		if (addCartItemDto.couponCode) {
			this.cart.coupon = this.validateCoupon(addCartItemDto.couponCode);
		}

		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new BadRequestException('quantity must be a positive integer');
		}

		const product = this.productsService.findOne(productId);

		if (!product) {
			throw new NotFoundException(`Product with id ${productId} not found`);
		}

		const existingItem = this.cart.items.find(
			(item) => item.product.id === productId,
		);
		const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;

		if (requestedQuantity > product.stock) {
			throw new BadRequestException(
				`Only ${product.stock} units of product ${productId} are available`,
			);
		}

		if (existingItem) {
			existingItem.quantity = requestedQuantity;
			existingItem.subtotal = product.price * requestedQuantity;
			existingItem.discount = this.getTechDiscount(existingItem);
			existingItem.total = existingItem.subtotal - existingItem.discount;
		} else {
			const cartItem: CartItem = {
				product,
				quantity,
				subtotal: product.price * quantity,
				discount: 0,
				total: product.price * quantity,
			};
			cartItem.discount = this.getTechDiscount(cartItem);
			cartItem.total = cartItem.subtotal - cartItem.discount;
			this.cart.items.push(cartItem);
		}

		const discountResult = this.discountsService.calculate(
			this.cart.items,
			this.cart.coupon,
		);
		this.updateItemTotals();
		this.cart.subtotal = discountResult.originalAmount;
		this.cart.discount = discountResult.discountAmount;
		this.cart.total = discountResult.finalAmount;
		this.cart.appliedDiscounts = discountResult.appliedDiscounts;

		return this.cart;
	}

	applyCoupon(code: string): Cart {
		this.cart.coupon = this.validateCoupon(code);
		this.updateDiscounts();

		return this.cart;
	}

	private validateCoupon(code: string) {
		const coupon = this.couponsService.findByCode(code);

		if (!coupon) {
			throw new NotFoundException(`Coupon ${code} is not available`);
		}

		return coupon;
	}

	private updateDiscounts(): void {
		const discountResult = this.discountsService.calculate(
			this.cart.items,
			this.cart.coupon,
		);
		this.updateItemTotals();
		this.cart.subtotal = discountResult.originalAmount;
		this.cart.discount = discountResult.discountAmount;
		this.cart.total = discountResult.finalAmount;
		this.cart.appliedDiscounts = discountResult.appliedDiscounts;
	}

	private getTechDiscount(item: CartItem): number {
		return item.product.type === 'TECH'
			? Math.round(item.subtotal * 0.1 * 100) / 100
			: 0;
	}

	private updateItemTotals(): void {
		for (const item of this.cart.items) {
			item.discount = this.getTechDiscount(item);
			item.total = item.subtotal - item.discount;
		}
	}
}
