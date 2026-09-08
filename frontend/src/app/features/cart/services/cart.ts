import { computed, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cart } from '../../../shared/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = 'http://localhost:3000/api';
	readonly cart = signal<Cart | null>(null);
	readonly productCount = computed(() => this.cart()?.items.length ?? 0);

	getCart(): Observable<Cart> {
		return this.http.get<Cart>(`${this.apiUrl}/cart/items`).pipe(
			tap((cart) => this.cart.set(cart)),
		);
	}

	addItem(productId: string, quantity: number): Observable<Cart> {
		return this.http
			.post<Cart>(`${this.apiUrl}/cart/items`, { productId, quantity })
			.pipe(tap((cart) => this.cart.set(cart)));
	}

	applyCoupon(code: string): Observable<Cart> {
		return this.http.post<Cart>(`${this.apiUrl}/coupons`, { code }).pipe(
			tap((cart) => this.cart.set(cart)),
		);
	}

	removeCoupon(code: string): Observable<Cart> {
		return this.http
			.delete<Cart>(`${this.apiUrl}/coupons/${encodeURIComponent(code)}`)
			.pipe(tap((cart) => this.cart.set(cart)));
	}

	removeItem(productId: string): Observable<Cart> {
		return this.http.delete<Cart>(
			`${this.apiUrl}/cart/items/${encodeURIComponent(productId)}`,
		).pipe(tap((cart) => this.cart.set(cart)));
	}
}
