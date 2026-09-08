export class AddCartItemDto {
  productId!: string;
  quantity!: number;
  couponCode?: string;
}