import { Controller, Get, Query, UseGuards} from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    // Получить первые 20 образов (без авторизации)
    @Get('public')
    getPublicOutfits() {
      return this.feedService.getPublicOutfits();
    }

    //получить отфильтрованные образы
    @Get()
    async getFilteredOutfits(
        @Query('season') season?: string,
        @Query('tags') tags?: string,
        @Query('trend') trend?: string,
    ) {
        console.log('🔥🔥🔥 Контроллер вызван!'); // ТЕСТОВЫЙ ЛОГ
        console.log('🔥 Контроллер получил параметры:', { season, tags, trend }); // ЛОГ ДЛЯ ПРОВЕРКИ

        return this.feedService.getFilteredOutfits(season, tags, trend);
    }

    //Поиск
    @UseGuards(JwtAuthGuard)
    @Get('search')
    async searchOutfits(@Query('query') query: string) {
    console.log(`🔥 Запрос на поиск: ${query}`);
    return this.feedService.searchOutfits(query);
    }
    // Эндпоинт для поиска образов по цветам
    @UseGuards(JwtAuthGuard)
    @Get('search-by-color')
    async searchByColor(@Query('palette') palette: string) {
    let parsedPalette: string[];

    try {
        // Пробуем парсить строку, если она передана как строка JSON
        parsedPalette = JSON.parse(palette);
    } catch (error) {
        throw new Error('Невозможно распарсить палитру. Убедитесь, что передаете массив.');
    }

    // Проверка на то, что это действительно массив
    if (!Array.isArray(parsedPalette)) {
        throw new Error('Палитра должна быть массивом');
    }

    if (parsedPalette.length === 0) {
        throw new Error('Палитра цветов не может быть пустой!');
    }

    return this.feedService.searchByColor(parsedPalette);
    }

    // Рекомендации по погоде
    @Get('recommended')
    async getRecommendedOutfits(@Query('city') city?: string) {
        return this.feedService.getRecommendedOutfits(city);
    }

}