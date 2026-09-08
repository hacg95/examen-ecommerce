import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddCartItemDto } from './dto/add-cart-item.dto';
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
}
