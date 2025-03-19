import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Favorite } from '../favorite.entity';
import { Calendar } from '../../calendar/calendar.entity'; // Импортируем Calendar

@Entity()
export class Outfit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  imageUrl: string;

/*   @Column('simple-array', { nullable: true })
  colors: string[]; // Теперь это будет массив строк */
  @Column('simple-array')
  colors: string[];
  
  @Column({ type: 'simple-json' }) // 👈 Изменили тип на JSON
  tags: string[];

  @Column()
  season: string; // Например: "Зима", "Лето", "Весна", "Осень"

  @Column()
  trend: string; // Например: "Casual", "Streetwear", "Classic"

  @ManyToOne(() => User, (user) => user.outfits, { nullable: true }) // Образ может принадлежать пользователю, но не обязательно
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  favoritesCount: number;

  @OneToMany(() => Favorite, (favorite) => favorite.outfit, { cascade: true })
  favorites: Favorite[];

  @ManyToOne(() => Calendar, (calendar) => calendar.outfits) // Связь с Calendar
  calendar: Calendar; // Связь с календарем

}


