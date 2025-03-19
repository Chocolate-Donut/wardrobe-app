import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar } from './calendar.entity';
import { User } from '../users/user.entity';
import { Outfit } from '../outfits/outfit.entity/outfit.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
  ) {}

  // Получить запланированные образы на сегодня
  async getUserCalendar(userId: number): Promise<Calendar[]> {
    return this.calendarRepository.find({ where: {user: { id: userId }}, relations: ['outfits'] });
  }

  // Добавить образ в календарь
  async addToCalendar(userId: number, outfit: Outfit, date: string, note: string): Promise<Calendar> {
    const calendarEntry = this.calendarRepository.create({
      date,
      note,
      user: { id: userId },
      outfits: [outfit],
    });

    return this.calendarRepository.save(calendarEntry);
  }

  // Удалить образ из календаря
  async removeFromCalendar(userId: number, calendarId: number): Promise<void> {
    await this.calendarRepository.delete({ id: calendarId, user: { id: userId } });
  }

  // Пометить день как значимый
  async markAsImportant(userId: number, date: string): Promise<void> {
    const calendarEntry = await this.calendarRepository.findOne({ where: { user: { id: userId }, date } });
    if (calendarEntry) {
      calendarEntry.isImportant = true;
      await this.calendarRepository.save(calendarEntry);
    }
  }

  // Добавить заметку
  async addNoteToDay(userId: number, date: string, note: string): Promise<void> {
    const calendarEntry = await this.calendarRepository.findOne({ where: { user: { id: userId }, date } });
    if (calendarEntry) {
      calendarEntry.note = note;
      await this.calendarRepository.save(calendarEntry);
    }
  }
}
