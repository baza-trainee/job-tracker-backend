import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Projects' })
export class Project {
  @ApiProperty({ description: 'Project ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Project name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'GitHub repository link' })
  @Column({ nullable: true })
  githubLink: string;

  @ApiProperty({ description: 'Live project URL' })
  @Column({ nullable: true })
  liveProjectLink: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.projects)
  user: User;

  @Column()
  userId: string;
}
