import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CartService } from '../cart/cart.service';

describe('CouponsController', () => {
  let controller: CouponsController;
  let cartService: { removeCoupon: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [
        { provide: CouponsService, useValue: {} },
        {
          provide: CartService,
          useValue: { removeCoupon: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
    cartService = module.get(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('removes the coupon identified by the URL', () => {
    const cart = { coupon: undefined };
    cartService.removeCoupon.mockReturnValue(cart);

    expect(controller.remove('WELCOME2026')).toBe(cart);
    expect(cartService.removeCoupon).toHaveBeenCalledWith('WELCOME2026');
  });
});
