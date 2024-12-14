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

@Entity({ name: 'Resume' })
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Resume name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Resume link/URL' })
  @Column()
  link: string;

  @ManyToOne(() => User, (user) => user.resumes)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
