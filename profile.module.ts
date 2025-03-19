import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Подключаем User
  controllers: [ProfileController], // ✅ Добавлен контроллер
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
