import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Подключаем сущность User
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Экспортируем UsersService, чтобы использовать в AuthModule
})
export class UsersModule {}
