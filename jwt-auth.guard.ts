import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService // Добавляем ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) return false;

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'SECRET_KEY'; // Берем секрет из .env
      const decoded = this.jwtService.verify(token, { secret }); // Передаем секрет явно
      request.user = decoded;
      return true;
    } catch (error) {
      console.error('❌ Ошибка верификации токена:', error.message);
      return false;
    }
  }
}
