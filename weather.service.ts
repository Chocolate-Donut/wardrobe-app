import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getWeather(city: string): Promise<any> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }
  
}
