import { Component, computed, inject, signal } from '@angular/core';
import { ProductType } from '../../../shared/enums/product-type.enum';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Product } from '../../../shared/models/product.model';
import { Products } from '../services/products';

@Component({
  imports: [ProductCard],
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly productsService = inject(Products);
  protected readonly products = signal<Product[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly activeType = signal<'ALL' | ProductType>('ALL');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly productTypes = Object.values(ProductType);
  protected readonly filteredProducts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const type = this.activeType();

    return this.products().filter((product) => {
      const matchesType = type === 'ALL' || product.type === type;
      const matchesSearch = !query || `${product.name} ${product.description}`.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  });

  constructor() {
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load the catalog. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected setSearchTerm(value: string): void { this.searchTerm.set(value); }
  protected setType(type: 'ALL' | ProductType): void { this.activeType.set(type); }
}
