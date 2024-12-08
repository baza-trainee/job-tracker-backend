import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'Vacancy' })
export class Vacancy {
  @ApiProperty({ description: 'Vacancy ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Vacancy title' })
  @Column()
  vacancy: string;

  @ApiProperty({ description: 'Company name' })
  @Column()
  company: string;

  @ApiProperty({ description: 'Job location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'Application status' })
  @Column()
  status: string;

  @ApiProperty({ 
    description: 'User who created the vacancy',
    type: () => User
  })
  @ManyToOne(() => User, (user) => user.vacancies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;
}
