import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn  } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Outfit } from 'src/outfits/outfit.entity/outfit.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Outfit, (outfit) => outfit.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'outfit_id' })
  outfit: Outfit;
}



