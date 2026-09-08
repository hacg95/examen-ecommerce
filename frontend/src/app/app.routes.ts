import { Routes } from '@angular/router';
import { ProductList } from './features/products/product-list/product-list';
import { ProductDetail } from './features/products/product-detail/product-detail';
import { Cart } from './features/cart/cart/cart';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'products' },
	{ path: 'products', component: ProductList },
	{ path: 'product/:id', component: ProductDetail },
	{ path: 'cart', component: Cart },
	{ path: '**', redirectTo: 'products' },
];
