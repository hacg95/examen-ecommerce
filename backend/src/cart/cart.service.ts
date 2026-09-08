import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { DiscountsService } from '../discounts/discounts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { Cart } from './models/cart.model';
import { CartItem } from './models/cart-item.model';

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
		const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;

		if (requestedQuantity > product.stock) {
			throw new BadRequestException(
				`Only ${product.stock} units of product ${productId} are available`,
			);
		}

		if (existingItem) {
			existingItem.quantity = requestedQuantity;
			existingItem.subtotal = product.price * requestedQuantity;
		} else {
			const cartItem: CartItem = {
				product,
				quantity,
				subtotal: product.price * quantity,
			};
			this.cart.items.push(cartItem);
		}

		const discountResult = this.discountsService.calculate(
			this.cart.items,
			addCartItemDto.couponCode,
		);
		this.cart.subtotal = discountResult.originalAmount;
		this.cart.discount = discountResult.discountAmount;
		this.cart.total = discountResult.finalAmount;
		this.cart.appliedDiscounts = discountResult.appliedDiscounts;

		return this.cart;
	}
}
