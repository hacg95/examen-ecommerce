import { Product } from '../../products/models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  total: number;
}