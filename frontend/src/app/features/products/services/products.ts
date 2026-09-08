import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class Products {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = 'http://localhost:3000/api/products';

	getAll(): Observable<Product[]> {
		return this.http.get<Product[]>(this.apiUrl);
	}
}
