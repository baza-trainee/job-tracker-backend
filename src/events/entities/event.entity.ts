import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'Event' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Event name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Event text content' })
  @Column({ type: 'text', nullable: true })
  text: string;

  @ApiProperty({ description: 'Event date' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ description: 'Event time' })
  @Column({ type: 'time' })
  time: string;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
