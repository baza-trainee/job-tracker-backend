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

@Entity({ name: 'Note' })
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Note name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Note text content' })
  @Column({ type: 'text', nullable: true })
  text: string;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
