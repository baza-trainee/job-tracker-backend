import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';
import { Resume } from '../../resume/entities/resume.entity';
import { CoverLetter } from '../../cover-letter/entities/cover-letter.entity';
import { Project } from '../../projects/entities/project.entity';
import { Note } from '../../notes/entities/note.entity';
import { Event } from '../../events/entities/event.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';

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

  @Column({ nullable: true })
  phone: string;


  @ApiProperty({ description: 'User`s social media links' })
  @Column('json', { nullable: true })
  socials: Array<{ id: string; name: string; link: string }>;

  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'User`s reset token' })
  @Column({ nullable: true })
  resetToken: string;

  @ApiProperty({ description: 'User`s reset token expiry' })
  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @ApiProperty({ description: 'User`s invalidated tokens' })
  @Column('simple-array', { nullable: true })
  invalidatedTokens: string[];

  @ApiProperty({ description: 'User`s google id' })
  @Column({ nullable: true })
  googleId: string;

  @ApiProperty({ type: () => [Vacancy], description: 'User vacancies' })
  @OneToMany(() => Vacancy, (vacancy) => vacancy.user, { onDelete: 'CASCADE' })
  vacancies: Vacancy[];

  @OneToMany(() => Resume, (resume) => resume.user, { onDelete: 'CASCADE' })
  resumes: Resume[];

  @OneToMany(() => CoverLetter, (coverLetter) => coverLetter.user, { onDelete: 'CASCADE' })
  coverLetters: CoverLetter[];

  @OneToMany(() => Project, (project) => project.user, { onDelete: 'CASCADE' })
  projects: Project[];

  @ApiProperty({ type: () => [Note], description: 'User notes' })
  @OneToMany(() => Note, (note) => note.user, { onDelete: 'CASCADE' })
  notes: Note[];

  @ApiProperty({ type: () => [Event], description: 'User events' })
  @OneToMany(() => Event, (event) => event.user, { onDelete: 'CASCADE' })
  events: Event[];

  @OneToMany(() => Prediction, (prediction) => prediction.user, { onDelete: 'CASCADE' })
  predictions: Prediction[];

  @CreateDateColumn()
  createdAt: Date;
}
