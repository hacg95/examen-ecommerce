import { Injectable } from '@nestjs/common';
import { Product } from './models/product.model';
import { ProductType } from './enums/product-type.enum';
import productsData from './data/products.json';

@Injectable()
export class ProductsService {
	private readonly products: Product[] = productsData.map((product) => ({
    ...product,
    type: product.type as ProductType,
  }));

	findAll(): Product[] {
		return this.products;
	}

	findOne(id: string): Product | undefined {
		return this.products.find((product) => product.id === id);
	}

	decreaseStock(id: string, quantity: number): void {
		const product = this.findOne(id);

		if (product) {
			product.stock -= quantity;
		}
	}

	increaseStock(id: string, quantity: number): void {
		const product = this.findOne(id);

		if (product) {
			product.stock += quantity;
		}
	}
}
