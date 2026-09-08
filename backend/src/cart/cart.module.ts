import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductsModule } from '../products/products.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [ProductsModule, DiscountsModule],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
