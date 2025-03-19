import { Controller, Post, Get, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';




@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
    console.log("Received data:", createUserDto); // Проверяем, что приходит в тело запроса
    return this.usersService.create(createUserDto);
}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
