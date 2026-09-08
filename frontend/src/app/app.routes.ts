import { Routes } from '@angular/router';
import { ProductList } from './features/products/product-list/product-list';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'products' },
	{ path: 'products', component: ProductList },
	{ path: '**', redirectTo: 'products' },
];
