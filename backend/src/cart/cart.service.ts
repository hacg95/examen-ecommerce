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
		discountPercentage: 0,
		discountLimitReached: false,
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
		const currentQuantity = existingItem?.quantity ?? 0;
		const availableStock = product.stock - currentQuantity;

		if (quantity > availableStock) {
			throw new BadRequestException(
				`Only ${availableStock} more units of product ${productId} are available`,
			);
		}

		if (addCartItemDto.couponCode) {
			this.ensureCouponIsNotAlreadyApplied(addCartItemDto.couponCode);
			this.cart.coupon = this.validateCoupon(addCartItemDto.couponCode);
		}

		const requestedQuantity = currentQuantity + quantity;

		if (existingItem) {
			existingItem.quantity = requestedQuantity;
			existingItem.subtotal = product.price * requestedQuantity;
			existingItem.discount = this.getTechDiscount(existingItem);
			existingItem.total = existingItem.subtotal - existingItem.discount;
		} else {
			const cartItem: CartItem = {
				product,
				quantity,
				availableStock: product.stock - quantity,
				subtotal: product.price * quantity,
				discount: 0,
				discountPercentage: 0,
				total: product.price * quantity,
			};
			cartItem.discount = this.getTechDiscount(cartItem);
			cartItem.total = cartItem.subtotal - cartItem.discount;
			this.cart.items.push(cartItem);
		}

		this.updateDiscounts();

		return this.cart;
	}

	removeItem(productId: string, quantity?: number): Cart {
		const itemIndex = this.cart.items.findIndex(
			(item) => item.product.id === productId,
		);

		if (itemIndex === -1) {
			throw new NotFoundException(
				`Product with id ${productId} is not in the cart`,
			);
		}

		const item = this.cart.items[itemIndex];
		const quantityToRemove = quantity ?? item.quantity;

		if (!Number.isInteger(quantityToRemove) || quantityToRemove <= 0) {
			throw new BadRequestException(
				'quantity must be a positive integer',
			);
		}

		if (quantityToRemove > item.quantity) {
			throw new BadRequestException(
				`Cannot remove ${quantityToRemove} units of product ${productId}; only ${item.quantity} are in the cart`,
			);
		}

		if (quantityToRemove === item.quantity) {
			this.cart.items.splice(itemIndex, 1);
		} else {
			item.quantity -= quantityToRemove;
			item.subtotal = item.product.price * item.quantity;
		}

		if (this.cart.items.length === 0) {
			this.cart.coupon = undefined;
		}

		this.updateDiscounts();

		return this.cart;
	}

	applyCoupon(code: string): Cart {
		if (this.cart.items.length === 0) {
			throw new BadRequestException(
				'Cannot apply a coupon to an empty cart',
			);
		}

		this.ensureCouponIsNotAlreadyApplied(code);
		this.cart.coupon = this.validateCoupon(code);
		this.updateDiscounts();

		return this.cart;
	}

	removeCoupon(code: string): Cart {
		if (!this.cart.coupon) {
			throw new BadRequestException('There is no coupon applied to the cart');
		}

		if (this.cart.coupon.code !== code) {
			throw new BadRequestException(
				`Coupon ${code} is not applied to the cart`,
			);
		}

		this.cart.coupon = undefined;
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

	private ensureCouponIsNotAlreadyApplied(code: string): void {
		if (this.cart.coupon?.code === code) {
			throw new BadRequestException(`Coupon ${code} is already in use`);
		}
	}

	private updateDiscounts(): void {
		const discountResult = this.discountsService.calculate(
			this.cart.items,
			this.cart.coupon,
		);
		this.updateItemTotals();
		this.cart.subtotal = discountResult.originalAmount;
		this.cart.discount = discountResult.discountAmount;
		this.cart.discountPercentage = this.getDiscountPercentage(
			this.cart.discount,
			this.cart.subtotal,
		);
		this.cart.discountLimitReached = this.cart.discountPercentage >= 35;
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
			item.availableStock = Math.max(0, item.product.stock - item.quantity);
			item.discount = this.getTechDiscount(item);
			item.discountPercentage = this.getDiscountPercentage(
				item.discount,
				item.subtotal,
			);
			item.total = item.subtotal - item.discount;
		}
	}

	private getDiscountPercentage(discount: number, subtotal: number): number {
		if (subtotal === 0) {
			return 0;
		}

		return Math.round((discount / subtotal) * 10000) / 100;
	}
}
