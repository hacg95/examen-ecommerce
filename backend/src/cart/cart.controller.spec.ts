import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let controller: CartController;
  let cartService: {
    addItem: jest.Mock;
    getItems: jest.Mock;
    removeItem: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            addItem: jest.fn(),
            getItems: jest.fn(),
            removeItem: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('adds an item from the request body', () => {
    const cart = { subtotal: 4999.95 };
    cartService.addItem.mockReturnValue(cart);

    const body = { 'productId': 'prod-001', quantity: 5 };

    expect(controller.addItem(body)).toBe(cart);
    expect(cartService.addItem).toHaveBeenCalledWith(body);
  });

  it('gets all cart items', () => {
    const items = [{ quantity: 5, subtotal: 50 }];
    cartService.getItems.mockReturnValue(items);

    expect(controller.getItems()).toBe(items);
    expect(cartService.getItems).toHaveBeenCalled();
  });

  it('removes the whole item when quantity is omitted', () => {
    const cart = { items: [] };
    cartService.removeItem.mockReturnValue(cart);

    expect(controller.removeItem('prod-001')).toBe(cart);
    expect(cartService.removeItem).toHaveBeenCalledWith('prod-001', undefined);
  });
});
