import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	findAll() {
		return this.productsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		const product = this.productsService.findOne(id);

		if (!product) {
			throw new NotFoundException(`Product with id ${id} not found`);
		}

		return product;
	}
}
