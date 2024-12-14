import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'Predictions' })
export class Prediction {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Prediction text in Ukrainian' })
  @Column({ type: 'text' })
  textUk: string;

  @ApiProperty({ description: 'Prediction text in English' })
  @Column({ type: 'text' })
  textEn: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.predictions, { onDelete: 'CASCADE' })
  user: User;
}
