/* import { Module } from '@nestjs/common';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';

@Module({
  controllers: [WardrobeController],
  providers: [WardrobeService]
})
export class WardrobeModule {}
 */
import { Module } from '@nestjs/common';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutfitsModule } from '../outfits/outfits.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), OutfitsModule],
  controllers: [WardrobeController],
  providers: [WardrobeService],
})
export class WardrobeModule {}
