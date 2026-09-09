import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product.model';
import { Products } from '../services/products';
import { CartService } from '../../cart/services/cart';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-product-detail',
  styleUrl: './product-detail.css',
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly productsService = inject(Products);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly quantity = signal(1);
  protected readonly adding = signal(false);
  protected readonly addError = signal('');
  protected readonly addSuccess = signal('');

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

  protected setQuantity(value: string): void {
    const selectedProduct = this.product();
    const parsedQuantity = Number(value);

    if (!selectedProduct || !Number.isFinite(parsedQuantity)) {
      return;
    }

    this.quantity.set(
      Math.min(selectedProduct.stock, Math.max(1, Math.floor(parsedQuantity))),
    );
  }

  protected decreaseQuantity(): void {
    this.quantity.update((quantity) => Math.max(1, quantity - 1));
  }

  protected increaseQuantity(): void {
    const selectedProduct = this.product();

    if (selectedProduct) {
      this.quantity.update((quantity) =>
        Math.min(selectedProduct.stock, quantity + 1),
      );
    }
  }

  protected addToCart(): void {
    const selectedProduct = this.product();

    if (!selectedProduct || this.adding()) {
      return;
    }

    this.adding.set(true);
    this.addError.set('');
    this.addSuccess.set('');
    this.cartService.addItem(selectedProduct.id, this.quantity()).subscribe({
      next: () => {
        this.adding.set(false);
        this.router.navigate(['/cart']);
      },
      error: (error: { error?: { message?: string } | string }) => {
        this.adding.set(false);
        this.addError.set(
          typeof error.error === 'string'
            ? error.error
            : error.error?.message ?? 'Unable to add this product to the cart.',
        );
      },
    });
  }
}
