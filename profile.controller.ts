import { Controller, Post, UseInterceptors, UploadedFile, Req, UseGuards, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  //получение данных профиля
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.profileService.getProfile(user.id);
  }

  @Post('upload-avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req: Request, file, callback) => {
        if (!req.user) {
          return callback(new Error('User not authenticated'), '');
        }
        const user = req.user as any; // Явно указываем, что у user есть id
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${user.id}-${uniqueSuffix}${ext}`; // Правильное формирование имени
        callback(null, filename);
      },
    }),
  }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const user = req.user as any;
    const filePath = `/uploads/avatars/${file.filename}`;

    // ✅ Обновляем путь к файлу в БД
    await this.profileService.updateAvatar(user.id, filePath);

    return {
      message: 'Avatar uploaded successfully',
      filePath: filePath, // Правильное сохранение пути
    };
  }


}
