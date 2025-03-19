import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.entity';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('👤 Пользователь в GetUser:', request.user); // ✅ Логируем пользователя
    return request.user;
  },
);
