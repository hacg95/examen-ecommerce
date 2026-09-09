import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { DiscountsService } from '../discounts/discounts.service';
import { CouponsService } from '../coupons/coupons.service';

describe('CartService', () => {
  let service: CartService;
  const testProduct = {
    id: 'prod-001',
    name: 'Test product',
    description: 'Test product',
    price: 10,
    currency: 'USD',
    type: 'TECH',
    stock: 10,
    imageUrl: 'test-image',
  };

  beforeEach(async () => {
    testProduct.stock = 10;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn((id: string) =>
              id === 'prod-001' ? testProduct : undefined,
            ),
            decreaseStock: jest.fn((id: string, quantity: number) => {
              if (id === 'prod-001') testProduct.stock -= quantity;
            }),
            increaseStock: jest.fn((id: string, quantity: number) => {
              if (id === 'prod-001') testProduct.stock += quantity;
            }),
          },
        },
        DiscountsService,
        {
          provide: CouponsService,
          useValue: {
            findByCode: jest.fn((code: string) =>
              code === 'WELCOME2026'
                ? { code, valid: true, discount: 15 }
                : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all items previously added to the cart', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 5 });

    const cart = service.getItems();

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].product.id).toBe('prod-001');
    expect(cart.items[0].quantity).toBe(5);
    expect(cart.items[0].availableStock).toBe(5);
    expect(cart.items[0].subtotal).toBe(50);
    expect(cart.items[0].discount).toBe(5);
    expect(cart.items[0].discountPercentage).toBe(10);
    expect(cart.items[0].total).toBe(45);
  });

  it('creates an item and calculates the cart subtotal', () => {
    const cart = service.addItem({ 'productId': 'prod-001', quantity: 5 });

    expect(cart.items[0].quantity).toBe(5);
    expect(cart.items[0].availableStock).toBe(5);
    expect(cart.items[0].subtotal).toBe(50);
    expect(cart.items[0].discount).toBe(5);
    expect(cart.items[0].discountPercentage).toBe(10);
    expect(cart.items[0].total).toBe(45);
    expect(cart.subtotal).toBe(50);
    expect(cart.discount).toBe(5);
    expect(cart.discountPercentage).toBe(10);
    expect(cart.total).toBe(45);
    expect(cart.appliedDiscounts).toHaveLength(0);
  });

  it('adds repeated quantities to the existing cart item', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 5 });

    const cart = service.addItem({ 'productId': 'prod-001', quantity: 2 });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(7);
    expect(cart.items[0].availableStock).toBe(3);
    expect(cart.items[0].discount).toBe(7);
    expect(cart.items[0].discountPercentage).toBe(10);
    expect(cart.items[0].total).toBe(63);
    expect(cart.subtotal).toBe(70);
    expect(cart.discount).toBe(7);
    expect(cart.discountPercentage).toBe(10);
    expect(cart.total).toBe(63);
  });

  it('applies a valid coupon and recalculates the cart total', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 5 });

    const cart = service.applyCoupon('WELCOME2026');

    expect(cart.coupon).toEqual({
      code: 'WELCOME2026',
      valid: true,
      discount: 15,
    });
    expect(cart.discount).toBe(11.75);
    expect(cart.discountPercentage).toBe(23.5);
    expect(cart.discountPercentage).toBeLessThanOrEqual(35);
    expect(cart.discountLimitReached).toBe(false);
    expect(cart.total).toBe(38.25);
    expect(cart.items[0].discount).toBe(5);
    expect(cart.items[0].availableStock).toBe(5);
    expect(cart.items[0].discountPercentage).toBe(10);
    expect(cart.items[0].total).toBe(45);
    expect(cart.appliedDiscounts).toHaveLength(1);
    expect(cart.appliedDiscounts[0].type).toBe('COUPON');
  });

  it('rejects an invalid coupon', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 1 });

    expect(() => service.applyCoupon('INVALID')).toThrow(
      'Coupon INVALID is not available',
    );
  });

  it('rejects applying the same coupon twice', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 1 });
    service.applyCoupon('WELCOME2026');

    expect(() => service.applyCoupon('WELCOME2026')).toThrow(
      'Coupon WELCOME2026 is already in use',
    );
  });

  it('rejects a duplicate coupon in an item request', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 1 });
    service.applyCoupon('WELCOME2026');

    expect(() =>
      service.addItem({
        'productId': 'prod-001',
        quantity: 1,
        couponCode: 'WELCOME2026',
      }),
    ).toThrow('Coupon WELCOME2026 is already in use');
  });

  it('rejects applying a coupon when the cart is empty', () => {
    expect(() => service.applyCoupon('WELCOME2026')).toThrow(
      'Cannot apply a coupon to an empty cart',
    );
    expect(service.getItems().coupon).toBeUndefined();
  });

  it('rejects an unknown product', () => {
    expect(() =>
      service.addItem({ 'productId': 'missing-id', quantity: 1 }),
    ).toThrow('Product with id missing-id not found');
  });

  it('removes part of a cart item and recalculates stock and totals', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 8 });

    const cart = service.removeItem('prod-001', 3);

    expect(cart.items[0].quantity).toBe(5);
    expect(cart.items[0].availableStock).toBe(5);
    expect(cart.items[0].subtotal).toBe(50);
    expect(cart.items[0].total).toBe(45);
    expect(cart.subtotal).toBe(50);
    expect(cart.total).toBe(45);
  });

  it('removes a complete cart item when quantity is omitted', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 2 });

    const cart = service.removeItem('prod-001');

    expect(cart.items).toHaveLength(0);
    expect(cart.subtotal).toBe(0);
    expect(cart.total).toBe(0);
    expect(cart.discountPercentage).toBe(0);
    expect(cart.discountLimitReached).toBe(false);
  });

  it('rejects removing more units than are in the cart', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 2 });

    expect(() => service.removeItem('prod-001', 3)).toThrow(
      'Cannot remove 3 units of product prod-001; only 2 are in the cart',
    );
  });

  it('rejects cumulative quantities above the product stock', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 8 });

    expect(() =>
      service.addItem({ 'productId': 'prod-001', quantity: 3 }),
    ).toThrow('Only 2 more units of product prod-001 are available');

    expect(service.getItems().items[0].quantity).toBe(8);
  });

  it('rejects a quantity above available stock', () => {
    expect(() =>
      service.addItem({ 'productId': 'prod-001', quantity: 11 }),
    ).toThrow('Only 10 more units of product prod-001 are available');
  });

  it('removes an applied coupon and recalculates the cart', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 5 });
    service.applyCoupon('WELCOME2026');

    const cart = service.removeCoupon('WELCOME2026');

    expect(cart.coupon).toBeUndefined();
    expect(cart.discount).toBe(5);
    expect(cart.total).toBe(45);
    expect(cart.appliedDiscounts).toHaveLength(0);
  });

  it('rejects removing a different coupon code', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 5 });
    service.applyCoupon('WELCOME2026');

    expect(() => service.removeCoupon('OTHER2026')).toThrow(
      'Coupon OTHER2026 is not applied to the cart',
    );
  });
});
