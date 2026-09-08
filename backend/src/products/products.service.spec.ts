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
});
