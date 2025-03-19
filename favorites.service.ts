/* import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outfit } from '../outfits/outfit.entity/outfit.entity';
import { User } from '../users/user.entity';
import { Favorite } from '../outfits/favorite.entity';


@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Outfit)
        private outfitsRepository: Repository<Outfit>,
    
        @InjectRepository(Favorite)
        private readonly favoritesRepository: Repository<Favorite>,
      ) {}
      // Добавить образ в избранное (позже добавим логику)
  async addToFavorites(user: User, outfitId: number): Promise<void> {
    const outfit = await this.outfitsRepository.findOne({ where: { id: outfitId } });
    if (!outfit) throw new Error('Outfit not found');
  
    // Проверяем, есть ли уже этот outfit в избранном у пользователя
    const alreadyFavorited = await this.favoritesRepository.findOne({
      where: { user: { id: user.id }, outfit: { id: outfitId } },
    });
  
    if (alreadyFavorited) {
      throw new Error('Outfit already in favorites');
    }
  
    // Создаем новую запись избранного с userId
    const favorite = this.favoritesRepository.create({
      user: user, // 👈 Здесь теперь передается user
      outfit: outfit,
    });
  
    await this.favoritesRepository.save(favorite);
  
    outfit.favoritesCount += 1;
    await this.outfitsRepository.save(outfit);

    // Увеличиваем рейтинг (количество избранных)
    outfit.rating += 1;
    await this.outfitsRepository.save(outfit);
  }
  
  //удалить из изб

  async removeFromFavorites(user: User, outfitId: number): Promise<void> {
    const outfit = await this.outfitsRepository.findOne({ where: { id: outfitId } });

    if (!outfit) {
        throw new NotFoundException('❌ Образ не найден!');
    }

    const favorite = await this.favoritesRepository.findOne({ 
        where: { user: { id: user.id }, outfit: { id: outfitId } } 
    });

    if (!favorite) {
        throw new NotFoundException('❌ Этот образ не в избранном!');
    }

    await this.favoritesRepository.delete({ user: { id: user.id }, outfit: { id: outfitId } });

    // Уменьшаем количество добавлений в избранное
    outfit.favoritesCount = Math.max(0, outfit.favoritesCount - 1);

    // Уменьшаем рейтинг (но не ниже 0)
    outfit.rating = Math.max(0, outfit.rating - 1);
    
    await this.outfitsRepository.save(outfit);
}

  //показать все изб образы
  async getUserFavorites(user: User): Promise<Outfit[]> {
    const favorites = await this.favoritesRepository.find({ where: { user: { id: user.id } }, relations: ['outfit'] });
    return favorites.map(fav => fav.outfit);
  }
}

 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../outfits/favorite.entity';
//import { Outfit } from '../outfits/outfit.entity.outfit';
import { User } from '../users/user.entity';
import { Outfit } from '../outfits/outfit.entity/outfit.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Outfit)
    private readonly outfitRepository: Repository<Outfit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addToFavorites(userId: number, outfitId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const outfit = await this.outfitRepository.findOne({ where: { id: outfitId } });
    if (!outfit) {
      throw new NotFoundException('Образ не найден');
    }

    const exists = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, outfit: { id: outfitId } },
    });

    if (exists) {
      throw new Error('Этот образ уже в избранном!');
    }

    const favorite = this.favoriteRepository.create({ user, outfit });
    return this.favoriteRepository.save(favorite);
  }

  async removeFromFavorites(userId: number, outfitId: number) {
    const result = await this.favoriteRepository.delete({
      user: { id: userId },
      outfit: { id: outfitId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Образ не найден в избранном');
    }

    return { message: 'Образ удалён из избранного' };
  }

  async getUserFavorites(userId: number) {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['outfit'],
      select: ['id', 'outfit'],
    });
  }
}

