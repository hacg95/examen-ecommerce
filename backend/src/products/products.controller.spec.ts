import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all products', () => {
    expect(controller.findAll()).toEqual([]);
  });

  it('throws when a product does not exist', () => {
    expect(() => controller.findOne('missing-id')).toThrow(
      'Product with id missing-id not found',
    );
  });
});
