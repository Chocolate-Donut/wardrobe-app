import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Outfit } from '../outfits/outfit.entity/outfit.entity';

@Entity()
export class Calendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string; // Дата в формате YYYY-MM-DD

  @Column({ nullable: true })
  note: string; // Заметка

  @ManyToOne(() => User, (user) => user.calendar)
  user: User; // Пользователь

  @OneToMany(() => Outfit, (outfit) => outfit.calendar)
  outfits: Outfit[]; // Образы, добавленные в этот день

  @Column({ default: false }) // Добавляем поле для значимости дня
  isImportant: boolean;
}
