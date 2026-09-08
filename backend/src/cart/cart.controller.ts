import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';
import { CartService } from './cart.service';

@Controller('api/cart')
export class CartController {
	constructor(private readonly cartService: CartService) {}

	@Get('items')
	getItems() {
		return this.cartService.getItems();
	}

	@Post('items')
	addItem(@Body() addCartItemDto: AddCartItemDto) {
		return this.cartService.addItem(addCartItemDto);
	}

	@Delete('items/:productId')
	removeItem(
		@Param('productId') productId: string,
		@Body() removeCartItemDto: RemoveCartItemDto = {},
	) {
		return this.cartService.removeItem(productId, removeCartItemDto.quantity);
	}
}
