import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsService } from './discounts.service';
import { ProductType } from '../products/enums/product-type.enum';

describe('DiscountsService', () => {
  let service: DiscountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountsService],
    }).compile();

    service = module.get<DiscountsService>(DiscountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('applies 10 percent to TECH products', () => {
    const result = service.calculate([
      { product: product(ProductType.TECH, 50), quantity: 1, subtotal: 50 },
    ]);

    expect(result.discountAmount).toBe(5);
    expect(result.finalAmount).toBe(45);
    expect(result.appliedDiscounts[0].type).toBe('TECH');
  });

  it('applies the threshold after TECH discounts', () => {
    const result = service.calculate([
      { product: product(ProductType.TECH, 120), quantity: 1, subtotal: 120 },
    ]);

    expect(result.appliedDiscounts).toHaveLength(2);
    expect(result.appliedDiscounts[0].amount).toBe(12);
    expect(result.appliedDiscounts[1].amount).toBe(5.4);
    expect(result.discountAmount).toBe(17.4);
    expect(result.finalAmount).toBe(102.6);
  });

  it('applies the valid WELCOME2026 coupon', () => {
    const result = service.calculate(
      [{ product: product(ProductType.OTHER, 100), quantity: 1, subtotal: 100 }],
      'WELCOME2026',
    );

    expect(result.discountAmount).toBe(15);
    expect(result.finalAmount).toBe(85);
    expect(result.appliedDiscounts[0].type).toBe('COUPON');
  });

  it('does not apply an invalid coupon', () => {
    const result = service.calculate(
      [{ product: product(ProductType.OTHER, 100), quantity: 1, subtotal: 100 }],
      'INVALID',
    );

    expect(result.discountAmount).toBe(0);
    expect(result.appliedDiscounts).toHaveLength(0);
  });

  it('caps the total discount at 35 percent', () => {
    const result = service.calculate(
      [{ product: product(ProductType.TECH, 1000), quantity: 1, subtotal: 1000 }],
      'WELCOME2026',
    );

    expect(result.discountAmount).toBe(350);
    expect(result.finalAmount).toBe(650);
    expect(
      result.appliedDiscounts.reduce((total, discount) => total + discount.amount, 0),
    ).toBe(350);
  });

  function product(type: ProductType, price: number) {
    return {
      id: 'product-id',
      name: 'Product',
      description: 'Product',
      price,
      currency: 'USD',
      type,
      stock: 10,
      imageUrl: 'image',
    };
  }
});
