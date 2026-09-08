import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn((id: string) =>
              id === 'prod-001'
                ? {
                    id: 'prod-001',
                    name: 'Test product',
                    description: 'Test product',
                    price: 10,
                    currency: 'USD',
                    type: 'TECH',
                    stock: 10,
                    imageUrl: 'test-image',
                  }
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

    const items = service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('prod-001');
    expect(items[0].quantity).toBe(5);
  });

  it('creates an item and calculates the cart subtotal', () => {
    const cart = service.addItem({ 'productId': 'prod-001', quantity: 5 });

    expect(cart.items[0].quantity).toBe(5);
    expect(cart.items[0].subtotal).toBe(50);
    expect(cart.subtotal).toBe(50);
    expect(cart.total).toBe(50);
  });

  it('adds repeated quantities to the existing cart item', () => {
    service.addItem({ 'productId': 'prod-001', quantity: 5 });

    const cart = service.addItem({ 'productId': 'prod-001', quantity: 2 });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(7);
    expect(cart.subtotal).toBe(70);
  });

  it('rejects an unknown product', () => {
    expect(() =>
      service.addItem({ 'productId': 'missing-id', quantity: 1 }),
    ).toThrow('Product with id missing-id not found');
  });

  it('rejects a quantity above available stock', () => {
    expect(() =>
      service.addItem({ 'productId': 'prod-001', quantity: 11 }),
    ).toThrow('Only 10 units of product prod-001 are available');
  });
});
