import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';

describe('CouponsService', () => {
  let service: CouponsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponsService],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns available coupons from the data source', () => {
    expect(service.findAll()).toEqual([
      { code: 'WELCOME2026', valid: true, discount: 15 },
      { code: 'EXTRADISCOUNT2026', valid: true, discount: 30 },
    ]);
  });

  it('validates an available coupon code', () => {
    expect(service.findByCode('WELCOME2026')).toEqual({
      code: 'WELCOME2026',
      valid: true,
      discount: 15,
    });
    expect(service.findByCode('INVALID')).toBeUndefined();
  });
});
