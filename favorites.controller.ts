import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async addToFavorites(@GetUser() user: User, @Param('id') outfitId: number) {
    if (!user.id) {
      throw new Error('❌ Ошибка: user.id не найден! Проверь JWT токен.');
    }
    console.log('✅ Добавление в избранное | Пользователь:', user.id, '| Образ:', outfitId);
    return this.favoritesService.addToFavorites(user.id, outfitId);
  }

  // Удаление из избранного
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeFromFavorites(@GetUser() user: User, @Param('id') outfitId: number) {
    return this.favoritesService.removeFromFavorites(user.id, outfitId);
  }

  // Показать все избранные образы
  @UseGuards(JwtAuthGuard)
  @Get('my-favorites')
  async getUserFavorites(@GetUser() user: User) {
    return this.favoritesService.getUserFavorites(user.id);
  }
}
