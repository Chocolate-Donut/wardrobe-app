import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  //аватар
  async updateAvatar(userId: number, filePath: string) {
    console.log(`Updating avatar for user ${userId}: ${filePath}`); // Лог для отладки
    await this.userRepository.update(userId, { avatar: filePath });
  }

  //получение данных профиля
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'avatar', 'city', 'isPrivate'], // Отдаем только нужные поля
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

}
