/* import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService]
})
export class FavoritesModule {} */

import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../outfits/favorite.entity';
import { OutfitsModule } from '../outfits/outfits.module';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module'; // Добавляем импорт
import { ConfigModule } from '@nestjs/config'; // ✅ Добавляем ConfigModule

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User]), OutfitsModule, AuthModule, ConfigModule, ],// ✅ Импортируем `AuthModule`, чтобы `JwtService` работал
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}

