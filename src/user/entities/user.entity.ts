import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity({ name: 'User' })
export class User {
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'User`s username' })
  @Column({ nullable: true })
  username: string;

  @ApiProperty({ description: 'User`s email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User`s password' })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'User`s avatar' })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ type: () => [Vacancy], description: 'User vacancies' })
  @OneToMany(() => Vacancy, (vacancy) => vacancy.user)
  vacancies: Vacancy[];

  @ApiProperty({ type: () => [Project], description: 'User projects' })
  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;
}
