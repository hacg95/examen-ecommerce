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
      item(ProductType.TECH, 50),
    ]);

    expect(result.techDiscountAmount).toBe(5);
    expect(result.discountAmount).toBe(5);
    expect(result.finalAmount).toBe(45);
    expect(result.appliedDiscounts).toHaveLength(0);
  });

  it('applies the threshold after TECH discounts', () => {
    const result = service.calculate([
      item(ProductType.TECH, 120),
    ]);

    expect(result.techDiscountAmount).toBe(12);
    expect(result.appliedDiscounts).toHaveLength(1);
    expect(result.appliedDiscounts[0].type).toBe('ORDER_THRESHOLD');
    expect(result.appliedDiscounts[0].amount).toBe(5.4);
    expect(result.discountAmount).toBe(17.4);
    expect(result.finalAmount).toBe(102.6);
  });

  it('applies the valid WELCOME2026 coupon', () => {
    const result = service.calculate(
      [item(ProductType.OTHER, 100)],
      { code: 'WELCOME2026', valid: true, discount: 15 },
    );

    expect(result.discountAmount).toBe(15);
    expect(result.finalAmount).toBe(85);
    expect(result.appliedDiscounts[0].type).toBe('COUPON');
  });

  it('does not apply an invalid coupon', () => {
    const result = service.calculate(
      [item(ProductType.OTHER, 100)],
      { code: 'INVALID', valid: false, discount: 0 },
    );

    expect(result.discountAmount).toBe(0);
    expect(result.appliedDiscounts).toHaveLength(0);
  });

  it('caps the total discount at 35 percent', () => {
    const result = service.calculate(
      [item(ProductType.TECH, 1000)],
      { code: 'WELCOME2026', valid: true, discount: 15 },
    );

    expect(result.discountAmount).toBe(273.25);
    expect(result.finalAmount).toBe(726.75);
    expect(
      result.appliedDiscounts.reduce((total, discount) => total + discount.amount, 0),
    ).toBe(173.25);
  });

  function item(type: ProductType, subtotal: number) {
    return {
      product: product(type, subtotal),
      quantity: 1,
      subtotal,
      discount: 0,
      discountPercentage: 0,
      total: subtotal,
    };
  }

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
