import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CartService } from '../cart/cart.service';

describe('CouponsController', () => {
  let controller: CouponsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [
        { provide: CouponsService, useValue: {} },
        { provide: CartService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
