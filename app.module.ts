import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OutfitsModule } from './outfits/outfits.module';
import { WeatherModule } from './weather/weather.module';
import { ProfileModule } from './profile/profile.module';
import { FeedModule } from './feed/feed.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CalendarModule } from './calendar/calendar.module';
import { WardrobeModule } from './wardrobe/wardrobe.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'wardrobe.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true, // Показывает SQL-запросы в консоли
    }),
    UsersModule,
    AuthModule,
    OutfitsModule,
    WeatherModule,
    ProfileModule,
    FeedModule,
    FavoritesModule,
    CalendarModule,
    WardrobeModule,  // Подключаем UsersModule
    
  ],
})
export class AppModule {}




