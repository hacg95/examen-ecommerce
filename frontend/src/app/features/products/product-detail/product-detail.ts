import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { Products } from '../services/products';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-product-detail',
  styleUrl: './product-detail.css',
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly productsService = inject(Products);
  private readonly route = inject(ActivatedRoute);
  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('This product could not be found.');
      this.loading.set(false);
      return;
    }

    this.productsService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This product could not be found.');
        this.loading.set(false);
      },
    });
  }
}
