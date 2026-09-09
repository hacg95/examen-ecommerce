import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all products', () => {
    expect(service.findAll()).toHaveLength(5);
  });

  it('returns undefined for an unknown product id', () => {
    expect(service.findOne('missing-id')).toBeUndefined();
  });

  it('decreases and restores product stock', () => {
    const product = service.findOne('prod-001');
    const originalStock = product?.stock ?? 0;

    service.decreaseStock('prod-001', 2);
    expect(service.findOne('prod-001')?.stock).toBe(originalStock - 2);

    service.increaseStock('prod-001', 2);
    expect(service.findOne('prod-001')?.stock).toBe(originalStock);
  });
});
