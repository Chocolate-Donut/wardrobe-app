import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


