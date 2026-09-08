import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cart as CartModel } from '../../../shared/models/cart.model';
import { CartItem } from '../../../shared/models/cart-item.model';
import { CartService } from '../services/cart';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  private readonly cartService = inject(CartService);
  protected readonly cart = signal<CartModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly couponCode = signal('');
  protected readonly couponError = signal('');
  protected readonly itemErrors = signal<Record<string, string>>({});

  constructor() {
    this.loadCart();
  }

  protected updateCouponCode(value: string): void {
    this.couponCode.set(value);
    this.couponError.set('');
  }

  protected applyCoupon(): void {
    const code = this.couponCode().trim();

    if (!code) {
      this.couponError.set('Enter a coupon code.');
      return;
    }

    this.couponError.set('');
    this.cartService.applyCoupon(code).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.couponCode.set('');
      },
      error: (error: HttpErrorResponse) => {
        this.couponError.set(this.getErrorMessage(error, 'Unable to apply coupon.'));
      },
    });
  }

  protected removeItem(item: CartItem): void {
    this.itemErrors.update((errors) => ({ ...errors, [item.product.id]: '' }));
    this.cartService.removeItem(item.product.id).subscribe({
      next: (cart) => this.cart.set(cart),
      error: (error: HttpErrorResponse) => {
        this.itemErrors.update((errors) => ({
          ...errors,
          [item.product.id]: this.getErrorMessage(error, 'Unable to remove product.'),
        }));
      },
    });
  }

  protected itemError(productId: string): string {
    return this.itemErrors()[productId] ?? '';
  }

  private loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.getErrorMessage(error, 'Unable to load your cart.'));
        this.loading.set(false);
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    return error.error?.message ?? fallback;
  }
}
