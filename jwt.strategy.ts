import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'SECRET_KEY',
    });
  }

  /*async validate(payload: any) {
    console.log('🔥 Payload:', payload);
    return { id: payload.sub, email: payload.email }; // Изменяем sub → id
  }*/

  async validate(payload: any) {
    console.log('🔥 Payload:', payload); // Логируем payload
    return { id: payload.sub, email: payload.email }; // ✅ Теперь передаем id
  }
  

}
