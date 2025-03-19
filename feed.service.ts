import { Injectable, Logger  } from '@nestjs/common';
import { Outfit } from '../outfits/outfit.entity/outfit.entity';
import { OutfitsService } from '../outfits/outfits.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class FeedService {
    private readonly logger = new Logger(FeedService.name);
    constructor(
        private readonly outfitsService: OutfitsService,
        private readonly weatherService: WeatherService,
    ) {}

    // Получить первые 20 образов
    async getPublicOutfits(): Promise<Outfit[]> {
    return this.outfitsService.getFilteredOutfits()
    }

    async getFilteredOutfits(season?: string, tags?: string, trend?: string) {
    return this.outfitsService.getFilteredOutfits(season, tags, trend);
    }

    async searchOutfits(query: string) {
    return this.outfitsService.searchOutfits(query);
    }

    async searchByColor(palette: any) {
    return this.outfitsService.searchOutfitsByColor(palette);
    }


    // 🔥 Рекомендации по погоде
    async getRecommendedOutfits(city?: string) {
        this.logger.log(`📌 Получаем рекомендации по погоде. Город: ${city || 'не указан'}`);

        let season = 'all';
        let weatherAdvice = ''; // Советы по погоде
        let tags = []; // Теги для поиска

        if (city) {
            try {
                const weather = await this.weatherService.getWeather(city);
                const temp = weather.main.temp;
                const weatherCondition = weather.weather[0].main.toLowerCase(); // Тип погоды (Rain, Clear, etc.)

                // Определяем сезон по температуре
                if (temp < 0) season = 'winter';
                else if (temp >= 0 && temp < 15) season = 'autumn';
                else if (temp >= 15 && temp < 25) season = 'spring';
                else season = 'summer';

                let tags: string[] = []; // ✅ Указываем, что это массив строк
                // 🔥 Дополнительные советы
                if (weatherCondition.includes('rain')) {
                    weatherAdvice = "🌧️ Don’t forget ur umbrella";
                }
                if (weatherCondition.includes('clear')) {
                    weatherAdvice = '☀️ Protect Your Vision from Harmful UV Rays by wearing sunglasses';
                    tags.push('sunglasses'); // Добавляем тег для поиска образов
                }

                if (weatherCondition.includes('clear') && temp > 25) {
                    weatherAdvice = '☀️ Don’t forget to wear a hat so you don’t get sunstroke!';
                }

                if (weatherCondition.includes('rain') && temp > 13) {
                    weatherAdvice += ' 🌦️ Nice day for a Trench Coat!';
                    tags.push('trench coat', 'trench');
                }

                this.logger.log(`📌 Температура: ${temp}°C, сезон: ${season}, погода: ${weatherCondition}`);
            } catch (error) {
                this.logger.warn(`⚠️ Ошибка при получении погоды: ${error.message}`);
            }
        }

        // Запрашиваем образы по сезону и тегам
        const recommendedOutfits = await this.outfitsService.getFilteredOutfits(season, tags.length ? tags.join(',') : undefined);

        return {
            outfits: recommendedOutfits,
            advice: weatherAdvice || '🔥 Удачного дня!', // Если нет совета, просто пожелание
        };
    }
/*     // Рекомендации по погоде
    async getRecommendedOutfits(city?: string) {
    this.logger.log(`📌 Получаем рекомендации по погоде. Город: ${city || 'не указан'}`);

    let season = 'all';

    if (city) {
        try {
            const weather = await this.weatherService.getWeather(city);
            const temp = weather.main.temp;

            if (temp < 0) season = 'winter';
            else if (temp >= 0 && temp < 15) season = 'autumn';
            else if (temp >= 15 && temp < 25) season = 'spring';
            else season = 'summer';

            this.logger.log(`📌 Температура: ${temp}°C, выбран сезон: ${season}`);
        } catch (error) {
            this.logger.warn(`⚠️ Ошибка при получении погоды: ${error.message}`);
        }
    }

    return this.outfitsService.getFilteredOutfits(season);
} */
}


