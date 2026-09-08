import { forwardRef, Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [forwardRef(() => CartModule)],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
