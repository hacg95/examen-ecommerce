import { forwardRef, Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductsModule } from '../products/products.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    ProductsModule,
    DiscountsModule,
    forwardRef(() => CouponsModule),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
