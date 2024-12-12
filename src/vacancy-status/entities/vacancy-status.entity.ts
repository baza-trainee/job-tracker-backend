import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';

export enum StatusName {
  SAVED = 'saved',
  RESUME = 'resume',
  HR = 'hr',
  TEST = 'test',
  TECH = 'tech',
  REJECT = 'reject',
  OFFER = 'offer',
}

export enum RejectReason {
  SOFT_SKILLS = 'SoftSkills',
  TECH_SKILLS = 'TechSkills',
  ENGLISH = 'English',
  EXPERIENCE = 'experience',
  STOPPED = 'stoped',
  NO_ANSWER = 'no_answer',
  OTHER = 'other',
}

@Entity({ name: 'VacancyStatus' })
export class VacancyStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: StatusName,
    default: StatusName.SAVED,
  })
  name: StatusName;

  @CreateDateColumn()
  date: Date;

  @Column({
    type: 'enum',
    enum: RejectReason,
    nullable: true,
  })
  rejectReason?: RejectReason;

  @Column({ nullable: true })
  resume?: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.statuses, { onDelete: 'CASCADE', eager: false })
  @JoinColumn()
  @Exclude()
  vacancy: Vacancy;
}
