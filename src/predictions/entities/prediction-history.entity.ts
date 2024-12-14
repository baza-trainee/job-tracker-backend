import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Prediction } from './prediction.entity';

@Entity({ name: 'PredictionHistory' })
export class PredictionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Prediction)
  prediction: Prediction;

  @CreateDateColumn()
  shownAt: Date;
}
