import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outfit } from './outfit.entity/outfit.entity';
import { User } from '../users/user.entity';
import { Favorite } from './favorite.entity';
import { BadRequestException } from '@nestjs/common';
import { ILike } from 'typeorm';
import getImageColors from 'get-image-colors';
import * as ColorThief from 'color-thief-node';
//import axios from 'axios';
import sharp from 'sharp';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
//import * as fs from 'fs';

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const execPromise = promisify(exec);

async function removeBackground(filePath: string, outputPath: string) {
  // Проверим, существует ли файл
  if (!fs.existsSync(filePath)) {
    throw new Error('Файл не найден');
  }

  try {
    // Создаем FormData объект
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(filePath));

    // Используем axios для отправки запроса с локальным файлом
    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg', 
      formData, 
      { 
        headers: { 
          'X-Api-Key': 'N17D1T4oVHksNREYizJL1toj',
          ...formData.getHeaders() // Добавляем заголовки форм
        }, 
        responseType: 'stream',
      }
    );

    response.data.pipe(fs.createWriteStream(outputPath)); // Записываем результат
    return outputPath;
  } catch (error) {
    console.error('Ошибка при удалении фона:', error.response?.data || error);
    throw new Error('Ошибка при удалении фона');
  }
}

@Injectable()
export class OutfitsService {
  constructor(
    @InjectRepository(Outfit)
    private outfitsRepository: Repository<Outfit>,

    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
  ) {}

  /*1 async removeBackgroundAndSave(imageUrl: string): Promise<string> {
    try {
      const imagePath = path.join(__dirname, 'uploads', 'input_image.png');
      const outputImagePath = path.join(__dirname, 'uploads', 'output_image.png');

      const writer = fs.createWriteStream(imagePath);
      const response = await axios({ url: imageUrl, responseType: 'stream' });
      response.data.pipe(writer);
      
      writer.on('finish', () => {
        exec(
          `python process_image.py ${imagePath} ${outputImagePath}`,
          (error, stdout, stderr) => {
            if (error || stderr) {
              console.error(`Error processing image: ${stderr || error}`);
              throw new NotFoundException('Ошибка при обработке изображения');
            } else {
              console.log(`Image processed successfully: ${stdout}`);
            }
          }
        );
      });

      return outputImagePath; // Возвращаем путь к обработанному изображению
    } catch (error) {
      console.error('Error during background removal:', error);
      throw new NotFoundException('Ошибка при удалении фона');
    }
  } */
/*2 
    async removeBackgroundAndSave(filePath: string): Promise<string> {
      
      const outputPath = path.join(process.cwd(), 'uploads', 'output_image.png');
      try {
        // Вызов удаление фона
        const outputImage = await removeBackground(filePath, outputPath);
        console.log('Image saved to:', outputImage);
        return outputImage;
      } catch (error) {
        throw new Error('Ошибка при удалении фона');
      }
    } */

  async removeBackgroundAndSave(filePath: string): Promise<string> {
    const outputPath = path.resolve(process.cwd(), 'uploads', 'output_image.png'); // Абсолютный путь

    try {
        console.log(`Файл для обработки: ${filePath}`);
        console.log(`Файл будет сохранен в: ${outputPath}`);

        // Удаляем старый файл, если он существует
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log(`Старый файл ${outputPath} удален.`);
        }

        const outputImage = await removeBackground(filePath, outputPath);
        console.log(`Файл успешно сохранён: ${outputImage}`);

        // Ожидание записи файла
        await new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (fs.existsSync(outputPath)) {
                    clearInterval(interval);
                    console.log(`Файл доступен: ${outputPath}`);
                    resolve(null);
                }
            }, 500);
            setTimeout(() => {
                clearInterval(interval);
                reject(new Error(`Файл ${outputPath} так и не появился.`));
            }, 5000); // Ждем максимум 5 секунд
        });

        return outputPath;
    } catch (error) {
        console.error(`Ошибка при удалении фона: ${error.message}`);
        throw new Error('Ошибка при удалении фона');
    }
}

  // Извлечение цветов из обработанного изображения

  async extractColors(imageUrl: string): Promise<string[]> {
    try {
        const processedImagePath = await this.removeBackgroundAndSave(imageUrl);

        console.log(`Изображение для извлечения цветов: ${processedImagePath}`);

        // Проверяем, существует ли файл
        if (!fs.existsSync(processedImagePath)) {
            throw new Error(`Файл не найден: ${processedImagePath}`);
        }

        // Ждем, пока файл станет доступен для чтения
        await new Promise((resolve, reject) => {
            let attempts = 0;
            const interval = setInterval(() => {
                if (fs.existsSync(processedImagePath)) {
                    clearInterval(interval);
                    resolve(null);
                }
                attempts++;
                if (attempts > 10) {
                    clearInterval(interval);
                    reject(new Error(`Файл ${processedImagePath} так и не появился.`));
                }
            }, 500);
        });

        const colors = await getImageColors(processedImagePath);
        console.log(`Извлеченные цвета: ${colors.map(c => c.hex())}`);

        return colors.map(color => color.hex());
    } catch (error) {
        console.error('Ошибка при извлечении цветов:', error);
        throw new Error('Ошибка при извлечении цветов');
    }
}


/* 2  async extractColors(imageUrl: string): Promise<string[]> {
    try {
        const processedImagePath = await this.removeBackgroundAndSave(imageUrl);
        
        // Проверяем, что файл существует перед попыткой извлечения цветов
        if (!fs.existsSync(processedImagePath)) {
            throw new Error(`Файл для извлечения цветов не найден: ${processedImagePath}`);
        }

        console.log(`Файл найден, путь: ${processedImagePath}`);

        // Убеждаемся, что изображение полностью записано перед обработкой
        await new Promise((resolve, reject) => {
            fs.access(processedImagePath, fs.constants.F_OK, (err) => {
                if (err) reject(`Файл не доступен: ${processedImagePath}`);
                else resolve(null);
            });
        });

        // Извлекаем цвета
        const colors = await getImageColors(processedImagePath);
        console.log(`Извлеченные цвета: ${colors.map(color => color.hex())}`);

        return colors.map(color => color.hex());
    } catch (error) {
        console.error('Ошибка при извлечении цветов:', error);
        throw new Error('Ошибка при извлечении цветов');
    }
} */

  /*1 async extractColors(imageUrl: string): Promise<string[]> {
    try {
      const processedImagePath = await this.removeBackgroundAndSave(imageUrl);
      // Далее используем processedImagePath для извлечения цветов
      const colors = await getImageColors(processedImagePath); // Пример с использованием getImageColors
      return colors.map(color => color.hex());
    } catch (error) {
      console.error('Ошибка при извлечении цветов:', error);
      throw new Error('Ошибка при извлечении цветов');
    }
  } */

  async createOutfit(outfitData: any) {
    // Логика для извлечения цветов
    const colors = await this.extractColors(outfitData.imageUrl);
  
    // Создаем новый образ
    const outfit = this.outfitsRepository.create({
      ...outfitData,
      colors,  // Используем массив цветов
    });
  
    // Сохраняем образ в базе данных
    return this.outfitsRepository.save(outfit);
  }
  

/*   // Функция для удаления фона и сохранения изображения
  async removeBackgroundAndSave(imageUrl: string): Promise<string> {
    try {
      const imageBuffer = await this.downloadImage(imageUrl);
      const inputImagePath = path.join(__dirname, 'input_image.png');
      const outputImagePath = path.join(__dirname, 'output_image.png');
      
      // Сохраняем файл временно
      fs.writeFileSync(inputImagePath, imageBuffer);

      // Вызов Python скрипта для удаления фона
      await execPromise(`python process_image.py remove_background ${inputImagePath} ${outputImagePath}`);

      console.log(`Изображение с удалённым фоном сохранено по пути: ${outputImagePath}`);
      
      // Возвращаем путь к изображению с удалённым фоном
      return outputImagePath;
    } catch (error) {
      console.error('Ошибка при удалении фона:', error);
      throw new Error('Ошибка при обработке изображения');
    }
  }

  // Функция для загрузки изображения (сохранение в buffer)
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return response.data;
  }


  async removeWhiteBackground(imageUrl: string): Promise<Buffer> {
    // Путь к изображению временно сохранённому на сервере
    const imagePath = 'path_to_your_temp_image.png';
  
    // Вызываем Python скрипт для удаления фона
    const pythonScriptPath = 'process_image.py';
    const outputImagePath = 'path_to_output_image.png';
  
    // Запуск Python процесса для удаления фона
    const { exec } = require('child_process');
    const command = `python ${pythonScriptPath} remove_background ${imageUrl} ${outputImagePath}`;
  
    return new Promise((resolve, reject) => {
      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          reject(`Ошибка при удалении фона: ${error}`);
        }
        if (stderr) {
          reject(`Ошибка при удалении фона: ${stderr}`);
        }
  
        // Чтение результата изображения с удалённым фоном
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(outputImagePath);
        resolve(imageBuffer);
      });
    });
  }

  async extractColors(imageUrl: string): Promise<string[]> {
    try {
      // Загружаем изображение
      const imageBuffer = await sharp(imageUrl).toBuffer();  // Конвертируем изображение в buffer
      
      // Сохраняем изображение на диск, чтобы передать в ColorThief
      const tempImagePath = './temp_image.png';
      await sharp(imageBuffer).toFile(tempImagePath);  // Сохраняем временное изображение
      
      // Получаем доминирующий цвет
      const dominantColor = ColorThief.getColor(tempImagePath);  // Передаем путь к изображению, а не buffer
  
      // Преобразуем результат в строку формата hex
      const hexColor = `#${dominantColor.join('')}`;
  
      // Возвращаем массив с одним доминирующим цветом
      return [hexColor];
    } catch (error) {
      console.error('Ошибка при извлечении цветов:', error);
      throw new Error('Ошибка при извлечении цветов');
    }
  }
 */

  
/*   // Функция для извлечения цветов
  async extractColors(imageUrl: string): Promise<string[]> {
    try {
      const imageWithBackgroundRemoved = await this.removeBackgroundAndSave(imageUrl);  // Удаляем фон

      // Вызов Python скрипта для извлечения цветов
      const { stdout } = await execPromise(`python process_image.py extract_colors ${imageWithBackgroundRemoved}`);
      const colors = JSON.parse(stdout);

      console.log('Извлечённые цвета:', colors);
      return colors;
    } catch (error) {
      console.error('Ошибка при извлечении цветов:', error);
      throw new Error('Ошибка при извлечении цветов');
    }
  } */
  // Функция для извлечения цветов и преобразования их в формат HEX
/* async extractColors(imageUrl: string): Promise<string[]> {
  try {
    const imageBuffer = await this.removeWhiteBackground(imageUrl); // Удаляем фон

    // Получаем палитру цветов
    //const colors = await ColorThief.getPalette(imageBuffer, 5);  // Получаем 5 доминирующих цветов
    // Получаем доминирующий цвет (цвет для общего фона)
    const dominantColor = ColorThief.getColor(imageBuffer);  // Получаем доминирующий цвет

    //const dominantColor = colorThief.getColor(imageBuffer);

    // Преобразуем каждый цвет в формат HEX
    const hexColors = dominantColor.map((color: [number, number, number]) => {
      return `#${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`;
    });

    return hexColors;
  } catch (error) {
    console.error('Ошибка при извлечении цветов:', error);
    throw new Error('Ошибка при извлечении цветов');
  }
} */


/*   // Функция для извлечения цветов из изображения
  async extractColors(imageUrl: string): Promise<string[]> {
    try {
      const imageBuffer = await this.removeWhiteBackground(imageUrl); // Удаляем белый фон

      // Получаем палитру цветов
      const colors = await getImageColors(imageBuffer);
      
      // Извлекаем цвета, фильтруя белые (если это необходимо)
      const filteredColors = colors
        .map(color => color.hex())
        .filter(color => color !== '#FFFFFF' && !this.isWhiteColor(color));

      return filteredColors;
    } catch (error) {
      console.error('Ошибка при извлечении цветов:', error);
      throw new Error('Ошибка при извлечении цветов');
    }
  }

  // Функция для проверки белого цвета (если нужно)
  private isWhiteColor(color: string): boolean {
    return color === '#FFFFFF';
  } */


 
  // Получить первые 20 образов
  async getPublicOutfits(): Promise<Outfit[]> {
    return this.outfitsRepository.find({
      take: 20,
      order: { createdAt: 'DESC' },
    });
  }

  // Получить образы текущего пользователя
  async getUserOutfits(userId: number) {
    return this.outfitsRepository.find({
      where: { user: { id: userId } }, // Теперь проверяем id вместо sub
    });
  }
  

  /*// Добавить новый образ
  async createOutfit(user: User, outfitData: Partial<Outfit>): Promise<Outfit> {
    const outfit = this.outfitsRepository.create({ ...outfitData, user });
    return this.outfitsRepository.save(outfit);
  }*/
/*   async createOutfit(outfitData: Partial<Outfit>): Promise<Outfit> {
      const colors = await this.extractColors(outfitData.imageUrl || '');
      const outfit = this.outfitsRepository.create({ ...outfitData, colors });
      return this.outfitsRepository.save(outfit); 
}*/
  
    


  // Удалить образ (только владелец)
  async deleteOutfit(user: User, id: number): Promise<void> {
    const outfit = await this.outfitsRepository.findOne({ where: { id }, relations: ['user'] });

    if (!outfit) throw new NotFoundException('Образ не найден');
    if (outfit.user.id !== user.id) throw new ForbiddenException('Нет прав на удаление');

    await this.outfitsRepository.remove(outfit);
  }

/*   // Добавить образ в избранное (позже добавим логику)
  async addToFavorites(user: User, outfitId: number): Promise<void> {
    const outfit = await this.outfitsRepository.findOne({ where: { id: outfitId } });
    if (!outfit) throw new Error('Outfit not found');
  
    // Проверяем, есть ли уже этот outfit в избранном у пользователя
    const alreadyFavorited = await this.favoritesRepository.findOne({
      where: { user: { id: user.id }, outfit: { id: outfitId } },
    });
  
    if (alreadyFavorited) {
      throw new Error('Outfit already in favorites');
    }
  
    // Создаем новую запись избранного с userId
    const favorite = this.favoritesRepository.create({
      user: user, // 👈 Здесь теперь передается user
      outfit: outfit,
    });
  
    await this.favoritesRepository.save(favorite);
  
    outfit.favoritesCount += 1;
    await this.outfitsRepository.save(outfit);

    // Увеличиваем рейтинг (количество избранных)
    outfit.rating += 1;
    await this.outfitsRepository.save(outfit);
  }
  
  //удалить из изб

  async removeFromFavorites(user: User, outfitId: number): Promise<void> {
    const outfit = await this.outfitsRepository.findOne({ where: { id: outfitId } });

    if (!outfit) {
        throw new NotFoundException('❌ Образ не найден!');
    }

    const favorite = await this.favoritesRepository.findOne({ 
        where: { user: { id: user.id }, outfit: { id: outfitId } } 
    });

    if (!favorite) {
        throw new NotFoundException('❌ Этот образ не в избранном!');
    }

    await this.favoritesRepository.delete({ user: { id: user.id }, outfit: { id: outfitId } });

    // Уменьшаем количество добавлений в избранное
    outfit.favoritesCount = Math.max(0, outfit.favoritesCount - 1);

    // Уменьшаем рейтинг (но не ниже 0)
    outfit.rating = Math.max(0, outfit.rating - 1);
    
    await this.outfitsRepository.save(outfit);
}

  //показать все изб образы
  async getUserFavorites(user: User): Promise<Outfit[]> {
    const favorites = await this.favoritesRepository.find({ where: { user: { id: user.id } }, relations: ['outfit'] });
    return favorites.map(fav => fav.outfit);
  } */
  // по айди образ
  async getOutfitById(outfitId: number): Promise<Outfit> {
    const outfit = await this.outfitsRepository.findOne({ where: { id: outfitId } });

    if (!outfit) {
        throw new NotFoundException('❌ Образ не найден!');
    }

    return outfit;
}

  
  //фильтрация

  async getFilteredOutfits(season?: string, tags?: string, trend?: string): Promise<Outfit[]> {
    const query = this.outfitsRepository.createQueryBuilder('outfit');
  
    if (season) {
      query.andWhere('LOWER(outfit.season) = LOWER(:season)', { season });
    }
  
    if (trend) {
      query.andWhere('LOWER(outfit.trend) = LOWER(:trend)', { trend });
    }
  
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
  
      query.andWhere(
        tagsArray
          .map((tag, index) => `EXISTS (SELECT 1 FROM json_each(outfit.tags) WHERE LOWER(json_each.value) = LOWER(:tag${index}))`)
          .join(' OR '),
        Object.fromEntries(tagsArray.map((tag, index) => [`tag${index}`, tag])),
      );
    }
  
    console.log('🔥 Фильтрация с параметрами перед SQL:', { season, tags, trend });
    console.log('🔥 Сформированный SQL-запрос:', query.getSql());
  
    const results = await query.getMany();
    console.log('🔥 Результаты после фильтрации:', results);
  
    return results;
  }
  
  
  //поиск
  // по тегам, названию, сезону, трендам
  async searchOutfits(query: string): Promise<Outfit[]> {
    if (!query) {
        throw new BadRequestException('❌ Поисковый запрос не должен быть пустым!');
    }

    console.log(`🔥 Ищем по запросу: ${query}`);

    const results = await this.outfitsRepository.find({
        where: [
            { title: ILike(`%${query}%`) },  
            { tags: ILike(`%${query}%`) },   
            { season: ILike(`%${query}%`) }, 
            { trend: ILike(`%${query}%`) }   
        ],
        order: { rating: 'DESC' }  
    });

    console.log(`🔥 Найдено образов: ${results.length}`);
    return results;
}

async searchOutfitsByColor(palette: any): Promise<Outfit[]> {
  if (!Array.isArray(palette)) {
    throw new Error('Палитра цветов должна быть массивом');
  }

  const query = this.outfitsRepository.createQueryBuilder('outfit');

  palette.forEach((color, index) => {
    query.orWhere(`outfit.colors LIKE :color${index}`, { [`color${index}`]: `%${color}%` });
  });

  const results = await query.getMany();
  return results;
}


  
}
