import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../../../shared/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = 'http://localhost:3000/api';

	getCart(): Observable<Cart> {
		return this.http.get<Cart>(`${this.apiUrl}/cart/items`);
	}

	applyCoupon(code: string): Observable<Cart> {
		return this.http.post<Cart>(`${this.apiUrl}/coupons`, { code });
	}

	removeItem(productId: string): Observable<Cart> {
		return this.http.delete<Cart>(
			`${this.apiUrl}/cart/items/${encodeURIComponent(productId)}`,
		);
	}
}
