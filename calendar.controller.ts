import { Controller, Get, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';
import { Outfit } from '../outfits/outfit.entity/outfit.entity';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // Получить все запланированные образы на сегодня
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserCalendar(@GetUser() user: User) {
    return this.calendarService.getUserCalendar(user.id);
  }

  // Добавить образ в календарь
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addToCalendar(
    @GetUser() user: User,
    @Body() { outfitId, date, note }: { outfitId: number, date: string, note: string },
  ) {
    const outfit = new Outfit(); // Здесь нужно получить образ по outfitId
    outfit.id = outfitId;

    return this.calendarService.addToCalendar(user.id, outfit, date, note);
  }

  // Удалить образ из календаря
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeFromCalendar(@GetUser() user: User, @Param('id') calendarId: number) {
    return this.calendarService.removeFromCalendar(user.id, calendarId);
  }

  // Пометить день как знаменательный
  @UseGuards(JwtAuthGuard)
  @Post('mark-important/:date')
  async markAsImportant(@GetUser() user: User, @Param('date') date: string) {
    return this.calendarService.markAsImportant(user.id, date);
  }

  // Добавить заметку в день
  @UseGuards(JwtAuthGuard)
  @Post('add-note')
  async addNote(
    @GetUser() user: User,
    @Body() { date, note }: { date: string, note: string },
  ) {
    return this.calendarService.addNoteToDay(user.id, date, note);
  }
}
