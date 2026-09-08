import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';

@Module({
  providers: [DiscountsService]
})
export class DiscountsModule {}
