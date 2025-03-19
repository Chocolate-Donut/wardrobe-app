import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService], // ✅ Экспортируем, чтобы другие модули могли использовать
})
export class WeatherModule {}
